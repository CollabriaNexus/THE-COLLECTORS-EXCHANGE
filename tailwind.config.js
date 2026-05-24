/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-bg': '#FFFFFF',
                'obsidian': '#0A0A0A',
                'brass': '#B8860B',
                'cream': '#FDFBF7',
                'secondary-bg': '#F9F9F9',
                'luxury-gold': '#D4AF37',
                'text-main': '#000000',
                'text-inverse': '#FFFFFF',
                // Heritage palette for Shop page
                'heritage': {
                    'charcoal': '#1C1C1C',
                    'dark': '#2A2A2A',
                    'brown': '#3D3028',
                    'warm': '#4A3F35',
                    'beige': '#F5F0E8',
                    'cream': '#FAF8F5',
                    'bronze': '#8B7355',
                    'gold-muted': '#C9A962',
                },
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
            boxShadow: {
                'heritage': '0 4px 20px rgba(0, 0, 0, 0.08)',
                'heritage-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
            },
        },
    },
    plugins: [],
}
