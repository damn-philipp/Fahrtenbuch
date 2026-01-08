/**
 * STORAGE.JS
 * Verwaltet alle Daten im localStorage (ähnlich wie ein Repository in C#)
 * Zuständig für: Laden, Speichern, Löschen von Daten
 */

class Storage {
    // Keys für localStorage
    static KEYS = {
        CURRENT_KM: 'currentKm',
        TRIPS: 'trips',
        ACTIVE_TRIP: 'activeTrip',
        PRIVATE_PRICE: 'privatePrice',
        START_DATE: 'startDate'
    };

    /**
     * Lädt den Preis für die Privatnutzung
     * @returns {number}
     */
    static getPrivatePrice() {
        const price = localStorage.getItem(this.KEYS.PRIVATE_PRICE);
        return price ? parseFloat(price) : 251.00;
    }

    /**
     * Speichert den Preis für die Privatnutzung
     * @param {number} price
     */
    static savePrivatePrice(price) {
        localStorage.setItem(this.KEYS.PRIVATE_PRICE, price.toString());
    }

    /**
     * Lädt das Startdatum
     * @returns {string}
     */
    static getStartDate() {
        const date = localStorage.getItem(this.KEYS.START_DATE);
        return date || '2025-12-01';
    }

    /**
     * Speichert das Startdatum
     * @param {string} date
     */
    static saveStartDate(date) {
        localStorage.setItem(this.KEYS.START_DATE, date);
    }

    /**
     * Lädt den aktuellen KM-Stand
     * @returns {number|null}
     */
    static getCurrentKm() {
        const km = localStorage.getItem(this.KEYS.CURRENT_KM);
        return km ? parseInt(km) : null;
    }

    /**
     * Speichert den aktuellen KM-Stand
     * @param {number} km
     */
    static saveCurrentKm(km) {
        localStorage.setItem(this.KEYS.CURRENT_KM, km.toString());
    }

    /**
     * Lädt alle Fahrten
     * @returns {Array}
     */
    static getTrips() {
        const trips = localStorage.getItem(this.KEYS.TRIPS);
        return trips ? JSON.parse(trips) : [];
    }

    /**
     * Speichert alle Fahrten
     * @param {Array} trips
     */
    static saveTrips(trips) {
        localStorage.setItem(this.KEYS.TRIPS, JSON.stringify(trips));
    }

    /**
     * Lädt die aktive Fahrt
     * @returns {Object|null}
     */
    static getActiveTrip() {
        const trip = localStorage.getItem(this.KEYS.ACTIVE_TRIP);
        return trip ? JSON.parse(trip) : null;
    }

    /**
     * Speichert die aktive Fahrt
     * @param {Object} trip
     */
    static saveActiveTrip(trip) {
        localStorage.setItem(this.KEYS.ACTIVE_TRIP, JSON.stringify(trip));
    }

    /**
     * Löscht die aktive Fahrt
     */
    static clearActiveTrip() {
        localStorage.removeItem(this.KEYS.ACTIVE_TRIP);
    }

    /**
     * Löscht alle Fahrten (KM-Stand bleibt erhalten)
     */
    static clearAllTrips() {
        localStorage.removeItem(this.KEYS.TRIPS);
    }

    /**
     * Löscht ALLE Daten (kompletter Reset)
     */
    static clearAll() {
        localStorage.clear();
    }
}