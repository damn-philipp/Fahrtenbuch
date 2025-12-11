/**
 * APP.JS
 * Hauptanwendung - verbindet alle Komponenten
 */

// Globale Instanz des TripManagers
const tripManager = new TripManager();

// Globale Status-Variablen
let editingTripId = null;       // ID der Fahrt, die gerade bearbeitet wird
let currentListLimit = 10;      // Anzahl der angezeigten Fahrten
let summaryMode = 'week';       // 'week' oder 'total' für die Übersicht

/**
 * INITIALISIERUNG
 */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();            // 1. Theme laden (Dark/Light)
    initializeApp();        // 2. Daten laden
    attachEventListeners(); // 3. Buttons aktivieren
});

function initializeApp() {
    const state = tripManager.initialize();

    if (state.hasInitialKm) {
        UI.showSetupCard(false);
        UI.updateKmDisplay(tripManager.currentKmStand);

        // Liste rendern (mit Limit)
        UI.renderTripList(tripManager.trips, currentListLimit);

        // Übersicht aktualisieren
        updateSummaryDisplay();

        if (state.hasActiveTrip) {
            UI.showActiveTrip(tripManager.activeTrip);
        }
    } else {
        UI.showSetupCard(true);
    }
}

/**
 * EREIGNIS-LISTENER (Aufgeräumt & Gruppiert)
 */
