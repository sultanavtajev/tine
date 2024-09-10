import { supabase } from "../../../lib/supabaseClient";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const produsent_id = searchParams.get("produsent_id");

  let producerCriteriaQuery = supabase
    .from("producer_criteria")
    .select("produsent_id, kriterie_id, oppfylt, oppfyllingsdato");

  // Hvis produsent_id er spesifisert, legg til et filter for produsent_id
  if (produsent_id) {
    if (isNaN(produsent_id)) {
      return new Response(JSON.stringify({ error: "Invalid produsent_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    producerCriteriaQuery = producerCriteriaQuery.eq(
      "produsent_id",
      produsent_id
    );
  }

  // Hent oppfylte kriterier
  const { data: producerCriteria, error: producerCriteriaError } =
    await producerCriteriaQuery;

  if (producerCriteriaError) {
    return new Response(
      JSON.stringify({ error: producerCriteriaError.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Hent kriterienavn fra "criteria" tabellen
  const kriterieIds = producerCriteria.map((entry) => entry.kriterie_id);
  const { data: criteriaData, error: criteriaError } = await supabase
    .from("criteria")
    .select("id, name")
    .in("id", kriterieIds);

  if (criteriaError) {
    return new Response(JSON.stringify({ error: criteriaError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Kombiner kriterieinfo med oppfyllingsstatus og oppfyllingsdato
  const result = producerCriteria.map((entry) => ({
    produsent_id: entry.produsent_id,
    kriterie_id: entry.kriterie_id,
    name:
      criteriaData.find((kriterie) => kriterie.id === entry.kriterie_id)
        ?.name || "Ukjent",
    oppfylt: entry.oppfylt,
    oppfyllingsdato: entry.oppfyllingsdato,
  }));

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
