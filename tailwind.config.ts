import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: "#18181b",
                    secondary: "#111113",
                    elevated: "#1f1f23",
                    hover: "#27272a",
                },
                border: {
                    DEFAULT: "#2e2e33",
                    hover: "#3f3f46",
                },
                accent: {
                    DEFAULT: "#8b5cf6",
                    hover: "#7c3aed",
                    glow: "rgba(139, 92, 246, 0.15)",
                    muted: "rgba(139, 92, 246, 0.08)",
                },
                status: {
                    planned: "#71717a",
                    scripted: "#f59e0b",
                    shot: "#22c55e",
                    edited: "#8b5cf6",
                    published: "#3b82f6",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-up": "slideUp 0.3s ease-out",
                "slide-in-right": "slideInRight 0.2s ease-out",
                "glow-pulse": "glowPulse 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(10px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                glowPulse: {
                    "0%, 100%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.1)" },
                    "50%": { boxShadow: "0 0 25px rgba(139, 92, 246, 0.25)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
