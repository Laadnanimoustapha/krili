"use client";

import { useState } from "react";

export function LanguageSwitcher() {
    const [language, setLanguage] = useState("en");

    return (
        <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-background border border-input text-foreground rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="ar">AR</option>
        </select>
    );
}
