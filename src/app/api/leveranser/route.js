import { supabase } from "../../../lib/supabaseClient";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const produsent_id = searchParams.get("produsent_id");

  let query = supabase.from("deliveries").select("*");

  // Hvis produsent_id er spesifisert, legg til filteret for produsent_id
  if (produsent_id) {
    query = query.eq("produsent_id", produsent_id);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
