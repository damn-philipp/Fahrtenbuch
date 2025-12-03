/**
 * APP.JS
 * Hauptanwendung - verbindet alle Komponenten
 */

// Globale Instanz des TripManagers
const tripManager = new TripManager();

// Aktuell bearbeitete Trip-ID (für Edit-Modal)
let editingTripId = null;

/**
 * INITIALISIERUNG
 * Wird beim Laden der Seite ausgeführt
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    attachEventListeners();
});

/**
 * Initialisiert die Applikation
 */
function initializeApp() {
    const state = tripManager.initialize();

    if (state.hasInitialKm) {
        UI.showSetupCard(false);
        UI.updateKmDisplay(tripManager.currentKmStand);
        UI.renderTripList(tripManager.trips);
        UI.updateSummary(tripManager.calculateSummary());

        if (state.hasActiveTrip) {
            UI.showActiveTrip(tripManager.activeTrip);
        }
    } else {
        UI.showSetupCard(true);
    }
}

/**
 * EREIGNIS-HANDLER
 * Verbindet UI-Elemente mit Funktionen
 */
function attachEventListeners() {
    // Setup
    document.getElementById('saveInitialKmBtn').addEventListener('click', handleSaveInitialKm);

    // Trip Type Selection
    document.getElementById('businessBtn').addEventListener('click', () => handleTripTypeSelect('business'));
    document.getElementById('privateBtn').addEventListener('click', () => handleTripTypeSelect('private'));

    // Start/Stop Trip
    document.getElementById('startTripBtn').addEventListener('click', handleStartTrip);
    document.getElementById('endTripBtn').addEventListener('click', handleEndTrip);

    // Export
    document.getElementById('exportBtn').addEventListener('click', handleExport);
    document.getElementById('exportBtn2').addEventListener('click', handleExport);

    // Settings
    document.getElementById('settingsButton').addEventListener('click', () => UI.openSettings());
    document.getElementById('backButton').addEventListener('click', () => UI.closeSettings());
    document.getElementById('closeSettingsBtn').addEventListener('click', () => UI.closeSettings());
    document.getElementById('updateKmBtn').addEventListener('click', handleUpdateKm);
    document.getElementById('clearTripsBtn').addEventListener('click', handleClearAllTrips);
    document.getElementById('resetAppBtn').addEventListener('click', handleResetApp);

    // Edit Modal - Allgemeine Buttons
    document.getElementById('closeEditModalBtn').addEventListener('click', () => UI.closeEditModal());
    document.getElementById('cancelEditBtn').addEventListener('click', () => UI.closeEditModal());
    document.getElementById('saveEditBtn').addEventListener('click', handleSaveEdit);

    // NEU: Edit Modal - Löschen Button (Der neue rote Button im Modal)
    const modalDeleteBtn = document.getElementById('modalDeleteBtn');
    if (modalDeleteBtn) {
        modalDeleteBtn.addEventListener('click', handleModalDeleteTrip);
    }

    // Edit Modal Trip Type
    document.getElementById('editBusinessBtn').addEventListener('click', () => {
        document.getElementById('editBusinessBtn').classList.add('active');
        document.getElementById('editPrivateBtn').classList.remove('active');
    });
    document.getElementById('editPrivateBtn').addEventListener('click', () => {
        document.getElementById('editPrivateBtn').classList.add('active');
        document.getElementById('editBusinessBtn').classList.remove('active');
    });

    // Trip List (Event Delegation)
    // GEÄNDERT: Hört nur noch auf den 'edit-button', da der 'delete-button' aus der Liste entfernt wurde
    document.getElementById('tripList').addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-button')) {
            const tripId = parseInt(e.target.dataset.tripId);
            handleEditTrip(tripId);
        }
    });
}

/**
 * EVENT HANDLER FUNKTIONEN
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
    UI.renderTripList(tripManager.trips);
    UI.updateSummary(tripManager.calculateSummary());
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
        UI.renderTripList(tripManager.trips);
        UI.updateSummary(tripManager.calculateSummary());
        editingTripId = null;
    } else {
        UI.alert('Bitte überprüfe deine Eingaben. Der End-Kilometerstand muss höher sein als der Start-Kilometerstand.');
    }
}

// NEU: Handler für das Löschen aus dem Modal heraus
function handleModalDeleteTrip() {
    // ID holen, die wir in ui.js an den Button gehängt haben
    const btn = document.getElementById('modalDeleteBtn');
    const tripId = parseInt(btn.dataset.tripId);

    if (UI.confirm('Möchten Sie diese Fahrt wirklich unwiderruflich löschen?')) {
        const success = tripManager.deleteTrip(tripId);

        if (success) {
            UI.renderTripList(tripManager.trips);
            UI.updateSummary(tripManager.calculateSummary());
            UI.closeEditModal(); // WICHTIG: Modal schließen
            editingTripId = null;
        } else {
            UI.alert('Fehler beim Löschen der Fahrt.');
        }
    }
}

function handleExport() {
    if (tripManager.trips.length === 0) {
        UI.alert('Keine Fahrten zum Exportieren vorhanden.');
        return;
    }

    const csvContent = tripManager.exportToCSV();
    const filename = `Fahrtenbuch_${new Date().toISOString().split('T')[0]}.csv`;
    UI.downloadCSV(csvContent, filename);
}

function handleUpdateKm() {
    const newKm = parseInt(document.getElementById('editCurrentKm').value);

    if (UI.confirm(`KM-Stand auf ${newKm.toLocaleString('de-DE')} km ändern?`)) {
        if (tripManager.updateCurrentKm(newKm)) {
            UI.updateKmDisplay(tripManager.currentKmStand);
            UI.alert('KM-Stand erfolgreich aktualisiert!');
        } else {
            UI.alert('Bitte gib einen gültigen Kilometerstand ein.');
        }
    }
}

function handleClearAllTrips() {
    if (UI.confirm('Wirklich ALLE Fahrten löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
        if (UI.confirm('Bist du dir absolut sicher? Alle Daten gehen verloren!')) {
            tripManager.clearAllTrips();
            UI.renderTripList(tripManager.trips);
            UI.updateSummary(tripManager.calculateSummary());
            UI.alert('Alle Fahrten wurden gelöscht.');
        }
    }
}

function handleResetApp() {
    if (UI.confirm('Die GESAMTE App zurücksetzen? Alle Daten und Einstellungen gehen verloren!')) {
        if (UI.confirm('Letzte Warnung: Wirklich ALLES löschen?')) {
            tripManager.resetApp();
            location.reload();
        }
    }
}