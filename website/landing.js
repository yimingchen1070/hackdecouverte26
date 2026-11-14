const isConfigured = window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY &&
  window.SUPABASE_PUBLISHABLE_KEY !== "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";

if (isConfigured && window.supabase) {
  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  client.auth.getSession().then(({ data: { session } }) => {
    if (session) window.location.replace("app.html");
  });
}
