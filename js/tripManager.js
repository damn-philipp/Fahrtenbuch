/**
 * TRIPMANAGER.JS
 * Business-Logik für Fahrten (ähnlich wie ein Service in C#)
 * Zuständig für: Fahrt starten, beenden, bearbeiten, löschen, berechnen
 */

class TripManager {
    constructor() {
        this.currentKmStand = 0;
        this.activeTrip = null;
        this.trips = [];
        this.selectedType = 'business';
    }

    /**
     * Initialisiert den TripManager mit gespeicherten Daten
     */
    initialize() {
        // Lade gespeicherte Daten
        const savedKm = Storage.getCurrentKm();
        const savedTrips = Storage.getTrips();
        const savedActiveTrip = Storage.getActiveTrip();

        if (savedKm !== null) {
            this.currentKmStand = savedKm;
        }

        if (savedTrips.length > 0) {
            this.trips = savedTrips;
        }

        if (savedActiveTrip) {
            this.activeTrip = savedActiveTrip;
        }

        return {
            hasInitialKm: savedKm !== null,
            hasActiveTrip: savedActiveTrip !== null
        };
    }

    /**
     * Setzt den initialen KM-Stand
     * @param {number} km
     * @returns {boolean}
     */
    setInitialKm(km) {
        if (isNaN(km) || km < 0) {
            return false;
        }

        this.currentKmStand = km;
        Storage.saveCurrentKm(km);
        return true;
    }

    /**
     * Aktualisiert den aktuellen KM-Stand
     * @param {number} km
     * @returns {boolean}
     */
    updateCurrentKm(km) {
        if (isNaN(km) || km < 0) {
            return false;
        }

        this.currentKmStand = km;
        Storage.saveCurrentKm(km);
        return true;
    }

    /**
     * Setzt den Fahrttyp (business/private)
     * @param {string} type
     */
    setTripType(type) {
        this.selectedType = type;
    }

    /**
     * Startet eine neue Fahrt
     * @param {string} note - Optionale Notiz
     * @returns {Object}
     */
    startTrip(note = '') {
        this.activeTrip = {
            type: this.selectedType,
            startKm: this.currentKmStand,
            startTime: new Date().toISOString(),
            note: note.trim()
        };

        Storage.saveActiveTrip(this.activeTrip);
        return this.activeTrip;
    }

    /**
     * Beendet die aktive Fahrt
     * @param {number} endKm
     * @returns {Object|null} - Die fertige Fahrt oder null bei Fehler
     */
    endTrip(endKm) {
        if (isNaN(endKm) || endKm < 0) {
            return { error: 'Ungültiger Kilometerstand' };
        }

        if (endKm <= this.activeTrip.startKm) {
            return { error: 'End-KM muss höher sein als Start-KM' };
        }

        const distance = endKm - this.activeTrip.startKm;

        const trip = {
            id: Date.now(),
            type: this.activeTrip.type,
            startKm: this.activeTrip.startKm,
            endKm: endKm,
            distance: distance,
            startTime: this.activeTrip.startTime,
            endTime: new Date().toISOString(),
            note: this.activeTrip.note || ''
        };

        // Füge Fahrt an den Anfang der Liste
        this.trips.unshift(trip);
        this.currentKmStand = endKm;

        // Speichere alles
        Storage.saveTrips(this.trips);
        Storage.saveCurrentKm(this.currentKmStand);
        Storage.clearActiveTrip();

        this.activeTrip = null;

        return { success: true, trip: trip };
    }

    /**
     * Findet eine Fahrt anhand der ID
     * @param {number} id
     * @returns {Object|null}
     */
    findTripById(id) {
        return this.trips.find(t => t.id === id);
    }

    /**
     * Aktualisiert eine Fahrt
     * @param {number} id
     * @param {Object} updates - {type, startKm, endKm, note}
     * @returns {boolean}
     */
    updateTrip(id, updates) {
        const tripIndex = this.trips.findIndex(t => t.id === id);
        if (tripIndex === -1) return false;

        const { type, startKm, endKm, note } = updates;

        if (isNaN(startKm) || isNaN(endKm) || startKm < 0 || endKm < 0) {
            return false;
        }

        if (endKm <= startKm) {
            return false;
        }

        this.trips[tripIndex] = {
            ...this.trips[tripIndex],
            type: type,
            startKm: startKm,
            endKm: endKm,
            distance: endKm - startKm,
            note: note || ''
        };

        Storage.saveTrips(this.trips);
        return true;
    }

    /**
     * Löscht eine Fahrt
     * @param {number} id
     * @returns {boolean}
     */
    deleteTrip(id) {
        const initialLength = this.trips.length;
        this.trips = this.trips.filter(t => t.id !== id);

        if (this.trips.length < initialLength) {
            Storage.saveTrips(this.trips);
            return true;
        }

        return false;
    }

    /**
     * Berechnet die Gesamtkilometer nach Typ
     * @returns {Object} {business: number, private: number}
     */
    calculateSummary() {
        const businessTotal = this.trips
            .filter(t => t.type === 'business')
            .reduce((sum, t) => sum + t.distance, 0);

        const privateTotal = this.trips
            .filter(t => t.type === 'private')
            .reduce((sum, t) => sum + t.distance, 0);

        return {
            business: businessTotal,
            private: privateTotal,
            total: businessTotal + privateTotal // NEU
        };
    }

