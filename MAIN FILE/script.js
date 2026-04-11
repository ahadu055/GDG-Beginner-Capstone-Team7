const API_KEY = '484df581042c3faf17f670f876837ae5';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesGrid = document.getElementById('moviesGrid');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const pageTitle = document.getElementById('pageTitle');
const genreSection = document.getElementById('genre-section');
const genreGrid = document.getElementById('genreGrid');
const homeView = document.getElementById('home-view');
const detailsView = document.getElementById('details-view');
const detailsContainer = document.getElementById('movie-details-container');
const backBtn = document.getElementById('back-home-btn');

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

const genresList = [
  { id: 28, name: "Action", icon: "⚡" },
  { id: 12, name: "Adventure", icon: "🧭" },
  { id: 16, name: "Animation", icon: "🎥" },
  { id: 35, name: "Comedy", icon: "😄" },
  { id: 80, name: "Crime", icon: "🔫" },
  { id: 99, name: "Documentary", icon: "📜" },
  { id: 18, name: "Drama", icon: "🎭" },
  { id: 10751, name: "Family", icon: "👨‍👩‍👧" },
  { id: 14, name: "Fantasy", icon: "🧙" },
  { id: 36, name: "History", icon: "📖" },
  { id: 27, name: "Horror", icon: "👻" },
  { id: 10402, name: "Music", icon: "🎵" },
  { id: 9648, name: "Mystery", icon: "🔍" },
  { id: 10749, name: "Romance", icon: "❤️" },
  { id: 878, name: "Science Fiction", icon: "🤖" },
  { id: 10770, name: "TV Movie", icon: "📺" },
  { id: 53, name: "Thriller", icon: "🕵️" },
  { id: 10752, name: "War", icon: "⚔️" },
  { id: 37, name: "Western", icon: "🤠" }
];
function showHome() {
  homeView.classList.remove('hidden');
  detailsView.classList.add('hidden');
  genreSection.classList.add('hidden');
  document.getElementById('searchInput').value = '';
  pageTitle.textContent = 'Popular Movies';
  fetchMovies('/movie/popular');
}

function loadCategory(category) {
  homeView.classList.remove('hidden');
  detailsView.classList.add('hidden');
  genreSection.classList.add('hidden');

  if (category === 'popular') {
    pageTitle.textContent = 'Popular Movies';
    fetchMovies('/movie/popular');
  } else if (category === 'top_rated') {
    pageTitle.textContent = 'Top Rated Movies';
    fetchMovies('/movie/top_rated');
  }
}

function showGenres() {
  homeView.classList.add('hidden');
  detailsView.classList.add('hidden');
  genreSection.classList.remove('hidden');
  pageTitle.textContent = "Browse by Genre";

  genreGrid.innerHTML = genresList.map(genre => `
    <div class="genre-card" onclick="loadGenre(${genre.id}, '${genre.name}')">
      <div>${genre.icon}</div>
      <p>${genre.name}</p>
    </div>
  `).join('');
}

function showWatchlist() {
  homeView.classList.remove('hidden');
  detailsView.classList.add('hidden');
  genreSection.classList.add('hidden');
  pageTitle.textContent = 'My Watchlist';
  displayMovies(watchlist);
}

function switchTab(type) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(type + '-tab').classList.add('active');

  if (type === 'tv') {
    pageTitle.textContent = 'Popular TV Shows';
    fetchTVShows();
  } else {
    showHome();
  }
}



async function fetchMovies(endpoint) {
  showLoading();
  try {
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    displayMovies(data.results);
  } catch (err) {
    showError("Failed to load movies");
  }
}

async function fetchTVShows() {
  showLoading();
  try {
    const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    displayMovies(data.results);        
  } catch (err) {
    showError("Failed to load TV Shows");
  }
}

async function loadGenre(genreId, genreName) {
  homeView.classList.remove('hidden');
  genreSection.classList.add('hidden');
  pageTitle.textContent = `${genreName} Movies`;
  showLoading();

  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US`);
    const data = await res.json();
    displayMovies(data.results);
  } catch (err) {
    showError("Failed to load genre");
  }
}



function displayMovies(movies) {
  loading.classList.add('hidden');
  if (movies.length === 0) {
    moviesGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#aaa;">No results found.</p>`;
    return;
  }

  moviesGrid.innerHTML = movies.map(item => {
    // TMDB uses 'title' for movies and 'name' for TV
    const displayName = item.title || item.name;
    // TV shows have 'first_air_date', movies have 'release_date'
    const type = (item.first_air_date || item.media_type === 'tv') ? 'tv' : 'movie';

    return `
      <div class="movie-card" onclick="showDetails(${item.id}, '${type}')">
        <img src="${item.poster_path ? IMAGE_BASE_URL + item.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" alt="${displayName}">
        <div class="movie-info">
          <h3>${displayName}</h3>
          <p class="rating">★ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</p>
        </div>
      </div>
    `;
  }).join('');
}

