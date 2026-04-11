import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = getSupabase();

  // Check if already saved
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("place_id", body.place_id)
    .single();

  if (existing) {
    return Response.json({ error: "Already saved" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert({
      user_id: userId,
      place_id: body.place_id,
      name: body.name,
      image_url: body.image_url,
      rating: body.rating,
      review_count: body.review_count,
      location: body.location,
      categories: body.categories,
      price: body.price,
      url: body.url,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
