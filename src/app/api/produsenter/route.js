import { supabase } from "../../../lib/supabaseClient";

export async function GET(req, res) {
  // Hent alle produsenter fra Supabase
  const { data, error } = await supabase.from("producers").select("*");

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