function attachEventListeners() {

    // --- 1. SETUP & KM-STAND ---
    document.getElementById('saveInitialKmBtn').addEventListener('click', handleSaveInitialKm);
    document.getElementById('updateKmBtn').addEventListener('click', handleUpdateKm);

    // --- 2. HAUPTSEITE: NEUE FAHRT ---
    document.getElementById('businessBtn').addEventListener('click', () => handleTripTypeSelect('business'));
    document.getElementById('privateBtn').addEventListener('click', () => handleTripTypeSelect('private'));
    document.getElementById('startTripBtn').addEventListener('click', handleStartTrip);
    document.getElementById('endTripBtn').addEventListener('click', handleEndTrip);

    // --- 3. HAUPTSEITE: ÜBERSICHT (SUMMARY) ---
    const sumWeekBtn = document.getElementById('summaryWeekBtn');
    const sumMonthBtn = document.getElementById('summaryMonthBtn');
    const sumTotalBtn = document.getElementById('summaryTotalBtn');

    // Helper um Klassen zu setzen
    const setSummaryActive = (btn) => {
        [sumWeekBtn, sumMonthBtn, sumTotalBtn].forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSummaryDisplay();
    };

    sumWeekBtn.addEventListener('click', () => {
        summaryMode = 'week';
        setSummaryActive(sumWeekBtn);
    });

    sumMonthBtn.addEventListener('click', () => {
        summaryMode = 'month'; // NEU
        setSummaryActive(sumMonthBtn);
    });

    sumTotalBtn.addEventListener('click', () => {
        summaryMode = 'total';
        setSummaryActive(sumTotalBtn);
    });

    // Button auf der Startseite: Leitet zu den Einstellungen weiter
    const goToExportBtn = document.getElementById('goToExportBtn');
    if (goToExportBtn) {
        goToExportBtn.addEventListener('click', () => {
            UI.openSettings();
            // Optional: Scrollen zum Export-Bereich
            const exportSection = document.getElementById('exportBtn2').closest('.settings-section');
            if (exportSection) exportSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- 4. LISTE & DETAILS ---
    // Event Delegation: Ein Listener für alle Buttons in der Liste (Bearbeiten & Mehr anzeigen)
    document.getElementById('tripList').addEventListener('click', (e) => {
        // A) Klick auf "Bearbeiten" (Stift)
        if (e.target.closest('.edit-button')) {
            const btn = e.target.closest('.edit-button');
            const tripId = parseInt(btn.dataset.tripId);
            handleEditTrip(tripId);
        }
        // B) Klick auf "Mehr anzeigen"
        else if (e.target.id === 'showMoreBtn') {
            currentListLimit += 10;
            UI.renderTripList(tripManager.trips, currentListLimit);
        }
    });

    // --- 5. EINSTELLUNGEN & EXPORT ---
    document.getElementById('settingsButton').addEventListener('click', () => UI.openSettings());
    document.getElementById('backButton').addEventListener('click', () => UI.closeSettings());
    document.getElementById('closeSettingsBtn').addEventListener('click', () => UI.closeSettings());

    // Die Export-Buttons in den Einstellungen
    document.getElementById('exportBtn2').addEventListener('click', handleExport); // Detail-Export
    const weeklyBtn = document.getElementById('exportWeeklyBtn');
    if (weeklyBtn) weeklyBtn.addEventListener('click', handleWeeklyExport); // Wochenbericht

    // Gefahrenzone
    document.getElementById('clearTripsBtn').addEventListener('click', handleClearAllTrips);
    document.getElementById('resetAppBtn').addEventListener('click', handleResetApp);

    // --- 6. MODAL (BEARBEITEN) ---
    document.getElementById('closeEditModalBtn').addEventListener('click', () => UI.closeEditModal());
    document.getElementById('cancelEditBtn').addEventListener('click', () => UI.closeEditModal());
    document.getElementById('saveEditBtn').addEventListener('click', handleSaveEdit);

    // Löschen im Modal
    const modalDeleteBtn = document.getElementById('modalDeleteBtn');
    if (modalDeleteBtn) {
        modalDeleteBtn.addEventListener('click', handleModalDeleteTrip);
    }

    // Typ-Umschalter im Modal
    document.getElementById('editBusinessBtn').addEventListener('click', () => {
        document.getElementById('editBusinessBtn').classList.add('active');
        document.getElementById('editPrivateBtn').classList.remove('active');
    });
    document.getElementById('editPrivateBtn').addEventListener('click', () => {
        document.getElementById('editPrivateBtn').classList.add('active');
        document.getElementById('editBusinessBtn').classList.remove('active');
    });
}

/**
 * LOGIK-FUNKTIONEN (HANDLER)
 */

function handleSaveInitialKm() {
    const input = document.getElementById('initialKm');
    const km = parseInt(input.value);
    if (tripManager.setInitialKm(km)) {
        UI.showSetupCard(false);
        UI.updateKmDisplay(tripManager.currentKmStand);
    } else {
        UI.alert('Bitte gib einen gültigen Kilometerstand ein.');
    }
}

function handleTripTypeSelect(type) {
    tripManager.setTripType(type);
    UI.updateTripTypeSelection(type);
}

function handleStartTrip() {
    const note = document.getElementById('tripNote').value;
    const trip = tripManager.startTrip(note);
    UI.showActiveTrip(trip);
    UI.clearInput('tripNote');
}

function handleEndTrip() {
    const endKm = parseInt(document.getElementById('endKm').value);
    const result = tripManager.endTrip(endKm);

    if (result.error) {
        UI.alert(result.error);
        return;
    }

    UI.hideActiveTrip();
    UI.updateKmDisplay(tripManager.currentKmStand);

    // Limit zurücksetzen, damit die neue Fahrt oben sichtbar ist
    currentListLimit = 10;
    UI.renderTripList(tripManager.trips, currentListLimit);

    updateSummaryDisplay();
    UI.clearInput('endKm');
}

function handleEditTrip(tripId) {
    const trip = tripManager.findTripById(tripId);
    if (!trip) return;
    editingTripId = tripId;
    UI.openEditModal(trip);
}

function handleSaveEdit() {
    const type = document.getElementById('editBusinessBtn').classList.contains('active') ? 'business' : 'private';
    const startKm = parseInt(document.getElementById('editStartKm').value);
    const endKm = parseInt(document.getElementById('editEndKm').value);
    const note = document.getElementById('editTripNote').value;

    const success = tripManager.updateTrip(editingTripId, { type, startKm, endKm, note });

    if (success) {
        UI.closeEditModal();
        UI.renderTripList(tripManager.trips, currentListLimit);
        updateSummaryDisplay();
        editingTripId = null;
    } else {
        UI.alert('Bitte überprüfe deine Eingaben. End-KM muss höher sein als Start-KM.');
    }
}

function handleModalDeleteTrip() {
    const btn = document.getElementById('modalDeleteBtn');
    const tripId = parseInt(btn.dataset.tripId);

    if (UI.confirm('Möchten Sie diese Fahrt wirklich unwiderruflich löschen?')) {
        const success = tripManager.deleteTrip(tripId);
        if (success) {
            UI.renderTripList(tripManager.trips, currentListLimit);
            updateSummaryDisplay();
            UI.closeEditModal();
            editingTripId = null;
        } else {
            UI.alert('Fehler beim Löschen der Fahrt.');
        }
    }
}

// Export detailliert
function handleExport() {
    if (tripManager.trips.length === 0) {
        UI.alert('Keine Fahrten vorhanden.');
        return;
    }
    const csvContent = tripManager.exportToCSV();
    const filename = `Fahrtenbuch_${new Date().toISOString().split('T')[0]}.csv`;
    UI.downloadCSV(csvContent, filename);
}

// Export Wochenbericht
function handleWeeklyExport() {
    if (tripManager.trips.length === 0) {
        UI.alert('Keine Fahrten vorhanden.');
        return;
    }
    const csvContent = tripManager.exportWeeklyReport();
    const filename = `Fahrtenbuch_Wochenbericht_${new Date().toISOString().split('T')[0]}.csv`;
    UI.downloadCSV(csvContent, filename);
}

function handleUpdateKm() {
    const newKm = parseInt(document.getElementById('editCurrentKm').value);
    if (UI.confirm(`KM-Stand auf ${newKm.toLocaleString('de-DE')} km ändern?`)) {
        if (tripManager.updateCurrentKm(newKm)) {
            UI.updateKmDisplay(tripManager.currentKmStand);
            UI.alert('KM-Stand aktualisiert!');
        } else {
            UI.alert('Bitte gib einen gültigen Wert ein.');
        }
    }
}

function handleClearAllTrips() {
    if (UI.confirm('Wirklich ALLE Fahrten löschen?')) {
        if (UI.confirm('Sicher? Daten gehen verloren!')) {
            tripManager.clearAllTrips();
            currentListLimit = 10;
            UI.renderTripList(tripManager.trips, currentListLimit);
            updateSummaryDisplay(); // Update auf 0
            UI.alert('Alle Fahrten gelöscht.');
        }
    }
}

function handleResetApp() {
    if (UI.confirm('App komplett zurücksetzen? Alle Daten werden gelöscht!')) {
        if (UI.confirm('Letzte Warnung: Wirklich ALLES löschen?')) {
            tripManager.resetApp();
            location.reload();
        }
    }
}

// Hilfsfunktion: Berechnet Zusammenfassung je nach Modus
function updateSummaryDisplay() {
    let data;
    let titleText = "Gesamtstrecke"; // Standard Titel

    if (summaryMode === 'week') {
        data = tripManager.calculateWeeklySummary();
        titleText = "Diese Woche";
    } else if (summaryMode === 'month') { // NEU
        data = tripManager.calculateMonthlySummary();
        // Monatsname ermitteln (z.B. "Dezember")
        const monthName = new Date().toLocaleString('de-DE', { month: 'long' });
        titleText = "Dieser Monat (" + monthName + ")";
    } else {
        data = tripManager.calculateSummary();
        titleText = "Gesamtstrecke";
    }

    // Label aktualisieren (damit man weiß, was die große Zahl bedeutet)
    const label = document.getElementById('summaryTitleLabel');
    if (label) label.textContent = titleText;

    UI.updateSummary(data);
}

/**
 * THEME MANAGEMENT
 */
function initTheme() {
    const savedTheme = localStorage.getItem('appTheme') || 'system';
    const themeSelect = document.getElementById('themeSelect');

    applyTheme(savedTheme);

    if (themeSelect) {
        themeSelect.value = savedTheme;
        themeSelect.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            applyTheme(newTheme);
            localStorage.setItem('appTheme', newTheme);
        });
    }
}

function applyTheme(theme) {
    if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}