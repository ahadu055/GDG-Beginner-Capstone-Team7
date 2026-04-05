// ====================== MIKIYAS - SEARCH & CATEGORIES ======================

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

// Genres List
const genresList = [
  { id: 28,  name: "Action",        icon: "⚡" },
  { id: 12,  name: "Adventure",     icon: "🧭" },
  { id: 16,  name: "Animation",     icon: "🎥" },
  { id: 35,  name: "Comedy",        icon: "😄" },
  { id: 80,  name: "Crime",         icon: "🔫" },
  { id: 99,  name: "Documentary",   icon: "📜" },
  { id: 18,  name: "Drama",         icon: "🎭" },
  { id: 10751, name: "Family",      icon: "👨‍👩‍👧" },
  { id: 14,  name: "Fantasy",       icon: "🧙" },
  { id: 36,  name: "History",       icon: "📖" },
  { id: 27,  name: "Horror",        icon: "👻" },
  { id: 10402, name: "Music",       icon: "🎵" },
  { id: 9648, name: "Mystery",      icon: "🔍" },
  { id: 10749, name: "Romance",     icon: "❤️" },
  { id: 878,  name: "Science Fiction", icon: "🤖" },
  { id: 10770, name: "TV Movie",    icon: "📺" },
  { id: 53,  name: "Thriller",      icon: "🕵️" },
  { id: 10752, name: "War",         icon: "⚔️" },
  { id: 37,  name: "Western",       icon: "🤠" }
];

// ====================== CATEGORIES ======================

function loadCategory(category) {
  homeView.classList.remove('hidden');
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
  genreSection.classList.remove('hidden');
  pageTitle.textContent = "Browse by Genre";

  genreGrid.innerHTML = genresList.map(genre => `
    <div class="genre-card" onclick="loadGenre(${genre.id}, '${genre.name}')">
      <div>${genre.icon}</div>
      <p>${genre.name}</p>
    </div>
  `).join('');
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

function switchTab(type) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(type + '-tab').classList.add('active');
  
  if (type === 'tv') {
    showError("TV Shows feature coming soon...");
  } else {
    showHome();
  }
}

// ====================== SEARCH ======================

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
  genreSection.classList.add('hidden');
  pageTitle.textContent = `Results for "${query}"`;
  showLoading();

  try {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    displayMovies(data.results);
  } catch (err) {
    showError("Search failed");
  }
}

function searchMovies() {
  const query = document.getElementById('searchInput').value.trim();
  if (query) performSearch(query);
}

// ====================== CORE FUNCTIONS ======================

function showHome() {
  homeView.classList.remove('hidden');
  genreSection.classList.add('hidden');
  document.getElementById('searchInput').value = '';
  pageTitle.textContent = 'Popular Movies';
  fetchMovies('/movie/popular');
}

function showWatchlist() {
  showError("Watchlist feature coming soon...");
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

function displayMovies(movies) {
  loading.classList.add('hidden');
  if (movies.length === 0) {
    moviesGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#aaa;">No movies found.</p>`;
    return;
  }
  
  moviesGrid.innerHTML = movies.map(movie => `
    <div class="movie-card">
      <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p class="rating">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
      </div>
    </div>
  `).join('');
}

// Initialize App
document.addEventListener('DOMContentLoaded', showHome);