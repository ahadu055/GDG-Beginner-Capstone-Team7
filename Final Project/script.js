const CONFIG = {
  KEY: "484df581042c3faf17f670f876837ae5",
  BASE: "https://api.themoviedb.org/3",
  IMG: "https://image.tmdb.org/t/p/w500",
  BLANK: "https://via.placeholder.com/500x750?text=No+Poster",
};

let state = {
  watchlist: JSON.parse(localStorage.getItem("aura_watchlist")) || [],
  lastResults: [],
};

const dom = {
  grid: document.getElementById("moviesGrid"),
  loader: document.getElementById("loading"),
  title: document.getElementById("pageTitle"),
  modal: document.getElementById("movieModal"),
  body: document.getElementById("modalBody"),
  input: document.getElementById("searchInput"),
};

async function api(path, params = "") {
  try {
    const res = await fetch(
      `${CONFIG.BASE}${path}?api_key=${CONFIG.KEY}&language=en-US${params}`,
    );
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function loadCategory(cat) {
  dom.input.value = "";
  showLoading(true);
  const data = await api(`/movie/${cat}`);
  state.lastResults = data.results;
  renderGrid(data.results);
  dom.title.textContent = cat.replace("_", " ").toUpperCase();
}

async function searchMovies() {
  const q = dom.input.value.trim();
  if (!q) return;
  showLoading(true);
  const data = await api("/search/movie", `&query=${encodeURIComponent(q)}`);
  state.lastResults = data.results;
  renderGrid(data.results);
  dom.title.textContent = `Search: ${q}`;
}

function renderGrid(movies) {
  showLoading(false);
  dom.grid.innerHTML = "";
  movies.forEach((m) => {
    const isSaved = state.watchlist.some((w) => w.id === m.id);
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
            <div class="card-img-container">
                <img src="${m.poster_path ? CONFIG.IMG + m.poster_path : CONFIG.BLANK}" loading="lazy">
                <button class="quick-save ${isSaved ? "active" : ""}" onclick="toggleSave(event, ${m.id})">
                    ${isSaved ? "❤️" : "♡"}
                </button>
            </div>
            <div class="movie-info">
                <h3>${m.title}</h3>
                <div class="rating">★ ${m.vote_average?.toFixed(1) || "N/A"}</div>
            </div>
        `;
    card.onclick = (e) => {
      if (e.target.tagName !== "BUTTON") openDetails(m.id);
    };
    dom.grid.appendChild(card);
  });
}

async function openDetails(id) {
  dom.body.innerHTML = `<div class="spinner"><div class="loader"></div></div>`;
  dom.modal.classList.remove("hidden");

  const [m, c, v] = await Promise.all([
    api(`/movie/${id}`),
    api(`/movie/${id}/credits`),
    api(`/movie/${id}/videos`),
  ]);

  const trailer = v.results.find((vid) => vid.type === "Trailer");
  const isSaved = state.watchlist.some((w) => w.id === m.id);

  dom.body.innerHTML = `
        <img src="${m.poster_path ? CONFIG.IMG + m.poster_path : CONFIG.BLANK}" class="modal-poster">
        <div class="details-content">
            <h2>${m.title}</h2>
            <p style="color:var(--gold); margin-bottom:10px">★ ${m.vote_average.toFixed(1)} | ${m.runtime} min</p>
            <p class="overview">${m.overview}</p>
            
            <div class="cast-section">
                <h3>Top Cast</h3>
                <div class="cast-scroll">
                    ${c.cast
                      .slice(0, 8)
                      .map(
                        (a) => `
                        <div class="cast-item">
                            <img src="${a.profile_path ? CONFIG.IMG + a.profile_path : "https://via.placeholder.com/100"}">
                            <span>${a.name}</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>

            <div style="margin-top:2rem; display:flex; gap:1rem;">
                ${trailer ? `<a href="https://youtube.com/watch?v=${trailer.key}" target="_blank" class="watchlist-btn" style="text-decoration:none">🎥 Trailer</a>` : ""}
                <button class="watchlist-btn" style="background:#444" onclick="toggleSave(null, ${m.id})">
                    ${isSaved ? "❤️ In Watchlist" : "⭐ Add to Watchlist"}
                </button>
            </div>
        </div>
    `;
}

function toggleSave(e, id) {
  if (e) e.stopPropagation();
  const movie =
    state.lastResults.find((m) => m.id === id) ||
    state.watchlist.find((m) => m.id === id);
  const idx = state.watchlist.findIndex((m) => m.id === id);

  if (idx > -1) state.watchlist.splice(idx, 1);
  else if (movie) state.watchlist.push(movie);

  localStorage.setItem("aura_watchlist", JSON.stringify(state.watchlist));

  if (dom.title.textContent === "MY WATCHLIST") showWatchlist();
  else renderGrid(state.lastResults); // Instant UI sync

  if (!dom.modal.classList.contains("hidden")) openDetails(id); // Sync modal button
}

function showWatchlist() {
  dom.title.textContent = "MY WATCHLIST";
  renderGrid(state.watchlist);
}

function showLoading(s) {
  dom.loader.classList.toggle("hidden", !s);
  if (s) dom.grid.innerHTML = "";
}
function closeModal() {
  dom.modal.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => loadCategory("popular"));
dom.modal.onclick = (e) => {
  if (e.target === dom.modal) closeModal();
};
