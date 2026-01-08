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
        const privateCostCard = document.getElementById('privateCostCard');

        if (show) {
            setupCard.classList.remove('hidden');
            mainCard.classList.add('hidden');
            summaryCard.classList.add('hidden');
            tripListCard.classList.add('hidden');
            if (privateCostCard) privateCostCard.classList.add('hidden');
        } else {
            setupCard.classList.add('hidden');
            mainCard.classList.remove('hidden');
            summaryCard.classList.remove('hidden');
            tripListCard.classList.remove('hidden');
            if (privateCostCard) privateCostCard.classList.remove('hidden');
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

        const typeText = trip.type === 'business' ? 'Dienstlich' : 'Privat';
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
      * @param {Array} trips - Alle Fahrten
      * @param {number} limit - Wie viele angezeigt werden sollen (Default 10)
      */
    static renderTripList(trips, limit = 10) {
        const listElement = document.getElementById('tripList');

        if (trips.length === 0) {
            listElement.innerHTML = '<div class="empty-state">Noch keine Fahrten aufgezeichnet</div>';
            return;
        }

        // 1. Array zuschneiden (nur die ersten 'limit' Einträge nehmen)
        const visibleTrips = trips.slice(0, limit);

        // 2. Prüfen, ob es noch mehr Fahrten gibt
        const hasMore = trips.length > limit;

        // 3. HTML für die Fahrten generieren
        let htmlContent = visibleTrips.map(trip => {
            const typeClass = trip.type === 'private' ? 'private' : '';
            const typeText = trip.type === 'business' ? 'Dienstlich' : 'Privat';
            const date = new Date(trip.startTime).toLocaleDateString('de-DE');
            const startTime = new Date(trip.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(trip.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            const noteHtml = trip.note ? `<div class="trip-note">📝 ${trip.note}</div>` : '';

            return `
                <div class="trip-item ${typeClass}">
                    <div class="trip-item-header">
                        <div class="trip-info">
                            <span class="trip-type-badge ${typeClass}">${typeText}</span>
                            <div class="trip-details">
                                ${date} • ${startTime} - ${endTime}<br>
                                ${trip.startKm.toLocaleString('de-DE')} km → ${trip.endKm.toLocaleString('de-DE')} km
                            </div>
                        </div>
                        
                        <span class="trip-distance">${trip.distance} km</span>
                        
                        <div class="trip-buttons">
                            <button class="edit-button icon-btn" data-trip-id="${trip.id}" aria-label="Bearbeiten">
<svg width="20" height="20" viewBox="0 0 23.6475 23.3041" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">
    <path d="M17.0714 3.37706L15.5591 4.88935L7.07275 4.88935C5.47119 4.88935 4.56299 5.79755 4.56299 7.39912L4.56299 16.5397C4.56299 18.1511 5.47119 19.0495 7.07275 19.0495L16.2134 19.0495C17.8247 19.0495 18.7231 18.1511 18.7231 16.5397L18.7231 8.12957L20.2422 6.60772C20.2787 6.85929 20.2954 7.12741 20.2954 7.40888L20.2954 16.5397C20.2954 19.1667 18.8403 20.6218 16.2134 20.6218L7.07275 20.6218C4.45557 20.6218 2.99072 19.1667 2.99072 16.5397L2.99072 7.40888C2.99072 4.78193 4.45557 3.31708 7.07275 3.31708L16.2134 3.31708C16.5157 3.31708 16.8024 3.33648 17.0714 3.37706Z" fill="currentColor" />
    <path d="M9.61182 14.2936L11.5161 13.4636L20.6372 4.35224L19.2993 3.03388L10.188 12.1452L9.30908 13.9811C9.23096 14.1472 9.42627 14.3718 9.61182 14.2936ZM21.3599 3.63935L22.063 2.91669C22.395 2.56513 22.395 2.09638 22.063 1.77412L21.8384 1.53974C21.5356 1.23701 21.0571 1.27607 20.7349 1.58857L20.022 2.29169Z" fill="currentColor" />
</svg>
                            </button>
                        </div>
                    </div>
                    ${noteHtml}
                </div> 
            `;
        }).join('');

        // 4. "Mehr anzeigen" Button hinzufügen, falls nötig
        if (hasMore) {
            const remaining = trips.length - limit;
            htmlContent += `
    <div style="text-align: center; margin-top: 20px; margin-bottom: 10px;">
        <!-- ÄNDERUNG: display: inline-flex, align-items: center, justify-content: center hinzugefügt -->
        <button id="showMoreBtn" class="action-button button-secondary" 
                style="width: auto; padding: 12px 24px; font-size: 15px; display: inline-flex; align-items: center; justify-content: center;">
            ${remaining} weitere anzeigen
        </button>
    </div>
`;
        }

        listElement.innerHTML = htmlContent;
    }

    /**
         * Aktualisiert die Zusammenfassung mit Animation
         * @param {Object} summary - {business, private, total}
         */
    static updateSummary(summary) {
        // Wir holen die aktuellen Werte aus dem DOM, um von dort aus zu starten
        // (Falls 0 da steht, zählen wir von 0. Falls 100 da steht, von 100.)
        const busElem = document.getElementById('businessKm');
        const privElem = document.getElementById('privateKm');
        const totElem = document.getElementById('totalKm'); // NEU

        // Hilfsfunktion aufrufen
        UI.animateValue(busElem, summary.business);
        UI.animateValue(privElem, summary.private);
        if (totElem) UI.animateValue(totElem, summary.total);
    }

    /**
     * Aktualisiert die Privatnutzung-Analyse
     * @param {Object} analysis - {costPerKm, totalPrivateKm, totalCost}
     */
    static updatePrivateAnalysis(analysis) {
        const costPerKmElem = document.getElementById('costPerKm');
        const totalPrivateKmElem = document.getElementById('totalPrivateKmSinceStart');
        const totalPrivateCostElem = document.getElementById('totalPrivateCost');

        if (costPerKmElem) {
            costPerKmElem.textContent = analysis.costPerKm.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR'
            });
        }

        if (totalPrivateKmElem) {
            UI.animateValue(totalPrivateKmElem, analysis.totalPrivateKm);
        }

        if (totalPrivateCostElem) {
            totalPrivateCostElem.textContent = analysis.totalCost.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR'
            });
        }
    }

    /**
     * Setzt die Werte in den Einstellungen
     * @param {number} price
     * @param {string} date
     */
    static setSettingsValues(price, date) {
        const priceInput = document.getElementById('privatePrice');
        const dateInput = document.getElementById('startDate');

        if (priceInput) priceInput.value = price;
        if (dateInput) dateInput.value = date;
    }

    /**
 * Animiert eine Zahl in einem Element
 */
    static animateValue(element, endValue) {
        if (!element) return;

        // Startwert aus dem Text parsen (z.B. "1.200 km" -> 1200)
        const currentText = element.textContent.replace(/[^0-9]/g, ''); // Alles außer Zahlen entfernen
        const startValue = parseInt(currentText) || 0; // Fallback auf 0

        // Wenn kein Unterschied, nichts tun
        if (startValue === endValue) {
            element.textContent = endValue.toLocaleString('de-DE') + ' km';
            return;
        }

        const duration = 500; // Animation dauert 500ms (0.5 sek)
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1); // Fortschritt 0 bis 1

            // Easing (optional: macht es weicher) - EaseOutQuad
            const ease = 1 - (1 - progress) * (1 - progress);

            // Aktuellen Zwischenwert berechnen
            const current = Math.floor(startValue + (endValue - startValue) * ease);

            element.textContent = current.toLocaleString('de-DE') + ' km';

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                // Sicherstellen, dass am Ende der exakte Wert steht
                element.textContent = endValue.toLocaleString('de-DE') + ' km';
            }
        };

        requestAnimationFrame(updateNumber);
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

        // WICHTIG: Wir speichern die ID am Löschen-Button im Modal
        const deleteBtn = document.getElementById('modalDeleteBtn');
        if (deleteBtn) deleteBtn.dataset.tripId = trip.id;

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
