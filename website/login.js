const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
const configured = window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY &&
  window.SUPABASE_PUBLISHABLE_KEY !== "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";

if (!configured) {
  loginStatus.textContent = "Supabase is not configured for this site yet.";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!configured) return;

  const values = new FormData(loginForm);
  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  loginStatus.textContent = "Logging in…";
  const { error } = await client.auth.signInWithPassword({
    email: String(values.get("email")).trim(),
    password: String(values.get("password")),
  });

  if (error) {
    loginStatus.textContent = error.message;
    return;
  }
  window.location.replace("app.html");
});