    /**
     * Berechnet die Kilometer für die aktuelle Woche (Mo - So)
     * @returns {Object} {business: number, private: number}
     */
    calculateWeeklySummary() {
        const now = new Date();
        const currentDay = now.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

        const monday = new Date(now);
        monday.setDate(now.getDate() - distanceToMonday);
        monday.setHours(0, 0, 0, 0);

        const weeklyTrips = this.trips.filter(t => new Date(t.startTime) >= monday);

        const businessTotal = weeklyTrips
            .filter(t => t.type === 'business')
            .reduce((sum, t) => sum + t.distance, 0);

        const privateTotal = weeklyTrips
            .filter(t => t.type === 'private')
            .reduce((sum, t) => sum + t.distance, 0);

        return {
            business: businessTotal,
            private: privateTotal,
            total: businessTotal + privateTotal // NEU
        };
    }

    /**
     * Exportiert Fahrten als CSV
     * @returns {string} CSV-Inhalt
     */
    exportToCSV() {
        let csv = 'Datum,Start Zeit,Ende Zeit,Typ,Start KM,Ende KM,Distanz,Notiz\n';

        this.trips.forEach(trip => {
            const date = new Date(trip.startTime).toLocaleDateString('de-DE');
            const startTime = new Date(trip.startTime).toLocaleTimeString('de-DE');
            const endTime = new Date(trip.endTime).toLocaleTimeString('de-DE');
            const type = trip.type === 'business' ? 'Geschäftlich' : 'Privat';
            const note = (trip.note || '').replace(/"/g, '""');

            csv += `${date},${startTime},${endTime},${type},${trip.startKm},${trip.endKm},${trip.distance},"${note}"\n`;
        });
        return csv;
    }

    /**
     * Erstellt einen Wochen/Monatsbericht als CSV
     * Struktur: Monatssummen und Wochensummen
     */
    exportWeeklyReport() {
        if (this.trips.length === 0) return '';

        // 1. Fahrten chronologisch sortieren (damit der Bericht von Alt nach Neu oder umgekehrt lesbar ist)
        // Wir sortieren hier absteigend (neueste zuerst), wie in der Liste.
        const sortedTrips = [...this.trips].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        // Datenstruktur zum Sammeln
        const grouping = {};

        // 2. Daten aggregieren
        sortedTrips.forEach(trip => {
            const date = new Date(trip.startTime);
            const year = date.getFullYear();
            const month = date.toLocaleString('de-DE', { month: 'long' });
            const monthKey = `${year}-${date.getMonth()}`; // Zum Sortieren (z.B. 2025-11)

            // Kalenderwoche berechnen
            const weekInfo = this.getWeekNumber(date);
            const weekKey = `${year}-W${weekInfo[1]}`;

            // Monat initialisieren
            if (!grouping[monthKey]) {
                grouping[monthKey] = {
                    name: month,
                    year: year,
                    business: 0,
                    private: 0,
                    weeks: {}
                };
            }

            // Woche initialisieren
            if (!grouping[monthKey].weeks[weekKey]) {
                const weekRange = this.getDateRangeOfWeek(weekInfo[1], year);
                grouping[monthKey].weeks[weekKey] = {
                    range: weekRange,
                    business: 0,
                    private: 0
                };
            }

            // Werte addieren
            if (trip.type === 'business') {
                grouping[monthKey].business += trip.distance;
                grouping[monthKey].weeks[weekKey].business += trip.distance;
            } else {
                grouping[monthKey].private += trip.distance;
                grouping[monthKey].weeks[weekKey].private += trip.distance;
            }
        });

        // 3. CSV String bauen
        let csv = 'Zeitraum,Typ,Dienstlich (km),Privat (km),Gesamt (km)\n';

        // Durch die Monate iterieren
        Object.keys(grouping).forEach(mKey => {
            const monthData = grouping[mKey];
            const totalMonth = monthData.business + monthData.private;

            // A) MONATS-ÜBERSCHRIFT (Dient als Trenner/Summe)
            csv += `\n"${monthData.name} ${monthData.year} (Gesamt)",Monatsabschluss,${monthData.business},${monthData.private},${totalMonth}\n`;

            // B) WOCHEN-ZEILEN
            Object.keys(monthData.weeks).forEach(wKey => {
                const weekData = monthData.weeks[wKey];
                const totalWeek = weekData.business + weekData.private;

                csv += `"${weekData.range}",Wochensumme,${weekData.business},${weekData.private},${totalWeek}\n`;
            });
        });

        return csv;
    }

    /**
     * Hilfsfunktion: Gibt [Jahr, Woche] zurück
     */
    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return [d.getUTCFullYear(), weekNo];
    }

    /**
     * Hilfsfunktion: Gibt den Datumsbereich einer KW als String zurück
     * z.B. "01.12.25 - 07.12.25"
     */
    getDateRangeOfWeek(w, y) {
        var simple = new Date(y, 0, 1 + (w - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

        const ISOweekEnd = new Date(ISOweekStart);
        ISOweekEnd.setDate(ISOweekStart.getDate() + 6);

        const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
        return `${ISOweekStart.toLocaleDateString('de-DE', options)} - ${ISOweekEnd.toLocaleDateString('de-DE', options)}`;
    }

    /**
     * Löscht alle Fahrten
     */
    clearAllTrips() {
        this.trips = [];
        Storage.clearAllTrips();
    }

    /**
     * Setzt die komplette App zurück
     */
    resetApp() {
        Storage.clearAll();
        this.currentKmStand = 0;
        this.activeTrip = null;
        this.trips = [];
        this.selectedType = 'business';
    }
}