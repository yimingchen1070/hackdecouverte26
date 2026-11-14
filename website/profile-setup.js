const profileStatus = document.querySelector("#profile-status");
const experienceForm = document.querySelector("#experience-form");
const configured = window.SUPABASE_PUBLISHABLE_KEY &&
  window.SUPABASE_PUBLISHABLE_KEY !== "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";
let client;
let user;

async function initializeProfileSetup() {
  if (!configured) {
    profileStatus.textContent = "Add your Supabase publishable key in supabase-config.js to continue.";
    return;
  }
  client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    profileStatus.textContent = "No active account session was found. Return to the sign-up page and try again.";
    return;
  }
  user = session.user;
  const { data: existingProfile, error: lookupError } = await client
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (lookupError) {
    profileStatus.textContent = `Could not load your profile: ${lookupError.message}`;
    return;
  }
  if (!existingProfile && user.user_metadata) {
    const metadata = user.user_metadata;
    const { error } = await client.from("profiles").insert({
      id: user.id,
      name: metadata.name || metadata.username || user.email?.split("@")[0] || "Student",
      username: metadata.username,
      email: metadata.email || user.email,
      school: metadata.school,
      program: metadata.program,
      age: metadata.age,
      languages: metadata.languages,
    });
    if (error) {
      profileStatus.textContent = `Your account is ready, but profile details could not be saved: ${error.message}`;
      return;
    }
  }
  profileStatus.textContent = `Signed in as ${user.email}. Add any education or experience entries you want.`;
  experienceForm.hidden = false;
}

experienceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!user) return;
  const values = new FormData(experienceForm);
  const entry = {
    profile_id: user.id,
    type: values.get("type"),
    title: String(values.get("title")).trim(),
    organization: String(values.get("organization")).trim() || null,
    description: String(values.get("description")).trim() || null,
    start_date: values.get("start_date") || null,
    end_date: values.get("end_date") || null,
    is_current: values.get("is_current") === "on",
  };
  const { error } = await client.from("experiences").insert(entry);
  profileStatus.textContent = error ? error.message : "Experience saved.";
  if (!error) experienceForm.reset();
});

initializeProfileSetup();
