async function searchGitHub(query) {
  const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=25`, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    }
  });
  const data = await response.json();
  return data.items || [];
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'm';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

const searchInput = document.querySelector('.search-input');
const resultsContainer = document.querySelector('#results');
const loadingSpinner = document.querySelector('.loading-spinner');

async function handleSearch() {
  const query = searchInput.value.trim();
  
  if (!query) {
    resultsContainer.innerHTML = '';
    return;
  }

  loadingSpinner.style.display = 'block';
  
  try {
    const results = await searchGitHub(query);
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="result-item">No results found.</div>';
    } else {
      resultsContainer.innerHTML = results.map(repo => `
        <div class="result-item">
          <a href="${repo.html_url}" class="result-title" target="_blank">
            ${repo.full_name}
          </a>
          <p class="result-description">
            ${repo.description || ''}
          </p>
          <div class="result-meta">
            <span>⭐ ${formatNumber(repo.stargazers_count)}</span>
            <span>📝 ${repo.language || 'Unknown'}</span>
            <span>🕒 Updated ${formatDate(repo.updated_at)}</span>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    resultsContainer.innerHTML = '<div class="result-item">Error fetching results. Please try again.</div>';
    console.error('Search error:', error);
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

let debounceTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(handleSearch, 300);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
});
