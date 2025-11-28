"use client";

import { useEffect } from "react";

export function LanguageSwitcher() {
    useEffect(() => {
        // Prevent auto-translation by clearing any existing translation first
        const checkAndClearTranslation = () => {
            const htmlElement = document.documentElement;
            // Remove the translated class if it exists
            if (htmlElement.classList.contains('translated-ltr') ||
                htmlElement.classList.contains('translated-rtl')) {
                htmlElement.classList.remove('translated-ltr', 'translated-rtl');
                // Reload to clear translation
                window.location.reload();
            }
        };

        // Define the initialization function on window
        (window as any).googleTranslateElementInit = () => {
            // Clear the container first to prevent duplicate widgets
            const container = document.getElementById('google_translate_element');
            if (container) {
                container.innerHTML = '';
            }

            new (window as any).google.translate.TranslateElement(
                {
                    pageLanguage: 'en', // Set source language as English
                    includedLanguages: 'ar,fr,en', // Only these languages
                    layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false, // Prevent automatic translation
                    multilanguagePage: true, // Prevent auto-detection
                },
                'google_translate_element'
            );
        };

        // Check if script is already loaded
        if (!(window as any).google?.translate) {
            // Inject the Google Translate script only if not present
            const script = document.createElement('script');
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            script.defer = true;
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
        } else if (!document.getElementById('google_translate_element')?.hasChildNodes()) {
            // Only re-initialize if the container is empty
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
