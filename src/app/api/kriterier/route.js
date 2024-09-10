import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  // Hent alle kriterier fra Supabase
  const { data, error } = await supabase.from("criteria").select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
