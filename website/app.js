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
    document.querySelector("#signed-in-user").textContent = `Signed in as ${user.email}`;
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
