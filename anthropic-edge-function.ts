// ============================================================
//  BATIMA — Edge Function "anthropic"
//  Rôle : appeler l'API Anthropic avec la clé SECRÈTE qui reste
//  côté serveur. L'app n'a jamais accès à la clé.
//
//  Déploiement : voir les instructions fournies dans le chat.
//  Secret requis : ANTHROPIC_API_KEY  (= ta clé sk-ant-...)
// ============================================================

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Pré-vol CORS (navigateur)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY non configurée côté serveur" }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    // On transmet tel quel le corps envoyé par l'app (messages, model, etc.)
    const body = await req.text();

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    // On renvoie la réponse d'Anthropic telle quelle à l'app
    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});
