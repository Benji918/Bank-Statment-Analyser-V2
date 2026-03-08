import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
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
            }
        },
    },
    plugins: [],
} satisfies Config
