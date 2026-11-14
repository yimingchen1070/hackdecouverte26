const signupForm = document.querySelector("#signup-form");
const signupStatus = document.querySelector("#signup-status");
const supabaseReady = window.SUPABASE_PUBLISHABLE_KEY &&
  window.SUPABASE_PUBLISHABLE_KEY !== "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";

if (!supabaseReady) {
  signupStatus.textContent = "Add your Supabase publishable key in supabase-config.js before creating accounts.";
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseReady) return;

  const formData = new FormData(signupForm);
  const profile = {
    username: String(formData.get("username")).trim(),
    name: String(formData.get("name")).trim(),
    email: String(formData.get("email")).trim(),
    school: String(formData.get("school")).trim(),
    program: String(formData.get("program")).trim(),
    age: Number(formData.get("age")),
    languages: String(formData.get("languages")).split(",").map((language) => language.trim()).filter(Boolean),
  };
  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  signupStatus.textContent = "Creating your account…";

  const { data, error } = await client.auth.signUp({
    email: profile.email,
    password: String(formData.get("password")),
    options: {
      data: profile,
      emailRedirectTo: new URL("profile-setup.html", window.location.href).toString(),
    },
  });

  if (error) {
    signupStatus.textContent = error.message;
    return;
  }
  if (!data.session) {
    signupStatus.textContent = "The account was created, but Supabase did not return an active session. Please try signing in.";
    return;
  }

  const { error: profileError } = await client.from("profiles").upsert(
    { id: data.user.id, ...profile },
    { onConflict: "id" },
  );
  if (profileError) {
    signupStatus.textContent = `Your account is ready, but profile details could not be saved: ${profileError.message}`;
    return;
  }
  window.location.href = "profile-setup.html";
});
