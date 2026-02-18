/**
 * CBS Snapshot — Static market data generated from israel-statistics-mcp.
 * This data feeds the Opportunity Explorer.
 */

export interface Region {
    id: string;
    name: string;
    nameHe: string;
    annualGrowth: number;      // YoY %
    avgPricePerSqm: number;    // ILS/sqm
}

export interface Neighborhood {
    name: string;
    nameHe: string;
    city: string;
    avgPrice: number;
    avgPricePerSqm: number;
    trend: 'rising' | 'stable' | 'cooling';
    rooms: string;              // Typical apartment size
    yearOverYear: number;       // % change
}

export interface MarketSnapshot {
    lastUpdate: string;
    cpiValue: number;
    cpiChange: number;
    constructionIndex: number;
    constructionChange: number;
    regions: Region[];
    neighborhoods: Neighborhood[];
    alerts: string[];
}

const snapshot: MarketSnapshot = {
    lastUpdate: '2026-02-17',
    cpiValue: 103.3,
    cpiChange: -0.3,
    constructionIndex: 101.3,
    constructionChange: 0.1,
    regions: [
        { id: 'tlv', name: 'Tel Aviv', nameHe: 'תל אביב', annualGrowth: 5.2, avgPricePerSqm: 58_000 },
        { id: 'ctr', name: 'Center', nameHe: 'מרכז', annualGrowth: 4.5, avgPricePerSqm: 36_000 },
        { id: 'jlm', name: 'Jerusalem', nameHe: 'ירושלים', annualGrowth: 4.0, avgPricePerSqm: 38_500 },
        { id: 'hfa', name: 'Haifa', nameHe: 'חיפה', annualGrowth: 3.1, avgPricePerSqm: 22_000 },
        { id: 'sth', name: 'South', nameHe: 'דרום', annualGrowth: 2.0, avgPricePerSqm: 17_500 },
        { id: 'nth', name: 'North', nameHe: 'צפון', annualGrowth: 2.5, avgPricePerSqm: 18_200 },
    ],
    neighborhoods: [
        { name: 'Neve Tzedek', nameHe: 'נווה צדק', city: 'Tel Aviv', avgPrice: 6_500_000, avgPricePerSqm: 72_000, trend: 'rising', rooms: '3–4', yearOverYear: 6.1 },
        { name: 'Florentin', nameHe: 'פלורנטין', city: 'Tel Aviv', avgPrice: 3_800_000, avgPricePerSqm: 52_000, trend: 'stable', rooms: '3', yearOverYear: 3.2 },
        { name: 'Lev HaIr', nameHe: 'לב העיר', city: 'Tel Aviv', avgPrice: 4_200_000, avgPricePerSqm: 55_000, trend: 'rising', rooms: '3', yearOverYear: 4.8 },
        { name: 'Ramat Aviv', nameHe: 'רמת אביב', city: 'Tel Aviv', avgPrice: 5_800_000, avgPricePerSqm: 62_000, trend: 'rising', rooms: '4', yearOverYear: 5.5 },
        { name: 'Rehavia', nameHe: 'רחביה', city: 'Jerusalem', avgPrice: 4_200_000, avgPricePerSqm: 42_000, trend: 'rising', rooms: '3–4', yearOverYear: 4.3 },
        { name: 'Arnona', nameHe: 'ארנונה', city: 'Jerusalem', avgPrice: 3_100_000, avgPricePerSqm: 33_000, trend: 'stable', rooms: '4', yearOverYear: 2.8 },
        { name: 'German Colony', nameHe: 'המושבה הגרמנית', city: 'Jerusalem', avgPrice: 5_000_000, avgPricePerSqm: 48_000, trend: 'rising', rooms: '4', yearOverYear: 3.9 },
        { name: 'Bat Galim', nameHe: 'בת גלים', city: 'Haifa', avgPrice: 2_200_000, avgPricePerSqm: 24_000, trend: 'rising', rooms: '3–4', yearOverYear: 4.1 },
        { name: 'Denya', nameHe: 'דניה', city: 'Haifa', avgPrice: 3_500_000, avgPricePerSqm: 28_000, trend: 'cooling', rooms: '4–5', yearOverYear: -0.5 },
        { name: 'Carmel Center', nameHe: 'מרכז הכרמל', city: 'Haifa', avgPrice: 2_800_000, avgPricePerSqm: 26_000, trend: 'stable', rooms: '4', yearOverYear: 1.8 },
        { name: 'Kfar Saba Center', nameHe: 'כפר סבא מרכז', city: 'Center', avgPrice: 2_900_000, avgPricePerSqm: 30_000, trend: 'rising', rooms: '4', yearOverYear: 5.0 },
        { name: 'Ra\'anana North', nameHe: 'רעננה צפון', city: 'Center', avgPrice: 4_100_000, avgPricePerSqm: 38_000, trend: 'rising', rooms: '4–5', yearOverYear: 4.6 },
        { name: 'Rehovot Center', nameHe: 'רחובות מרכז', city: 'Center', avgPrice: 2_600_000, avgPricePerSqm: 27_000, trend: 'stable', rooms: '4', yearOverYear: 2.9 },
        { name: 'Beer Sheva North', nameHe: 'באר שבע צפון', city: 'South', avgPrice: 1_650_000, avgPricePerSqm: 16_000, trend: 'rising', rooms: '4', yearOverYear: 3.5 },
        { name: 'Arad', nameHe: 'ערד', city: 'South', avgPrice: 980_000, avgPricePerSqm: 10_500, trend: 'stable', rooms: '4', yearOverYear: 1.2 },
        { name: 'Nahariya Center', nameHe: 'נהריה מרכז', city: 'North', avgPrice: 1_500_000, avgPricePerSqm: 15_500, trend: 'rising', rooms: '4', yearOverYear: 3.8 },
        { name: 'Tiberias', nameHe: 'טבריה', city: 'North', avgPrice: 1_100_000, avgPricePerSqm: 12_000, trend: 'stable', rooms: '3–4', yearOverYear: 1.5 },
    ],
    alerts: [
        'Housing price index rose 0.7% in December 2025, marking 8 consecutive months of growth.',
        'Average mortgage interest rate stabilized around 5.1% (blended, Jan 2026).',
        'Construction input costs increased 0.1%, signaling potential supply-side pressure.',
    ],
};

export default snapshot;
