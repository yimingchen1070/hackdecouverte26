const profiles = [
  {
    name: "Thomas Kolivakis",
    age: 18,
    program: "Sciences de la nature · Cegep Marianopolis",
    mainInterest: "Trivia",
    bio: "Rizz and revise. Looking for a 5h+ study partner. Down to conversate while studying. 10/10 only",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Nicole",
    age: 17,
    program: "Design graphique · UQAM",
    mainInterest: "Illustration numérique",
    bio: "J'aime apprendre en échangeant des idées et en faisant des fiches colorées. Toujours partante pour une session de travail à la bibliothèque. ✏️",
    photo: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Noah",
    age: 28,
    program: "Architecture · Université de Montréal",
    mainInterest: "Architecture durable",
    bio: "J'aime travailler en équipe sur des projets et comparer nos méthodes de prise de notes. Café et révisions, ça te dit ? ☕",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Inès",
    age: 27,
    program: "Psychologie · Université de Montréal",
    mainInterest: "Neurosciences",
    bio: "J'apprends mieux en expliquant les notions à voix haute. On peut se motiver mutuellement pour les examens ! 🧠",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Jules",
    age: 29,
    program: "Génie logiciel · Polytechnique Montréal",
    mainInterest: "Programmation",
    bio: "J'aime résoudre des problèmes à plusieurs et partager des astuces de code. Dispo pour un sprint de révision ? 💻",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Sarah",
    age: 26,
    program: "Biologie · Université McGill",
    mainInterest: "Écologie",
    bio: "Je prépare des quiz pour réviser et j'adore étudier dehors quand il fait beau. On se fait une session productive ? 🌱",
    photo: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1000&q=85",
  },
];

const card = document.querySelector("#active-card");
const photo = document.querySelector("#card-photo");
const toast = document.querySelector("#toast");
const deck = document.querySelector("#deck");
const undoButton = document.querySelector("#undo-button");
const emptyState = document.querySelector("#empty-state");
const actionButtons = {
  nope: document.querySelector("#nope-button"),
  like: document.querySelector("#like-button"),
};
let profileIndex = 0;
let previousAction = null;
let pointerStart = null;
let toastTimeout;
let isAnimating = false;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 1900);
}

function renderProfile() {
  const profile = profiles[profileIndex];
  deck.querySelectorAll(".card-back").forEach((backCard) => { backCard.hidden = false; });
  if (!profile) {
    card.hidden = true;
    deck.querySelectorAll(".card-back").forEach((backCard) => { backCard.hidden = true; });
    emptyState.hidden = false;
    document.querySelector("#profile-count").textContent = "Tous les profils consultés";
    return;
  }

  card.hidden = false;
  card.setAttribute("aria-label", `Profil de ${profile.name}, ${profile.age} ans`);
  emptyState.hidden = true;
  photo.style.backgroundImage = `url("${profile.photo}")`;
  document.querySelector("#profile-name").textContent = `${profile.name},`;
  document.querySelector("#profile-age").textContent = profile.age;
  document.querySelector("#profile-program").textContent = profile.program;
  document.querySelector("#profile-interest").textContent = profile.mainInterest;
  document.querySelector("#profile-bio").textContent = profile.bio;
  document.querySelector("#profile-count").textContent = `${profiles.length - profileIndex} partenaires à découvrir`;
  undoButton.disabled = !previousAction;
}

function advance(action) {
  if (profileIndex >= profiles.length) return;
  const currentProfile = profiles[profileIndex];
  previousAction = { profileIndex, action };
  profileIndex += 1;
  renderProfile();

  if (action === "like") showToast(`Invitation à réviser proposée à ${currentProfile.name} 📚`);
}

function swipe(action) {
  if (profileIndex >= profiles.length || isAnimating) return;
  isAnimating = true;
  const direction = action === "nope" ? -1 : 1;
  const rotation = action === "nope" ? -12 : 12;
  const stamp = card.querySelector(action === "nope" ? ".nope-stamp" : ".like-stamp");
  stamp.style.opacity = "1";
  card.style.transition = "transform 260ms ease, opacity 260ms ease";
  card.style.transform = `translate(${direction * 120}%, 12px) rotate(${rotation}deg)`;
  card.style.opacity = "0";
  window.setTimeout(() => {
    card.style.transition = "";
    card.style.transform = "";
    card.style.opacity = "";
    stamp.style.opacity = "";
    advance(action);
    isAnimating = false;
  }, 260);
}

actionButtons.nope.addEventListener("click", () => swipe("nope"));
actionButtons.like.addEventListener("click", () => swipe("like"));

undoButton.addEventListener("click", () => {
  if (!previousAction) return;
  profileIndex = previousAction.profileIndex;
  previousAction = null;
  renderProfile();
  showToast("Votre dernier choix a été annulé");
});

document.querySelector("#reset-button").addEventListener("click", () => {
  if (isAnimating) return;
  profileIndex = 0;
  previousAction = null;
  renderProfile();
});

document.querySelector(".filter-button").addEventListener("click", () => {
  showToast("Les filtres seront bientôt disponibles");
});

card.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button") || profileIndex >= profiles.length) return;
  pointerStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  card.setPointerCapture(event.pointerId);
});

card.addEventListener("pointermove", (event) => {
  if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  const stamp = card.querySelector(deltaX < 0 ? ".nope-stamp" : ".like-stamp");
  card.style.transform = `translate(${deltaX}px, ${deltaY * 0.3}px) rotate(${deltaX * 0.045}deg)`;
  card.querySelectorAll(".swipe-stamp").forEach((item) => { item.style.opacity = "0"; });
  stamp.style.opacity = Math.min(Math.abs(deltaX) / 100, 1);
});

function endSwipe(event) {
  if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
  const deltaX = event.clientX - pointerStart.x;
  pointerStart = null;
  card.style.transform = "";
  card.querySelectorAll(".swipe-stamp").forEach((item) => { item.style.opacity = ""; });
  if (Math.abs(deltaX) > 90) swipe(deltaX > 0 ? "like" : "nope");
}

card.addEventListener("pointerup", endSwipe);
card.addEventListener("pointercancel", endSwipe);

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest("button, a")) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    swipe("nope");
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    swipe("like");
  }
});

renderProfile();
