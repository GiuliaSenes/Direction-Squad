// 1. DOM elements selection
const gridContainer = document.getElementById('local-points-grid');
const searchInput = document.getElementById('search');
const actionFilter = document.getElementById('action-filter');
const categoryFilter = document.getElementById('category-filter');
const favoritesOnlyCheckbox = document.getElementById('favorites-only');
const resultsStatus = document.getElementById('results-status');
const emptyState = document.getElementById('empty-state');
const favoritesEmptyState = document.getElementById('favorites-empty-state');
const favoriteTemplate = document.getElementById('favorite-button-template');

// --- STATIC DATA + FORM DATA ---
const savedPoints = JSON.parse(localStorage.getItem('nuoviPunti')) || [];
const allPoints = (typeof reusePoints !== 'undefined') ? [...reusePoints, ...savedPoints] : [...savedPoints];

// --- FAVORITES MANAGEMENT ---
let favorites = JSON.parse(localStorage.getItem('preferitiPunti')) || [];

if (favoritesOnlyCheckbox) {
    favoritesOnlyCheckbox.disabled = false;
}

// --- TRANSLATION DICTIONARIES ---
const categoryTranslations = {
    bicycles: "Biciclette",
    clothing: "Abbigliamento",
    electronics: "Elettronica",
    furniture: "Mobili"
};

const actionTranslations = {
    donate: "Donare",
    exchange: "Scambiare",
    recycle: "Riciclare",
    repair: "Riparare"
};

// 2. Dynamic card rendering function
function renderPoints(arrayToRender) {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    const isOnlyFavs = favoritesOnlyCheckbox && favoritesOnlyCheckbox.checked;

    if (arrayToRender.length === 0) {
        if (isOnlyFavs && favorites.length === 0) {
            if (favoritesEmptyState) favoritesEmptyState.hidden = false;
            if (emptyState) emptyState.hidden = true;
        } else {
            if (emptyState) emptyState.hidden = false;
            if (favoritesEmptyState) favoritesEmptyState.hidden = true;
        }
        if (resultsStatus) resultsStatus.textContent = "0 luoghi trovati";
        return;
    } else {
        if (emptyState) emptyState.hidden = true;
        if (favoritesEmptyState) favoritesEmptyState.hidden = true;
    }

    if (resultsStatus) {
        resultsStatus.textContent = `${arrayToRender.length} luoghi disponibili`;
    }

    arrayToRender.forEach(point => {
        const categoryFormatted = categoryTranslations[point.category] || point.category;
        const actionFormatted = actionTranslations[point.action] || point.action;
        const isFav = favorites.includes(point.id);

        const cardCol = document.createElement('div');
        cardCol.className = 'col';

        cardCol.innerHTML = `
            <article class="localPoint-card h-100 p-4 border rounded shadow-sm d-flex flex-column justify-content-between" aria-labelledby="point-${point.id}-title">
                <div>
                    <!-- Category -->
                    <p class="point-category text-success font-monospace small fw-bold mb-2">
                        ${categoryFormatted} · ${actionFormatted}
                    </p>
                    
                    <!-- Title and Button perfectly aligned -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3 id="point-${point.id}-title" class="h5 mb-0">${point.name}</h3>
                        <div class="fav-container d-flex align-items-center"></div>
                    </div>

                    <p class="card-text text-light mb-4">${point.description}</p>
                </div>
                <dl class="point-details small mb-0 pt-3 border-top">
                    <dt class="fw-bold">Zona</dt>
                    <dd class="mb-2">${point.zone}</dd>
                    <dt class="fw-bold">Indirizzo</dt>
                    <dd class="mb-2">${point.address}</dd>
                    <dt class="fw-bold">Orari di apertura</dt>
                    <dd class="mb-0">${point.hours || 'Non specificati'}</dd>
                </dl>
            </article>
        `;

        if (favoriteTemplate) {
            const favClone = favoriteTemplate.content.cloneNode(true);
            const favBtn = favClone.querySelector('.favorite-button');
            const favState = favClone.querySelector('.favorite-state');

            if (favBtn) {
                favBtn.setAttribute('data-point-id', point.id);
                favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
                favBtn.addEventListener('click', () => toggleFavorite(point.id));
            }

            // Hide extra text label to prevent layout wrapping issues
            if (favState) {
                favState.style.display = 'none';
            }

            cardCol.querySelector('.fav-container').appendChild(favClone);
        }

        gridContainer.appendChild(cardCol);
    });
}

// 3. Toggle Favorites
function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('preferitiPunti', JSON.stringify(favorites));
    filterPoints();
}

// 4. Filtering logic
function filterPoints() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedAction = actionFilter ? actionFilter.value : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const onlyFavs = favoritesOnlyCheckbox ? favoritesOnlyCheckbox.checked : false;

    const filteredResults = allPoints.filter(point => {
        const matchQuery = point.name.toLowerCase().includes(query) ||
                           point.zone.toLowerCase().includes(query) ||
                           point.address.toLowerCase().includes(query) ||
                           point.description.toLowerCase().includes(query);

        const matchAction = (!selectedAction || selectedAction === 'all') ? true : point.action === selectedAction;
        const matchCategory = (!selectedCategory || selectedCategory === 'all') ? true : point.category === selectedCategory;
        const matchFav = onlyFavs ? favorites.includes(point.id) : true;

        return matchQuery && matchAction && matchCategory && matchFav;
    });

    renderPoints(filteredResults);
}

// Listeners
if (searchInput) searchInput.addEventListener('input', filterPoints);
if (actionFilter) actionFilter.addEventListener('change', filterPoints);
if (categoryFilter) categoryFilter.addEventListener('change', filterPoints);
if (favoritesOnlyCheckbox) favoritesOnlyCheckbox.addEventListener('change', filterPoints);

// Initial render
filterPoints();