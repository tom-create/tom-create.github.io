// Minimal client-side behavior for the personal site.

const PROJECTS = [
  {
    emoji: "🧪",
    title: "Experiments",
    desc: "Small demos and prototypes exploring new web ideas.",
  },
  {
    emoji: "📝",
    title: "Notes",
    desc: "Short write-ups on things I'm learning along the way.",
  },
  {
    emoji: "🛠️",
    title: "Tools",
    desc: "Handy utilities I've built to make my own life easier.",
  },
];

function renderProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  grid.innerHTML = PROJECTS.map(
    (p) => `
      <article class="card">
        <div class="card__emoji" aria-hidden="true">${p.emoji}</div>
        <h3 class="card__title">${p.title}</h3>
        <p class="card__desc">${p.desc}</p>
      </article>
    `
  ).join("");
}

function setupThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);
  updateIcon();

  toggle.addEventListener("click", () => {
    const next =
      root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateIcon();
  });

  function updateIcon() {
    const icon = toggle.querySelector(".theme-toggle__icon");
    if (!icon) return;
    icon.textContent =
      root.getAttribute("data-theme") === "light" ? "☀️" : "🌙";
  }
}

function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  setupThemeToggle();
  setYear();
});
