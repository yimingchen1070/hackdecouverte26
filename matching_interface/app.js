const profiles = [
  {
    name: "Thomas Kolivakis",
    age: 18,
    distance: "",
    city: "Montréal",
    bio: "Toujours partante pour un café, une expo ou un billet de train pris sur un coup de tête. ☕️",
    interests: ["Art & culture", "Voyages", "Brunch"],
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    name: "Léa",
    age: 25,
    distance: "À 5 km",
    city: "Montréal",
    bio: "Photographe amateur, pro des playlists et à la recherche des meilleurs tacos de la ville. 🌮",
    interests: ["Photographie", "Musique", "Cuisine"],
    photos: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1526510747491-58f928ec870f?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    name: "Noah",
    age: 28,
    distance: "À 2 km",
    city: "Montréal",
    bio: "Architecte le jour, chef de pâtes fraîches le dimanche. Je connais un joli coin au bord du canal. 🍝",
    interests: ["Architecture", "Vélo", "Cuisine"],
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    name: "Inès",
    age: 27,
    distance: "À 7 km",
    city: "Montréal",
    bio: "Je collectionne les plantes et les petites adresses gourmandes. La prochaine découverte, c’est avec toi ? 🌿",
    interests: ["Nature", "Lecture", "Café"],
    photos: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    name: "Jules",
    age: 29,
    distance: "À 4 km",
    city: "Montréal",
    bio: "Aventurier du dimanche, fan de cinéma et convaincu qu’un bon dessert règle presque tout. 🍰",
    interests: ["Cinéma", "Randonnée", "Dessert"],
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    name: "Sarah",
    age: 26,
    distance: "À 6 km",
    city: "Montréal",
    bio: "Yoga au lever du soleil, concert le soir. Entre les deux, je trouve toujours le temps pour un latte. ✨",
    interests: ["Yoga", "Concerts", "Voyages"],
    photos: [
      "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85",
    ],
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
  super: document.querySelector("#super-button"),
};
let profileIndex = 0;
let photoIndex = 0;
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
    document.querySelector("#profile-count").textContent = "Découverte terminée";
    return;
  }

  card.hidden = false;
  card.setAttribute("aria-label", `Profil de ${profile.name}, ${profile.age} ans`);
  emptyState.hidden = true;
  photoIndex = 0;
  photo.style.backgroundImage = `url("${profile.photos[photoIndex]}")`;
  document.querySelector("#profile-name").textContent = `${profile.name},`;
  document.querySelector("#profile-age").textContent = profile.age;
  document.querySelector("#profile-distance").textContent = profile.distance;
  document.querySelector("#profile-city").textContent = profile.city;
  document.querySelector("#profile-bio").textContent = profile.bio;
  document.querySelector("#photo-number").textContent = "1";
  document.querySelector("#profile-interests").replaceChildren(
    ...profile.interests.map((interest) => {
      const tag = document.createElement("span");
      tag.textContent = interest;
      return tag;
    }),
  );
  document.querySelector("#profile-count").textContent = `${profiles.length - profileIndex} profils à découvrir`;
  undoButton.disabled = !previousAction;
}

function advance(action) {
  if (profileIndex >= profiles.length) return;
  const currentProfile = profiles[profileIndex];
  previousAction = { profileIndex, action };
  profileIndex += 1;
  renderProfile();

  if (action === "like") showToast(`Vous avez aimé le profil de ${currentProfile.name} ❤️`);
  if (action === "super") showToast(`Super coup de cœur envoyé à ${currentProfile.name} ✨`);
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

function showNextPhoto() {
  const profile = profiles[profileIndex];
  if (!profile) return;
  photoIndex = (photoIndex + 1) % profile.photos.length;
  photo.style.backgroundImage = `url("${profile.photos[photoIndex]}")`;
  document.querySelector("#photo-number").textContent = photoIndex + 1;
}

actionButtons.nope.addEventListener("click", () => swipe("nope"));
actionButtons.like.addEventListener("click", () => swipe("like"));
actionButtons.super.addEventListener("click", () => swipe("super"));
document.querySelector("#next-photo").addEventListener("click", (event) => {
  event.stopPropagation();
  showNextPhoto();
});

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
