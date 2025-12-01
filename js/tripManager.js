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
            private: privateTotal
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