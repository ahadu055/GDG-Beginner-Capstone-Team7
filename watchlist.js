// my part:- BETHLEHEM ESHETU - FINAL Watchlist System 




function saveWatchlist() {
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function toggleWatchlist(e, id, title, posterPath, releaseDate) {
  e.stopPropagation();

  const movie = {
    id,
    title,
    poster_path: posterPath,
    release_date: releaseDate
  };

  const index = watchlist.findIndex(m => m.id === id);

  if (index !== -1) {
    // to Remove
    watchlist.splice(index, 1);
    alert("Removed from watchlist");
  } else {
    // to Add
    watchlist.push(movie);
    alert("Added to watchlist");
  }

  saveWatchlist();
  updateUI();
}


function toggleWatchlistFromModal(id, title, posterPath, releaseDate) {
  toggleWatchlist({ stopPropagation: () => {} }, id, title, posterPath, releaseDate);
  closeModal();
}

// to Update UI only when needed
function updateUI() {
  if (pageTitle.textContent === 'My Watchlist') {
    showWatchlist();
  }
}

// to Display Watchlist
function showWatchlist() {
  pageTitle.textContent = 'My Watchlist';

  if (watchlist.length === 0) {
    moviesGrid.innerHTML = `
      <p style="grid-column: 1/-1; text-align:center; color:#aaa; padding: 3rem;">
        Your watchlist is empty. Add some movies!
      </p>
    `;
    hideLoading();
    return;
  }

  displayMovies(watchlist);
}