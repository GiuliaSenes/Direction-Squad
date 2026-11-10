// 1. Selezione degli elementi del form
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-place');
const formStatus = document.getElementById('form-status');

// Campi obbligatori
const nameInput = document.getElementById('name');
const zoneInput = document.getElementById('zone');
const actionInput = document.getElementById('action');
const categoryInput = document.getElementById('category');
const addressInput = document.getElementById('address');
const hoursInput = document.getElementById('openingHours');
const descriptionInput = document.getElementById('description');

// 2. Funzione per verificare se tutti i campi obbligatori sono compilati
function validateForm() {
    const isNameValid = nameInput.value.trim() !== '';
    const isZoneValid = zoneInput.value.trim() !== '';
    const isActionValid = actionInput.value !== '';
    const isCategoryValid = categoryInput.value !== '';
    const isAddressValid = addressInput.value.trim() !== '';
    const isDescriptionValid = descriptionInput.value.trim() !== '';

    // Se tutto è valido, abiliteremo il bottone
    if (isNameValid && isZoneValid && isActionValid && isCategoryValid && isAddressValid && isDescriptionValid) {
        submitBtn.removeAttribute('disabled');
    } else {
        submitBtn.setAttribute('disabled', 'true');
    }
}

// Ascolta i cambiamenti nei campi per validare in tempo reale
form.addEventListener('input', validateForm);
form.addEventListener('change', validateForm);
// Esegue il controllo subito all'avvio della pagina
validateForm();
// 3. Gestione dell'invio del form
form.addEventListener('submit', function(event) {
    // Evita il ricaricamento della pagina
    event.preventDefault();

    // Creazione del nuovo oggetto punto (con un ID unico basato sul timestamp)
    const nuovoPunto = {
        id: Date.now(), 
        name: nameInput.value.trim(),
        zone: zoneInput.value.trim(),
        action: actionInput.value,
        category: categoryInput.value,
        address: addressInput.value.trim(),
        hours: hoursInput.value.trim() || "Orari non specificati",
        description: descriptionInput.value.trim()
    };

    // Salvataggio opzionale in localStorage per passarlo alla home (estensione fantastica per il progetto)
    let puntiSalvati = JSON.parse(localStorage.getItem('nuoviPunti')) || [];
    puntiSalvati.push(nuovoPunto);
    localStorage.setItem('nuoviPunti', JSON.stringify(puntiSalvati));

    // Messaggio di successo per l'utente
    formStatus.style.color = "#198754"; // Verde successo Bootstrap
    formStatus.textContent = "Grazie! Il nuovo punto è stato segnalato con successo.";

    // Pulizia del form
    form.reset();
    submitBtn.setAttribute('disabled', 'true');

    // Dopo 3 secondi pulisce anche il messaggio
    setTimeout(() => {
        formStatus.textContent = "";
    }, 4000);
});