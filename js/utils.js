/**
 * Format angka menjadi mata uang Rupiah
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Fungsi debounce untuk optimasi input event seperti pencarian
 * @param {function} fn 
 * @param {number} delay 
 * @returns {function}
 */
export function debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Generate UUID v4 menggunakan crypto bawaan browser
 * @returns {string}
 */
export function generateUUID() {
    return crypto.randomUUID();
}

export function numberToWords(n) {
    const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"];
    const belasan = ["Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas", "Lima Belas", "Enam Belas", "Tujuh Belas", "Delapan Belas", "Sembilan Belas"];
    const tingkat = ["", "Ribu", "Juta", "Miliar", "Triliun"];

    if (n === 0) return "Nol";

    function toWords(n) {
        if (n < 10) return satuan[n];
        if (n < 20) return belasan[n - 10];
        if (n < 100) return satuan[Math.floor(n / 10)] + " Puluh " + satuan[n % 10];
        if (n < 200) return "Seratus " + toWords(n - 100);
        if (n < 1000) return satuan[Math.floor(n / 100)] + " Ratus " + toWords(n % 100);
        return "";
    }

    let result = "";
    let i = 0;
    while (n > 0) {
        const part = n % 1000;
        if (part !== 0) {
            const partStr = (part === 1 && i === 1) ? "Seribu" : toWords(part);
            result = `${partStr} ${tingkat[i]} ${result}`;
        }
        n = Math.floor(n / 1000);
        i++;
    }

    return result.trim();
}

