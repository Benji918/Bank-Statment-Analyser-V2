import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#0000EE",
                accent: "#0099FF",
                background: "#000000",
                textPrimary: "#000000",
                link: "#0099FF"
            },
            fontFamily: {
                primary: ["Inter", "sans-serif"],
                heading: ["GT Walsheim", "sans-serif"],
                paragraph: ["Inter", "sans-serif"]
            },
            borderRadius: {
                DEFAULT: "8px",
                full: "100px"
            },
            animation: {
                'slide-in': 'slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fade-in 0.5s ease-out',
                'scale-up': 'scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            keyframes: {
                'slide-in': {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'scale-up': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config
