import { supabase } from "../../../lib/supabaseClient";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const produsent_id = searchParams.get("produsent_id");

  let produsentQuery = supabase
    .from("producers")
    .select("id, type_melk, er_ny_produsent");

  // Sjekk om produsent_id er spesifisert
  if (produsent_id) {
    produsentQuery = produsentQuery.eq("id", produsent_id);
  }

  try {
    // Hent produsentinformasjon
    const { data: produsentData, error: produsentError } = await produsentQuery;

    if (produsentError) {
      throw new Error(produsentError.message);
    }

    if (!produsentData || produsentData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Ingen produsenter funnet" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const results = await Promise.all(
      produsentData.map(async (produsent) => {
        const produsent_id = produsent.id;
        const erGeitemelk = produsent.type_melk === "geit";
        const erNyProdusent = produsent.er_ny_produsent;

        console.log(
          `Henter data for produsent_id: ${produsent_id}, type melk: ${produsent.type_melk}, Ny produsent: ${erNyProdusent}`
        );

        // Hent leveranser per måned for produsenten
        const { data: deliveries, error: deliveriesError } = await supabase
          .from("deliveries")
          .select("leveringsdato, antall_liter")
          .eq("produsent_id", produsent_id);

        if (deliveriesError) {
          throw new Error(deliveriesError.message);
        }

        // Hent oppfylte kriterier per måned for produsenten
        const { data: producerCriteria, error: criteriaError } = await supabase
          .from("producer_criteria")
          .select("kriterie_id, oppfylt, oppfyllingsdato")
          .eq("produsent_id", produsent_id);

        if (criteriaError) {
          throw new Error(criteriaError.message);
        }

        // Gruppér dataene per måned
        const months = {};

        deliveries.forEach((delivery) => {
          if (delivery.leveringsdato) {
            const month = delivery.leveringsdato.slice(0, 7); // YYYY-MM format
            if (!months[month]) {
              months[month] = { antall_liter: 0, oppfylteKriterier: 0 };
            }
            months[month].antall_liter += delivery.antall_liter;
          }
        });

        producerCriteria.forEach((criterion) => {
          if (criterion.oppfyllingsdato) {
            const month = criterion.oppfyllingsdato.slice(0, 7); // YYYY-MM format
            if (!months[month]) {
              months[month] = { antall_liter: 0, oppfylteKriterier: 0 };
            }
            if (criterion.oppfylt) {
              months[month].oppfylteKriterier += 1;
            }
          }
        });

        // Beregn tillegg per måned
        const result = Object.keys(months).map((month) => {
          const { antall_liter, oppfylteKriterier } = months[month];

          // Sjekk om bærekraftstillegget skal være 4 øre pga. geitemelk eller ny produsent
          let tilleggPerLiter = 0;
          if (erGeitemelk || erNyProdusent) {
            tilleggPerLiter = 4;
          } else {
            tilleggPerLiter =
              oppfylteKriterier >= 4 ? 4 : oppfylteKriterier >= 2 ? 2 : 0;
          }

          const totalTillegg = antall_liter * (tilleggPerLiter / 100); // Tillegg i kroner

          return {
            month,
            oppfylteKriterier,
            tilleggPerLiter,
            totalTillegg,
          };
        });

        return {
          produsent_id,
          type_melk: produsent.type_melk,
          er_ny_produsent: produsent.er_ny_produsent,
          result,
        };
      })
    );

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Feil under behandling:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
