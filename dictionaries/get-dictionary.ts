import 'server-only'

const dictionaries = {
    en: () => import('./en.json').then((module) => module.default),
    fr: () => import('./fr.json').then((module) => module.default),
    ar: () => import('./ar.json').then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
    if (locale && dictionaries[locale as keyof typeof dictionaries]) {
        return dictionaries[locale as keyof typeof dictionaries]()
    }
    return dictionaries.en()
}
