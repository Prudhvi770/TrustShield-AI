// Checks that a scheduled/cron request is carrying the shared secret before
// letting it through. This has nothing to do with Supabase or MySQL — it
// used to live under src/integrations/supabase purely because that's where
// the project scaffold happened to put it. Moved here so it's easier to
// find next to the rest of the server-side helpers.
export async function authenticateCronRequest(request: Request): Promise<Response | null> {
  const currentSecret = process.env["LOVABLE_CRON_SECRET"];
  const previousSecret = process.env["LOVABLE_CRON_SECRET_PREVIOUS"];

  if (!currentSecret) {
    return new Response("Server configuration error", { status: 500 });
  }

  const match = /^Bearer ([^\s,]+)$/.exec(request.headers.get("authorization") ?? "");
  const token = match?.[1];
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Compare with a constant-time check so response timing can't leak how
  // many characters of the secret matched.
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  const providedDigest = digest(token);
  const currentMatches = timingSafeEqual(providedDigest, digest(currentSecret));
  const previousMatches = timingSafeEqual(providedDigest, digest(previousSecret ?? currentSecret));

  if (!currentMatches && !previousMatches) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null;
}
