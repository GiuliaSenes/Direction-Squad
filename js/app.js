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
// -----------------------------------------------------

// 2. Funzione per stampare le card dinamicamente
function renderPoints(arrayToRender) {
    gridContainer.innerHTML = '';

    if (arrayToRender.length === 0) {
        emptyState.hidden = false;
        resultsStatus.textContent = "0 places found";
        return;
    } else {
        emptyState.hidden = true;
    }

    resultsStatus.textContent = `${arrayToRender.length} places available`;

    arrayToRender.forEach(punto => {
        const categoryFormatted = punto.category.charAt(0).toUpperCase() + punto.category.slice(1);
        const actionFormatted = punto.action.charAt(0).toUpperCase() + punto.action.slice(1);

        const cardHTML = `
            <article class="localPoint-card" aria-labelledby="point-${punto.id}-title">
                <p class="point-category">${categoryFormatted} · ${actionFormatted}</p>
                <h3 id="point-${punto.id}-title">${punto.name}</h3>
                <p>${punto.description}</p>
                <dl class="point-details">
                    <dt>Zone</dt><dd>${punto.zone}</dd>
                    <dt>Address</dt><dd>${punto.address}</dd>
                    <dt>Opening hours</dt><dd>${punto.hours}</dd>
                </dl>
            </article>
        `;

        gridContainer.innerHTML += cardHTML;
    });
}

// 3. Funzione di filtraggio (usa 'tuttiIPunti')
function filterPoints() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedAction = actionFilter.value;
    const selectedCategory = categoryFilter.value;

    const filtered = tuttiIPunti.filter(punto => {
        const matchesSearch = 
            punto.name.toLowerCase().includes(searchText) ||
            punto.zone.toLowerCase().includes(searchText) ||
            punto.address.toLowerCase().includes(searchText);

        const matchesAction = selectedAction === "" || punto.action === selectedAction;
        const matchesCategory = selectedCategory === "" || punto.category === selectedCategory;

        return matchesSearch && matchesAction && matchesCategory;
    });

    renderPoints(filtered);
}

// 4. Ascoltatori di eventi sugli input
searchInput.addEventListener('input', filterPoints);
actionFilter.addEventListener('change', filterPoints);
categoryFilter.addEventListener('change', filterPoints);

// 5. Primo avvio: mostra tutti i punti (fissi + eventuali aggiunti dall'utente)
renderPoints(tuttiIPunti);