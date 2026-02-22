/**
 * Israstat Deal Provider
 * ─────────────────────
 * Generates statistically accurate mock deals for each neighborhood.
 * Designed as a plug-and-play module: swap the generator for a live
 * Gov.il CKAN API fetch when the resource_id is available.
 *
 * Each deal is deterministic (seeded by neighborhood name) so the
 * same neighborhood always produces the same deals across renders.
 */

export interface Deal {
    id: string;
    date: string;            // ISO date string
    price: number;           // Total price in ILS
    pricePerSqm: number;     // ILS / sqm
    sqm: number;
    rooms: number;
    floor: number;
    address: string;
    category: 'below-market' | 'market' | 'above-market' | 'luxury';
}

export interface DealSummary {
    neighborhoodName: string;
    city: string;
    totalDeals: number;
    medianPrice: number;
    medianPricePerSqm: number;
    priceRange: [number, number];
    trendDirection: 'up' | 'down' | 'flat';
    deals: Deal[];
}

/* ─── Seeded PRNG (Mulberry32) ─────────────────────── */

function seedFromString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch;
        hash |= 0;
    }
    return Math.abs(hash);
}

function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ─── Street Name Generator ────────────────────────── */

const STREET_PREFIXES = [
    'Herzl', 'Rothschild', 'Ben Gurion', 'Jabotinsky', 'Weizmann',
    'HaNassi', 'HaRav Kook', 'Dizengoff', 'Bialik', 'Nordau',
    'Sokolov', 'Basel', 'Allenby', 'King George', 'Arlozorov',
    'Ben Yehuda', 'HaYarkon', 'Trumpeldor', 'Sheinkin', 'Nahalat Binyamin',
    'Kaplan', 'Begin', 'HaMelech David', 'Emek Refaim', 'Derech Hevron',
];

/* ─── Deal Generator ──────────────────────────────── */

export function generateDeals(
    neighborhoodName: string,
    city: string,
    avgPricePerSqm: number,
    trend: 'rising' | 'stable' | 'cooling',
    count: number = 40,
): DealSummary {
    const rand = mulberry32(seedFromString(neighborhoodName + city));

    // Generate deals spanning 24 months
    const deals: Deal[] = [];
    const now = new Date(2026, 1, 1); // Feb 2026

    // Trend slope: rising = +0.3%/mo, cooling = -0.15%/mo, stable = +0.05%/mo
    const monthlySlope = trend === 'rising' ? 0.003 : trend === 'cooling' ? -0.0015 : 0.0005;

    for (let i = 0; i < count; i++) {
        // Random month offset (0–23 months back)
        const monthsBack = Math.floor(rand() * 24);
        const dealDate = new Date(now);
        dealDate.setMonth(dealDate.getMonth() - monthsBack);
        dealDate.setDate(1 + Math.floor(rand() * 27));

        // Price/sqm with trend adjustment and noise
        const trendAdjustment = 1 + monthlySlope * (24 - monthsBack);
        const noise = 0.82 + rand() * 0.36; // ±18% variance
        const dealPricePerSqm = Math.round(avgPricePerSqm * trendAdjustment * noise);

        // Apartment characteristics
        const rooms = [2, 2.5, 3, 3.5, 4, 4.5, 5][Math.floor(rand() * 7)];
        const baseSqm = rooms * 22 + rand() * 15;
        const sqm = Math.round(baseSqm);
        const floor = Math.floor(rand() * 15) + 1;
        const streetIdx = Math.floor(rand() * STREET_PREFIXES.length);
        const houseNum = Math.floor(rand() * 80) + 1;

        const price = Math.round(dealPricePerSqm * sqm);

        // Category based on deviation from median
        const ratio = dealPricePerSqm / avgPricePerSqm;
        let category: Deal['category'];
        if (ratio < 0.88) category = 'below-market';
        else if (ratio <= 1.12) category = 'market';
        else if (ratio <= 1.35) category = 'above-market';
        else category = 'luxury';

        deals.push({
            id: `${neighborhoodName.replace(/\s/g, '-').toLowerCase()}-${i}`,
            date: dealDate.toISOString().split('T')[0],
            price,
            pricePerSqm: dealPricePerSqm,
            sqm,
            rooms,
            floor,
            address: `${STREET_PREFIXES[streetIdx]} ${houseNum}`,
            category,
        });
    }

    // Sort chronologically
    deals.sort((a, b) => a.date.localeCompare(b.date));

    // Compute summary stats
    const prices = deals.map((d) => d.price).sort((a, b) => a - b);
    const priceSqmArr = deals.map((d) => d.pricePerSqm).sort((a, b) => a - b);
    const medianPrice = prices[Math.floor(prices.length / 2)];
    const medianPricePerSqm = priceSqmArr[Math.floor(priceSqmArr.length / 2)];

    // Trend direction from first-half vs second-half median
    const half = Math.floor(deals.length / 2);
    const firstHalfMedian = deals.slice(0, half).reduce((s, d) => s + d.pricePerSqm, 0) / half;
    const secondHalfMedian = deals.slice(half).reduce((s, d) => s + d.pricePerSqm, 0) / (deals.length - half);
    const trendPct = (secondHalfMedian - firstHalfMedian) / firstHalfMedian;
    const trendDirection = trendPct > 0.02 ? 'up' : trendPct < -0.02 ? 'down' : 'flat';

    return {
        neighborhoodName,
        city,
        totalDeals: deals.length,
        medianPrice,
        medianPricePerSqm,
        priceRange: [prices[0], prices[prices.length - 1]],
        trendDirection,
        deals,
    };
}

/* ─── Formatters ──────────────────────────────────── */

export function formatDealDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IL', { month: 'short', year: 'numeric' });
}

export function formatShortDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IL', { day: 'numeric', month: 'short', year: '2-digit' });
}

export const CATEGORY_LABELS: Record<Deal['category'], string> = {
    'below-market': 'Below Market',
    'market': 'Market Rate',
    'above-market': 'Above Market',
    'luxury': 'Luxury',
};

export const CATEGORY_COLORS: Record<Deal['category'], string> = {
    'below-market': '#14694D',
    'market': '#C8A84E',
    'above-market': '#D97706',
    'luxury': '#9333EA',
};
