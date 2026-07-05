const newsGrid = document.getElementById('newsGrid');
const summaryGrid = document.getElementById('summaryGrid');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const lastUpdated = document.getElementById('lastUpdated');
const refreshButton = document.getElementById('refreshButton');
let allItems = [];

const fmtDate = (value) => {
  if (!value) return 'No date';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'No date';
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

function cleanText(text = '') {
  const div = document.createElement('div');
  div.innerHTML = text;
  return (div.textContent || div.innerText || '').trim();
}

function populateCategories(items) {
  const categories = [...new Set(items.map(item => item.category))].sort();
  categoryFilter.innerHTML = '<option value="all">All categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function renderSummary(items) {
  const counts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  summaryGrid.innerHTML = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, count]) => `<button class="summary-card" data-category="${category}"><strong>${count}</strong><span>${category}</span></button>`)
    .join('');
  document.querySelectorAll('.summary-card').forEach(card => {
    card.addEventListener('click', () => {
      categoryFilter.value = card.dataset.category;
      renderNews();
    });
  });
}

function renderNews() {
  const query = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  const filtered = allItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const haystack = `${item.title} ${item.source} ${item.category} ${item.summary}`.toLowerCase();
    return matchesCategory && haystack.includes(query);
  });

  newsGrid.innerHTML = filtered.map(item => `
    <article class="news-card">
      <div class="card-meta">
        <span>${item.category}</span>
        <span>${item.source}</span>
      </div>
      <h2><a href="${item.link}" target="_blank" rel="noopener noreferrer">${cleanText(item.title)}</a></h2>
      <p>${cleanText(item.summary).slice(0, 220)}${cleanText(item.summary).length > 220 ? '…' : ''}</p>
      <time>${fmtDate(item.published)}</time>
    </article>
  `).join('') || '<p class="empty">No matching articles found.</p>';
}

async function loadNews() {
  newsGrid.innerHTML = '<p class="empty">Loading news…</p>';
  const response = await fetch(`news.json?cacheBust=${Date.now()}`);
  if (!response.ok) throw new Error('Could not load news.json');
  const data = await response.json();
  allItems = data.items || [];
  lastUpdated.textContent = fmtDate(data.updated_at);
  populateCategories(allItems);
  renderSummary(allItems);
  renderNews();
}

searchInput.addEventListener('input', renderNews);
categoryFilter.addEventListener('change', renderNews);
refreshButton.addEventListener('click', loadNews);

loadNews().catch(error => {
  newsGrid.innerHTML = `<p class="empty">${error.message}. Run the update script first.</p>`;
});
