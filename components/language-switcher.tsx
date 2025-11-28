"use client";

import { useEffect, useState } from "react";

export function LanguageSwitcher() {
    const [language, setLanguage] = useState("en");

    useEffect(() => {
        // 1. Initialize from localStorage if available
        const storedLang = localStorage.getItem("language");
        if (storedLang && ["en", "ar", "fr"].includes(storedLang)) {
            setLanguage(storedLang);
        }
    }, []);

    useEffect(() => {
        // 2. Apply changes whenever language state updates
        const html = document.documentElement;
        const body = document.body;

        // Set lang attribute
        html.setAttribute("lang", language);

        // Handle RTL for Arabic
        if (language === "ar") {
            html.setAttribute("dir", "rtl");
            body.classList.add("translated-ar");
            body.classList.remove("translated-fr");
        } else {
            html.setAttribute("dir", "ltr");
            body.classList.remove("translated-ar");

            // Handle French specific class
            if (language === "fr") {
                body.classList.add("translated-fr");
            } else {
                body.classList.remove("translated-fr");
            }
        }

        // Persist to localStorage
        localStorage.setItem("language", language);
    }, [language]);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
    };

    return (
        <div className="relative">
            <select
                value={language}
                onChange={handleLanguageChange}
                className="appearance-none bg-background border border-input text-foreground rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Select Language"
            >
                <option value="en">English (EN)</option>
                <option value="fr">Français (FR)</option>
                <option value="ar">العربية (AR)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground/50">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
            </div>
        </div>
    );
}
