// 1. Selezione degli elementi dal DOM
const gridContainer = document.getElementById('local-points-grid');
const searchInput = document.getElementById('search');
const actionFilter = document.getElementById('action-filter');
const categoryFilter = document.getElementById('category-filter');
const favoritesOnlyCheckbox = document.getElementById('favorites-only');
const resultsStatus = document.getElementById('results-status');
const emptyState = document.getElementById('empty-state');
const favoritesEmptyState = document.getElementById('favorites-empty-state');
const favoriteTemplate = document.getElementById('favorite-button-template');

// --- DATI FISSI + DATI DA FORMS ---
const puntiSalvati = JSON.parse(localStorage.getItem('nuoviPunti')) || [];
const tuttiIPunti = (typeof puntiRiuso !== 'undefined') ? [...puntiRiuso, ...puntiSalvati] : [...puntiSalvati];

// --- GESTIONE PREFERITI ---
let preferiti = JSON.parse(localStorage.getItem('preferitiPunti')) || [];

if (favoritesOnlyCheckbox) {
    favoritesOnlyCheckbox.disabled = false;
}

// --- DIZIONARI DI TRADUZIONE ---
const traduzioniCategorie = {
    bicycles: "Biciclette",
    clothing: "Abbigliamento",
    electronics: "Elettronica",
    furniture: "Mobili"
};

const traduzioniAzioni = {
    donate: "Donare",
    exchange: "Scambiare",
    recycle: "Riciclare",
    repair: "Riparare"
};

// 2. Funzione per la stampa dinamica delle card
function renderPoints(arrayToRender) {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    const isOnlyFavs = favoritesOnlyCheckbox && favoritesOnlyCheckbox.checked;

    if (arrayToRender.length === 0) {
        if (isOnlyFavs && preferiti.length === 0) {
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

    arrayToRender.forEach(punto => {
        const categoryFormatted = traduzioniCategorie[punto.category] || punto.category;
        const actionFormatted = traduzioniAzioni[punto.action] || punto.action;
        const isFav = preferiti.includes(punto.id);

        const cardCol = document.createElement('div');
        cardCol.className = 'col';

cardCol.innerHTML = `
            <article class="localPoint-card h-100 p-4 border rounded shadow-sm d-flex flex-column justify-content-between" aria-labelledby="point-${punto.id}-title">
                <div>
                    <!-- Categoria -->
                    <p class="point-category text-success font-monospace small fw-bold mb-2">
                        ${categoryFormatted} · ${actionFormatted}
                    </p>
                    
                    <!-- Titolo e Bottone allineati perfettamente -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3 id="point-${punto.id}-title" class="h5 mb-0">${punto.name}</h3>
                        <div class="fav-container d-flex align-items-center"></div>
                    </div>

                    <p class="card-text text-light mb-4">${punto.description}</p>
                </div>
                <dl class="point-details small mb-0 pt-3 border-top">
                    <dt class="fw-bold">Zona</dt>
                    <dd class="mb-2">${punto.zone}</dd>
                    <dt class="fw-bold">Indirizzo</dt>
                    <dd class="mb-2">${punto.address}</dd>
                    <dt class="fw-bold">Orari di apertura</dt>
                    <dd class="mb-0">${punto.hours || 'Non specificati'}</dd>
                </dl>
            </article>
        `;
if (favoriteTemplate) {
            const favClone = favoriteTemplate.content.cloneNode(true);
            const favBtn = favClone.querySelector('.favorite-button');
            const favState = favClone.querySelector('.favorite-state');

            if (favBtn) {
                favBtn.setAttribute('data-point-id', punto.id);
                favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
                favBtn.addEventListener('click', () => toggleFavorite(punto.id));
            }

            // Nascondiamo la scritta testuale extra per evitare che faccia impazzire il layout a capo
            if (favState) {
                favState.style.display = 'none';
            }

            cardCol.querySelector('.fav-container').appendChild(favClone);
        }

        gridContainer.appendChild(cardCol);
    });
}

// 3. Toggle Preferiti
function toggleFavorite(id) {
    if (preferiti.includes(id)) {
        preferiti = preferiti.filter(favId => favId !== id);
    } else {
        preferiti.push(id);
    }
    localStorage.setItem('preferitiPunti', JSON.stringify(preferiti));
    filterPoints();
}

// 4. Logica di filtraggio
function filterPoints() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedAction = actionFilter ? actionFilter.value : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const onlyFavs = favoritesOnlyCheckbox ? favoritesOnlyCheckbox.checked : false;

    const risultatiFiltrati = tuttiIPunti.filter(punto => {
        const matchQuery = punto.name.toLowerCase().includes(query) ||
                           punto.zone.toLowerCase().includes(query) ||
                           punto.address.toLowerCase().includes(query) ||
                           punto.description.toLowerCase().includes(query);

        const matchAction = (!selectedAction || selectedAction === 'all') ? true : punto.action === selectedAction;
        const matchCategory = (!selectedCategory || selectedCategory === 'all') ? true : punto.category === selectedCategory;
        const matchFav = onlyFavs ? preferiti.includes(punto.id) : true;

        return matchQuery && matchAction && matchCategory && matchFav;
    });

    renderPoints(risultatiFiltrati);
}

// Listeners
if (searchInput) searchInput.addEventListener('input', filterPoints);
if (actionFilter) actionFilter.addEventListener('change', filterPoints);
if (categoryFilter) categoryFilter.addEventListener('change', filterPoints);
if (favoritesOnlyCheckbox) favoritesOnlyCheckbox.addEventListener('change', filterPoints);

// Avvio iniziale
filterPoints();