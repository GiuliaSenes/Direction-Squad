// 1. Form elements selection
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-place');
const formStatus = document.getElementById('form-status');

// Required fields
const nameInput = document.getElementById('name');
const zoneInput = document.getElementById('zone');
const actionInput = document.getElementById('action');
const categoryInput = document.getElementById('category');
const addressInput = document.getElementById('address');
const descriptionInput = document.getElementById('description');

// Time inputs selection
const timeInputs = form.querySelectorAll('input[type="time"]');
const openTimeInput = timeInputs[0];
const closeTimeInput = timeInputs[1];

// Dynamic error message element for hours
let hoursErrorMsg = document.getElementById('hours-error-msg');
if (!hoursErrorMsg && closeTimeInput) {
    hoursErrorMsg = document.createElement('div');
    hoursErrorMsg.id = 'hours-error-msg';
    hoursErrorMsg.className = 'text-danger small fw-bold mt-2';
    hoursErrorMsg.style.display = 'none';
    hoursErrorMsg.textContent = "⚠️ L'orario di chiusura non può essere precedente o uguale all'orario di apertura.";
    closeTimeInput.parentElement.appendChild(hoursErrorMsg);
}

// Helper to get selected days and midnight checkbox
function getScheduleDetails() {
    const checkboxes = Array.from(form.querySelectorAll('input[type="checkbox"]'));
    const selectedDays = [];
    let isMidnight = false;
    let saveToFavs = false;

    checkboxes.forEach(cb => {
        const labelText = cb.parentElement ? cb.parentElement.textContent.trim() : '';
        if (labelText.includes('mezzanotte') || labelText.includes('24:00')) {
            isMidnight = cb.checked;
        } else if (labelText.includes('preferiti')) {
            saveToFavs = cb.checked;
        } else if (cb.checked && labelText) {
            // Abbrevia il giorno alle prime 3 lettere (es. "Martedì" -> "Mar")
            selectedDays.push(labelText.substring(0, 3));
        }
    });

    return { selectedDays, isMidnight, saveToFavs };
}

// 2. Check if all required fields are filled and times are logical
function validateForm() {
    const isNameValid = nameInput.value.trim() !== '';
    const isZoneValid = zoneInput.value.trim() !== '';
    const isActionValid = actionInput.value !== '';
    const isCategoryValid = categoryInput.value !== '';
    const isAddressValid = addressInput.value.trim() !== '';
    const isDescriptionValid = descriptionInput.value.trim() !== '';

    const { isMidnight } = getScheduleDetails();
    let areHoursValid = true;

    if (openTimeInput && closeTimeInput) {
        const openVal = openTimeInput.value;
        const closeVal = closeTimeInput.value;

        // Se è spuntata la chiusura a mezzanotte, disabilita il campo chiusura
        closeTimeInput.disabled = isMidnight;
        if (isMidnight) closeTimeInput.value = '';

        if (openVal && closeVal && !isMidnight) {
            if (openVal >= closeVal) {
                areHoursValid = false;
            }
        }
    }

    // Mostra o nasconde l'avviso rosso sotto l'orario
    if (hoursErrorMsg) {
        hoursErrorMsg.style.display = areHoursValid ? 'none' : 'block';
    }

    if (isNameValid && isZoneValid && isActionValid && isCategoryValid && isAddressValid && isDescriptionValid && areHoursValid) {
        submitBtn.removeAttribute('disabled');
    } else {
        submitBtn.setAttribute('disabled', 'true');
    }
}

// Listen for input changes to validate in real-time
form.addEventListener('input', validateForm);
form.addEventListener('change', validateForm);
validateForm();

// 3. Handle form submission
form.addEventListener('submit', function(event) {
    event.preventDefault();

    const { selectedDays, isMidnight, saveToFavs } = getScheduleDetails();
    const openVal = openTimeInput ? openTimeInput.value : '';
    const closeVal = isMidnight ? '24:00' : (closeTimeInput ? closeTimeInput.value : '');

    // Costruzione orario
    let timePart = '';
    if (openVal && closeVal) {
        timePart = `${openVal}–${closeVal}`;
    } else if (openVal) {
        timePart = `Dalle ${openVal}`;
    }

    // Unisce i giorni con il trattino (es. "Mar - Mer - Gio")
    const daysPart = selectedDays.length > 0 ? selectedDays.join(' - ') : '';

    // Mette i giorni sulla prima riga e l'orario sulla seconda riga usando il tag HTML <br>
    let hoursString = "Orari non specificati";
    if (daysPart && timePart) {
        hoursString = `${daysPart}<br>${timePart}`;
    } else if (daysPart) {
        hoursString = daysPart;
    } else if (timePart) {
        hoursString = timePart;
    }

    const newId = Date.now();

    // Create new point object
    const newPoint = {
        id: newId, 
        name: nameInput.value.trim(),
        zone: zoneInput.value.trim(),
        action: actionInput.value,
        category: categoryInput.value,
        address: addressInput.value.trim(),
        hours: hoursString,
        description: descriptionInput.value.trim()
    };

    // Save to localStorage
    let savedPoints = JSON.parse(localStorage.getItem('nuoviPunti')) || [];
    savedPoints.push(newPoint);
    localStorage.setItem('nuoviPunti', JSON.stringify(savedPoints));

    if (saveToFavs) {
        let favorites = JSON.parse(localStorage.getItem('preferitiPunti')) || [];
        favorites.push(newId);
        localStorage.setItem('preferitiPunti', JSON.stringify(favorites));
    }

    formStatus.style.color = "#198754";
    formStatus.textContent = "Grazie! Il nuovo punto è stato segnalato con successo.";

    form.reset();
    if (closeTimeInput) closeTimeInput.disabled = false;
    submitBtn.setAttribute('disabled', 'true');

    setTimeout(() => {
        formStatus.textContent = "";
    }, 4000);
});