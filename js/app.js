// 1. Selezione degli elementi dal DOM
const gridContainer = document.getElementById('local-points-grid');
const searchInput = document.getElementById('search');
const actionFilter = document.getElementById('action-filter');
const categoryFilter = document.getElementById('category-filter');
const resultsStatus = document.getElementById('results-status');
const emptyState = document.getElementById('empty-state');

// --- UNIONE DEI DATI FISSI E QUELLI SALVATI DAL FORM ---
const puntiLocaliSalvati = JSON.parse(localStorage.getItem('nuoviPunti')) || [];
const tuttiIPunti = [...puntiRiuso, ...puntiLocaliSalvati];

// --- DIZIONARI DI TRADUZIONE PER L'INTERFACCIA ---
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

// 2. Funzione per stampare le card dinamicamente
function renderPoints(arrayToRender) {
    gridContainer.innerHTML = '';

    if (arrayToRender.length === 0) {
        if (emptyState) emptyState.hidden = false;
        resultsStatus.textContent = "0 luoghi trovati";
        return;
    } else {
        if (emptyState) emptyState.hidden = true;
    }

    // Contatore dei risultati in italiano
    resultsStatus.textContent = `${arrayToRender.length} luoghi disponibili`;

    arrayToRender.forEach(punto => {
        // Traduzione dinamica di Categoria e Azione
        const categoryFormatted = traduzioniCategorie[punto.category] || punto.category;
        const actionFormatted = traduzioniAzioni[punto.action] || punto.action;

        const cardHTML = `
            <div class="col">
                <article class="localPoint-card h-100 p-4 border rounded shadow-sm" aria-labelledby="point-${punto.id}-title">
                    <p class="point-category text-success font-monospace small fw-bold mb-2">
                        ${categoryFormatted} · ${actionFormatted}
                    </p>
                    <h3 id="point-${punto.id}-title" class="h5 mb-3">${punto.name}</h3>
                    <p class="card-text text-light mb-4">${punto.description}</p>
                    <dl class="point-details small mb-0">
                        <dt class="fw-bold">Zona</dt>
                        <dd class="mb-2">${punto.zone}</dd>
                        <dt class="fw-bold">Indirizzo</dt>
                        <dd class="mb-2">${punto.address}</dd>
                        <dt class="fw-bold">Orari di apertura</dt>
                        <dd class="mb-0">${punto.hours}</dd>
                    </dl>
                </article>
            </div>
        `;

        gridContainer.innerHTML += cardHTML;
    });
}

// 3. Logica di filtraggio in tempo reale
function filterPoints() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedAction = actionFilter.value;
    const selectedCategory = categoryFilter.value;

    const risultatiFiltrati = tuttiIPunti.filter(punto => {
        const matchQuery = punto.name.toLowerCase().includes(query) ||
                           punto.zone.toLowerCase().includes(query) ||
                           punto.address.toLowerCase().includes(query) ||
                           punto.description.toLowerCase().includes(query);

        const matchAction = (selectedAction === 'all' || selectedAction === '') ? true : punto.action === selectedAction;
        const matchCategory = (selectedCategory === 'all' || selectedCategory === '') ? true : punto.category === selectedCategory;

        return matchQuery && matchAction && matchCategory;
    });

    renderPoints(risultatiFiltrati);
}

// Event Listeners per i filtri
searchInput.addEventListener('input', filterPoints);
actionFilter.addEventListener('change', filterPoints);
categoryFilter.addEventListener('change', filterPoints);

// Avvio iniziale
renderPoints(tuttiIPunti);