import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Localization from 'expo-localization';

const translations = {
    en: {
        welcome: 'Namaste',
        dashboard: 'Dashboard',
        stats: {
            hours: 'Care Hours',
            points: 'Points',
            jobs: 'Care Jobs'
        },
        actions: {
            log: 'Log Activity',
            find: 'Find Jobs',
            portfolio: 'My Portfolio',
            rewards: 'Rewards'
        },
        common: {
            seeAll: 'See All',
            back: 'Back',
            submit: 'Submit'
        }
    },
    ne: {
        welcome: 'नमस्ते',
        dashboard: 'ड्यासबोर्ड',
        stats: {
            hours: 'हेरचाह घण्टा',
            points: 'अंक',
            jobs: 'काम उपलब्ध'
        },
        actions: {
            log: 'क्रियाकलाप थप्नुहोस्',
            find: 'काम खोज्नुहोस्',
            portfolio: 'मेरो पोर्टफोलियो',
            rewards: 'पुरस्कार'
        },
        common: {
            seeAll: 'सबै हेर्नुहोस्',
            back: 'फिर्ता',
            submit: 'पेश गर्नुहोस्'
        }
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [locale, setLocale] = useState('en');

    const t = (path) => {
        const keys = path.split('.');
        let result = translations[locale];
        for (const key of keys) {
            if (result[key]) {
                result = result[key];
            } else {
                return path;
            }
        }
        return result;
    };

    const toggleLanguage = () => {
        setLocale(prev => prev === 'en' ? 'ne' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ locale, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
