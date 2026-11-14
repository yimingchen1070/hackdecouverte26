const appConfigured = window.SUPABASE_PUBLISHABLE_KEY &&
  window.SUPABASE_PUBLISHABLE_KEY !== "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";
let appClient;

if (appConfigured) {
  appClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  appClient.auth.getUser().then(({ data: { user } }) => {
    if (!user) {
      window.location.href = "signup.html";
      return;
    }
    loadProfile(user);
  });
}

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("main > section").forEach((section) => {
      section.hidden = section.id !== button.dataset.tab;
    });
  });
});

let remainingCandidates = 0;
function respondToCandidate() {
  remainingCandidates += 1;
  document.querySelector("#swipe-status").textContent = "Your response has been recorded in this prototype.";
  if (remainingCandidates >= 1) {
    document.querySelector("#candidate-card").hidden = true;
    document.querySelector("#swipe-status").textContent = "No more study buddy profiles are available yet.";
  }
}
document.querySelector("#pass-candidate").addEventListener("click", respondToCandidate);
document.querySelector("#like-candidate").addEventListener("click", respondToCandidate);

document.querySelector("#sign-out").addEventListener("click", async () => {
  if (appClient) await appClient.auth.signOut();
  window.location.href = "index.html";
});

async function loadProfile(user) {
  const status = document.querySelector("#profile-status");
  const { data: profile, error: profileError } = await appClient
    .from("profiles")
    .select("name, username, school, program, age, languages, academic_interests, linkedin_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    status.textContent = `Could not load your profile: ${profileError.message}`;
    return;
  }
  if (!profile) {
    status.textContent = "Your profile details are not available yet. Add them during profile setup.";
    return;
  }

  const name = profile.name || profile.username || user.email?.split("@")[0] || "Student";
  document.querySelector("#profile-name").textContent = name;
  document.querySelector("#profile-avatar").textContent = name.trim().charAt(0).toUpperCase() || "L";
  document.querySelector("#profile-handle").textContent = profile.username ? `@${profile.username}` : (user.email || "");
  document.querySelector("#profile-school").textContent = profile.school || "Not added yet";
  document.querySelector("#profile-program").textContent = profile.program || "Not added yet";
  document.querySelector("#profile-age").textContent = profile.age ? `${profile.age}` : "Not added yet";
  document.querySelector("#profile-languages").textContent = Array.isArray(profile.languages) ? profile.languages.join(", ") : (profile.languages || "Not added yet");

  const linkedin = document.querySelector("#profile-linkedin");
  if (profile.linkedin_url) {
    linkedin.href = profile.linkedin_url;
    linkedin.hidden = false;
  }
  const interests = document.querySelector("#profile-interests");
  const interestValues = Array.isArray(profile.academic_interests)
    ? profile.academic_interests
    : String(profile.academic_interests || "").split(",").map((item) => item.trim()).filter(Boolean);
  interests.replaceChildren(...(interestValues.length ? interestValues.map((item) => {
    const chip = document.createElement("span");
    chip.className = "interest-chip";
    chip.textContent = item;
    return chip;
  }) : [Object.assign(document.createElement("span"), { className: "muted-copy", textContent: "No interests added yet." })]));

  const { data: experiences, error: experienceError } = await appClient
    .from("experiences")
    .select("type, title, organization, description, start_date, end_date, is_current")
    .eq("profile_id", user.id)
    .order("start_date", { ascending: false, nullsFirst: false });
  const experienceList = document.querySelector("#experience-list");
  if (experienceError) {
    experienceList.textContent = `Could not load experiences: ${experienceError.message}`;
  } else if (!experiences?.length) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "muted-copy";
    emptyMessage.textContent = "No experiences yet. Add your education, clubs, volunteering, projects, or awards.";
    experienceList.replaceChildren(emptyMessage);
  } else {
    experienceList.replaceChildren(...experiences.map((item) => {
      const card = document.createElement("article");
      card.className = "experience-item";
      const marker = document.createElement("span");
      marker.className = "experience-marker";
      marker.setAttribute("aria-hidden", "true");
      const content = document.createElement("div");
      content.className = "experience-content";
      const label = document.createElement("p");
      label.className = "pixel-eyebrow";
      label.textContent = String(item.type || "experience").replaceAll("_", " ").toUpperCase();
      const title = document.createElement("h4");
      title.textContent = item.title;
      const organization = document.createElement("p");
      organization.className = "experience-organization";
      organization.textContent = item.organization || "";
      const dates = document.createElement("p");
      dates.className = "experience-dates";
      const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
      dates.textContent = [formatDate(item.start_date), item.is_current ? "Present" : formatDate(item.end_date)].filter(Boolean).join(" — ");
      content.append(label, title, organization, dates);
      if (item.description) {
        const description = document.createElement("p");
        description.className = "experience-description";
        description.textContent = item.description;
        content.append(description);
      }
      card.append(marker, content);
      return card;
    }));
  }
  status.textContent = `Profile loaded${user.email ? ` · ${user.email}` : ""}.`;
}
