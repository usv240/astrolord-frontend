/**
 * Chart Types
 * Type definitions for chart data structures
 */

export interface Planet {
    name: string;
    current_sign: number;
    house_number?: number;
    fullDegree: number;
    normDegree: number;
    isRetro: string;
}

export interface DivisionalPlanet {
    name: string;
    current_sign: number;
    house_number: number;
    isRetro: string;
}

export interface DashaEntry {
    start_time: string;
    end_time: string;
}

export interface ChartBundle {
    chart_id: string;
    fingerprint: string;
    base: {
        request_subject: {
            name: string;
            dob: string;
            time: string;
            location: {
                city: string;
                lat: number;
                lon: number;
                tz: string;
            };
        };
        charts: {
            planets: Planet[];
            navamsa: Record<string, DivisionalPlanet>;
            divisionals: any;
            divisionals_available: string[];
        };
        dashas: Record<string, Record<string, DashaEntry>>;
        meta: {
            system: string;
            provider: string;
            owner_user_id: string;
            dasha_observation_point: string;
            dasha_ayanamsha: string;
        };
    };
    divisionals: Record<string, Record<string, DivisionalPlanet>>;
    dashas: Record<string, Record<string, DashaEntry>>;
    meta: {
        aggregated: boolean;
        requested_divisionals: string;
    };
}

export const ZODIAC_SIGNS = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
];

export const getZodiacSign = (signNumber: number): string => {
    return ZODIAC_SIGNS[signNumber - 1] || 'Unknown';
};
