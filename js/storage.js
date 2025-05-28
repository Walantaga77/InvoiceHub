// storage.js

export const storage = {
    /**
     * Mengambil data dari localStorage
     * @param {string} key
     * @returns {any}
     */
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : [];
        } catch (e) {
            console.error('Failed to parse storage item:', key, e);
            return [];
        }
    },

    /**
     * Menyimpan data ke localStorage
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Failed to save storage item:', key, e);
        }
    },

    /**
     * Menghapus data dari localStorage
     * @param {string} key
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * Menghapus semua data di localStorage
     */
    clear() {
        localStorage.clear();
    }
};