async function showDetails(id, type) {
  homeView.classList.add('hidden');
  detailsView.classList.remove('hidden');
  genreSection.classList.add('hidden');
  detailsContainer.innerHTML = "<p style='text-align:center;padding:40px;color:#aaa;'>Loading details...</p>";

  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits`
    );
    const data = await response.json();
    renderDetails(data, type);
  } catch (error) {
    console.error("Details fetch error:", error);
    detailsContainer.innerHTML = "<p style='color:#e50914;text-align:center;'>Error loading details.</p>";
  }
}

function renderDetails(item, type) {
  const displayName = item.title || item.name;
  
  // Handle different time formats for Movie vs TV
  const displayTime = item.runtime 
    ? item.runtime + ' min' 
    : (item.episode_run_time && item.episode_run_time.length > 0 ? item.episode_run_time[0] + ' min' : 'N/A');

  const castHTML = item.credits?.cast ? item.credits.cast.slice(0, 5).map(actor => `
    <div class="actor-card">
      <img src="${actor.profile_path ? IMAGE_BASE_URL + actor.profile_path : 'https://via.placeholder.com/150'}" alt="${actor.name}">
      <p><strong>${actor.name}</strong></p>
      <p class="role">${actor.character}</p>
    </div>
  `).join('') : '<p>No cast information available.</p>';

  detailsContainer.innerHTML = `
    <div class="details-card">
      <div class="poster-section">
        <img src="${IMAGE_BASE_URL + (item.poster_path || '')}" class="detail-img" alt="${displayName}">
      </div>
      
      <div class="info-section">
        <h1>${displayName}</h1>
        
        <div class="badges">
          <span class="badge rating ${getRatingColor(item.vote_average)}">
            ⭐ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
          </span>
          <span class="badge">${displayTime}</span>
          ${type === 'tv' ? `<span class="badge">${item.number_of_seasons} Seasons</span>` : ''}
        </div>

        <div class="genre-list">
          ${item.genres ? item.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('') : ''}
        </div>

        <h3>Overview</h3>
        <p class="overview-text">${item.overview || 'No overview available.'}</p>

        <h3>Top Cast</h3>
        <div class="cast-grid">
          ${castHTML}
        </div>

        <button class="watchlist-btn" onclick="toggleWatchlist(${item.id}, '${displayName.replace(/'/g, "\\'")}', '${type}')">
          ${watchlist.some(m => m.id === item.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </button>
      </div>
    </div>
  `;
}



function getRatingColor(vote) {
  if (vote >= 7.5) return "green";
  if (vote >= 5.5) return "orange";
  return "red";
}

function toggleWatchlist(id, title, type) {
  const exists = watchlist.findIndex(m => m.id === id);
  if (exists > -1) {
    watchlist.splice(exists, 1);
  } else {
    
    watchlist.push({ id, title, name: title, first_air_date: type === 'tv' ? true : false });
  }
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  

  showDetails(id, type);
}

function showLoading() {
  loading.classList.remove('hidden');
  moviesGrid.innerHTML = '';
  errorDiv.classList.add('hidden');
}

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.remove('hidden');
  loading.classList.add('hidden');
  moviesGrid.innerHTML = '';
}



let searchTimeout;
function handleLiveSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = document.getElementById('searchInput').value.trim();
    if (query.length >= 2) performSearch(query);
  }, 500);
}

async function performSearch(query) {
  homeView.classList.remove('hidden');
  detailsView.classList.add('hidden');
  genreSection.classList.add('hidden');
  pageTitle.textContent = `Results for "${query}"`;
  showLoading();

  try {
   
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    displayMovies(data.results.filter(item => item.media_type !== 'person'));
  } catch (err) {
    showError("Search failed");
  }
}

function searchMovies() {
  const query = document.getElementById('searchInput').value.trim();
  if (query) performSearch(query);
}

if (backBtn) {
  backBtn.addEventListener('click', () => {
    showHome();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  showHome();
});
