'use client';

export function LanguageSwitcher() {
    return (
        <button
            onClick={() => console.log('--- LANGUAGE TEST CLICKED, NO LAG ---')}
            style={{ background: 'orange', padding: '10px' }}
        >
            LAG TEST
        </button>
    );
}
