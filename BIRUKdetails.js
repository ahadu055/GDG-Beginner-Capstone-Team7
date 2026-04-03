// Biruk Molla - Movie Detail Logic
const API_KEY = "484df581042c3faf17f670f876837ae5";
const BASE_URL = "https://api.themoviedb.org/3/movie/";
const IMG_PATH = "https://image.tmdb.org/t/p/w500";

// 1. Capture the Movie ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

const container = document.getElementById("movie-details-container");
const backBtn = document.getElementById("back-home-btn");

// 2. Fix: Navigation logic to go back to Melat's index.html
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

// 3. Determine color for the rating badge
function getRatingColor(vote) {
  if (vote >= 7.5) return "green";
  if (vote >= 5.5) return "orange";
  return "red";
}

// 4. Fetch the data (including Credits for actor photos)
async function getMovieDetails() {
  if (!movieId) {
    container.innerHTML =
      "<h2 style='color:white; text-align:center;'>Please select a movie from the home page.</h2>";
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}${movieId}?api_key=${API_KEY}&append_to_response=credits`,
    );
    const data = await response.json();
    renderMovieDetails(data);
  } catch (error) {
    console.error("Biruk's Fetch Error:", error);
    container.innerHTML =
      "<h2 style='color:white;'>Error loading movie details. Check your API key.</h2>";
  }
}

// 5. Build the UI
function renderMovieDetails(movie) {
  const {
    title,
    poster_path,
    vote_average,
    runtime,
    genres,
    overview,
    credits,
  } = movie;

  // Build the Cast HTML (Top 5 Actors)
  const castHTML = credits.cast
    .slice(0, 5)
    .map(
      (actor) => `
        <div class="actor-card">
            <img src="${actor.profile_path ? IMG_PATH + actor.profile_path : "https://via.placeholder.com/150"}" alt="${actor.name}">
            <p><strong>${actor.name}</strong></p>
            <p class="role">${actor.character}</p>
        </div>
    `,
    )
    .join("");

  container.innerHTML = `
        <div class="details-card">
            <div class="poster-section">
                <img src="${IMG_PATH + poster_path}" alt="${title}" class="detail-img">
            </div>
            
            <div class="info-section">
                <h1>${title}</h1>
                
                <div class="badges">
                    <span class="badge rating ${getRatingColor(vote_average)}">
                        ⭐ ${vote_average.toFixed(1)}
                    </span>
                    <span class="badge">${runtime} min</span>
                </div>

                <div class="genre-list">
                    ${genres.map((g) => `<span class="genre-tag">${g.name}</span>`).join("")}
                </div>

                <h3>Overview</h3>
                <p class="overview-text">${overview}</p>

                <h3>Top Cast</h3>
                <div class="cast-grid">
                    ${castHTML}
                </div>
            </div>
        </div>
    `;
}
// Start the process
getMovieDetails();
