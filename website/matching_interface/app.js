const profiles = [
  {
    name: "Thomas",
    age: 18,
    program: "Arts and Science · Cegep Marianopolis",
    mainInterest: "Trivia",
    bio: "Rizz and revise. Looking for a 5h+ study partner. Down to conversate while studying. 10/10 only",
    photo: "images/thomas-kolivakis.png",
  },
  {
    name: "Nicole",
    age: 17,
    program: "Pure and Applied Science· Cegep Marianopolis",
    mainInterest: "Engineering",
    bio: "Looking for a new friends to study with",
    photo: "images/nicole.png",
  },
  {
    name: "Elmer",
    age: 17,
    program: "Pure and Applied Science· Cegep Marianopolis",
    mainInterest: "Planes and larp",
    bio: "Looking for someone to build drones ncp",
    photo: "images/elmer.png",
  },
  {
    name: "Lilya",
    age: 17,
    program: "Health Science · Cegep Dawson",
    mainInterest: "Neurosciences",
    bio: "I need to lock in for finals",
    photo: "images/lilya.png",
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

  if (action === "like") {
    showToast(`Invitation à réviser proposée à ${currentProfile.name} 📚`);
    window.parent.postMessage({
      type: "lockedin:study-invite",
      profile: {
        name: currentProfile.name,
        age: currentProfile.age,
        program: currentProfile.program,
        mainInterest: currentProfile.mainInterest,
      },
    }, "*");
  }
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
