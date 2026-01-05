/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#1d6daa',    // RealT Mavisi
                    dark: '#0f172a',    // Koyu Lacivert (Slate 900)
                    red: '#90162d',     // RealT Kırmızısı
                    light: '#f8fafc',   // Çok açık gri (Arka plan için)
                }
            }
        },
    },
    plugins: [],
}