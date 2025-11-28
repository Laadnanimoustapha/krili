"use client";

import { useEffect } from "react";

export function LanguageSwitcher() {
    useEffect(() => {
        // Define the initialization function on window
        (window as any).googleTranslateElementInit = () => {
            new (window as any).google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'ar,fr,en',
                    layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                },
                'google_translate_element'
            );
        };

        // Check if script is already loaded
        if (!(window as any).google?.translate) {
            // Inject the Google Translate script
            const script = document.createElement('script');
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.head.appendChild(script);

            // Cleanup function
            return () => {
                // Remove script when component unmounts
                const existingScript = document.querySelector(
                    'script[src*="translate.google.com"]'
                );
                if (existingScript) {
                    document.head.removeChild(existingScript);
                }
            };
        } else {
            // If already loaded, just initialize
            (window as any).googleTranslateElementInit();
        }
    }, []);

    return (
        <div className="flex items-center h-10">
            <div
                id="google_translate_element"
                className="flex items-center"
            />
        </div>
    );
}
