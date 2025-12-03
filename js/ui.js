/**
 * UI.JS
 * Verwaltet alle UI-Updates (ähnlich wie ein ViewController in C#)
 * Zuständig für: DOM-Manipulation, Anzeigen von Daten, UI-Feedback
 */

class UI {
    /**
     * Zeigt oder versteckt die Setup-Karte
     * @param {boolean} show
     */
    static showSetupCard(show) {
        const setupCard = document.getElementById('setupCard');
        const mainCard = document.getElementById('mainCard');
        const summaryCard = document.getElementById('summaryCard');
        const tripListCard = document.getElementById('tripListCard');

        if (show) {
            setupCard.classList.remove('hidden');
            mainCard.classList.add('hidden');
            summaryCard.classList.add('hidden');
            tripListCard.classList.add('hidden');
        } else {
            setupCard.classList.add('hidden');
            mainCard.classList.remove('hidden');
            summaryCard.classList.remove('hidden');
            tripListCard.classList.remove('hidden');
        }
    }

    /**
     * Aktualisiert die KM-Anzeige
     * @param {number} km
     */
    static updateKmDisplay(km) {
        document.getElementById('currentKm').textContent =
            km.toLocaleString('de-DE') + ' km';
        document.getElementById('editCurrentKm').value = km;
    }

    /**
     * Aktualisiert die Auswahl des Fahrttyps
     * @param {string} type - 'business' oder 'private'
     */
    static updateTripTypeSelection(type) {
        const businessBtn = document.getElementById('businessBtn');
        const privateBtn = document.getElementById('privateBtn');

        businessBtn.classList.remove('active');
        privateBtn.classList.remove('active');

        if (type === 'business') {
            businessBtn.classList.add('active');
        } else {
            privateBtn.classList.add('active');
        }
    }

    /**
     * Zeigt den Zustand einer aktiven Fahrt an
     * @param {Object} trip
     */
    static showActiveTrip(trip) {
        document.getElementById('startSection').classList.add('hidden');
        document.getElementById('endSection').classList.remove('hidden');
        document.getElementById('activeTripDisplay').classList.remove('hidden');

        const typeText = trip.type === 'business' ? 'Geschäftlich' : 'Privat';
        document.getElementById('activeTripType').textContent = typeText;
        document.getElementById('activeTripStart').textContent =
            'Start: ' + trip.startKm.toLocaleString('de-DE') + ' km • ' +
            new Date(trip.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Versteckt die aktive Fahrt und zeigt die Start-Sektion
     */
    static hideActiveTrip() {
        document.getElementById('startSection').classList.remove('hidden');
        document.getElementById('endSection').classList.add('hidden');
        document.getElementById('activeTripDisplay').classList.add('hidden');
    }

    /**
         * Rendert die Fahrten-Liste
         * @param {Array} trips
         */
    static renderTripList(trips) {
        const listElement = document.getElementById('tripList');

        if (trips.length === 0) {
            listElement.innerHTML = '<div class="empty-state">Noch keine Fahrten aufgezeichnet</div>';
            return;
        }

        listElement.innerHTML = trips.map(trip => {
            const typeClass = trip.type === 'private' ? 'private' : '';
            const typeText = trip.type === 'business' ? 'Geschäftlich' : 'Privat';
            const date = new Date(trip.startTime).toLocaleDateString('de-DE');
            const startTime = new Date(trip.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(trip.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            const noteHtml = trip.note ? `<div class="trip-note">📝 ${trip.note}</div>` : '';

            // WICHTIGE ANPASSUNG DER HTML-STRUKTUR FÜR CSS GRID
            return `
                <div class="trip-item ${typeClass}">
                    <div class="trip-item-header">
                        
                        <!-- NEUER WRAPPER FÜR SPALTE 1 -->
                        <div class="trip-info">
                            <span class="trip-type-badge ${typeClass}">${typeText}</span>
                            <div class="trip-details">
                                ${date} • ${startTime} - ${endTime}<br>
                                ${trip.startKm.toLocaleString('de-DE')} km → ${trip.endKm.toLocaleString('de-DE')} km
                            </div>
                        </div>
                        
                        <!-- Distanz (SPALTE 2) -->
                        <span class="trip-distance">${trip.distance} km</span>
                        
                        <!-- Buttons (SPALTE 3) -->
                        <div class="trip-buttons">
                            <button class="edit-button" data-trip-id="${trip.id}">Bearbeiten</button>
                            <button class="delete-button" data-trip-id="${trip.id}">Löschen</button>
                        </div>
                    </div>
                    
                    <!-- Notiz bleibt außerhalb des Headers und nimmt volle Breite ein (wenn vorhanden) -->
                    ${noteHtml}
                </div>
            `;
        }).join('');
    }

    /**
     * Aktualisiert die Zusammenfassung
     * @param {Object} summary - {business: number, private: number}
     */
    static updateSummary(summary) {
        document.getElementById('businessKm').textContent =
            summary.business.toLocaleString('de-DE') + ' km';
        document.getElementById('privateKm').textContent =
            summary.private.toLocaleString('de-DE') + ' km';
    }

    /**
     * Öffnet die Einstellungs-Seite
     */
    static openSettings() {
        document.getElementById('mainContent').classList.add('hidden');
        document.getElementById('settingsContent').classList.remove('hidden');
        document.getElementById('backButton').classList.remove('hidden');
        document.getElementById('settingsButton').classList.add('hidden');
    }

    /**
     * Schließt die Einstellungs-Seite
     */
    static closeSettings() {
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('settingsContent').classList.add('hidden');
        document.getElementById('backButton').classList.add('hidden');
        document.getElementById('settingsButton').classList.remove('hidden');
    }

    /**
     * Öffnet das Bearbeitungs-Modal
     * @param {Object} trip
     */
    static openEditModal(trip) {
        document.getElementById('editStartKm').value = trip.startKm;
        document.getElementById('editEndKm').value = trip.endKm;
        document.getElementById('editTripNote').value = trip.note || '';

        const businessBtn = document.getElementById('editBusinessBtn');
        const privateBtn = document.getElementById('editPrivateBtn');

        businessBtn.classList.remove('active');
        privateBtn.classList.remove('active');

        if (trip.type === 'business') {
            businessBtn.classList.add('active');
        } else {
            privateBtn.classList.add('active');
        }

        document.getElementById('editModal').classList.add('active');
    }

    /**
     * Schließt das Bearbeitungs-Modal
     */
    static closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
    }

    /**
     * Zeigt eine Bestätigungsdialog
     * @param {string} message
     * @returns {boolean}
     */
    static confirm(message) {
        return confirm(message);
    }

    /**
     * Zeigt eine Hinweismeldung
     * @param {string} message
     */
    static alert(message) {
        alert(message);
    }

    /**
     * Lädt eine CSV-Datei herunter
     * @param {string} csvContent
     * @param {string} filename
     */
    static downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Leert ein Input-Feld
     * @param {string} elementId
     */
    static clearInput(elementId) {
        document.getElementById(elementId).value = '';
    }
}