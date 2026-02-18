/**
 * Israstat Mortgage Engine
 * ────────────────────────
 * Israel-specific mortgage calculations following
 * Bank of Israel (BoI) regulatory guidelines.
 */

export type BuyerType = 'FIRST_HOME' | 'MOVER' | 'INVESTOR';

export interface MortgageInputs {
    initialCapital: number;        // ILS
    monthlyGrossIncome: number;    // ILS (Bruto)
    buyerType: BuyerType;
    dsr: number;                   // Debt-Service Ratio (0.20 – 0.40)
    interestRate: number;          // Annual blended rate (decimal)
    termYears: number;             // Loan term in years
}

export interface MortgageResults {
    estimatedNetIncome: number;
    maxMonthlyPayment: number;
    maxLoanAmount: number;
    maxPropertyPrice: number;
    ltvLimit: number;
    totalInterestPaid: number;
    isWarning: boolean;            // DSR > 33%
}

/** Bank of Israel LTV limits by buyer type */
const LTV_LIMITS: Record<BuyerType, number> = {
    FIRST_HOME: 0.75,
    MOVER: 0.70,
    INVESTOR: 0.50,
};

/**
 * Approximate Israeli Netto from Bruto income.
 * Accounts for Bituach Leumi, Health Tax, and Income Tax brackets.
 */
export function estimateNetIncome(gross: number): number {
    // Simplified progressive marginal model (monthly)
    if (gross <= 7_010) return gross * 0.88;   // ~12% deductions
    if (gross <= 10_060) return gross * 0.82;   // ~18%
    if (gross <= 16_150) return gross * 0.74;   // ~26%
    if (gross <= 22_440) return gross * 0.68;   // ~32%
    if (gross <= 46_690) return gross * 0.62;   // ~38%
    return gross * 0.54;                         // ~46%+ top bracket
}

/**
 * Shpitzer (annuity) calculation.
 * Returns the present value (max loan) for a given monthly payment.
 */
function maxLoanShpitzer(monthlyPayment: number, annualRate: number, years: number): number {
    const r = annualRate / 12;
    const n = years * 12;
    if (r === 0) return monthlyPayment * n;
    return monthlyPayment * (1 - Math.pow(1 + r, -n)) / r;
}

/**
 * Monthly Shpitzer payment for a given loan amount.
 */
function monthlyPaymentShpitzer(loanAmount: number, annualRate: number, years: number): number {
    const r = annualRate / 12;
    const n = years * 12;
    if (r === 0) return loanAmount / n;
    return loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
}

/**
 * Core calculation: takes user inputs and returns mortgage affordability results.
 */
export function calculateMortgage(inputs: MortgageInputs): MortgageResults {
    const { initialCapital, monthlyGrossIncome, buyerType, dsr, interestRate, termYears } = inputs;

    const netIncome = estimateNetIncome(monthlyGrossIncome);
    const maxMonthly = netIncome * dsr;
    const ltvLimit = LTV_LIMITS[buyerType];

    // Max loan based on income (DSR constraint)
    const maxLoanByIncome = maxLoanShpitzer(maxMonthly, interestRate, termYears);

    // Max property by LTV: capital >= (1 - LTV) * price  →  price <= capital / (1 - LTV)
    const maxPriceByLTV = initialCapital / (1 - ltvLimit);

    // Max property by income: price = capital + loan
    const maxPriceByIncome = initialCapital + maxLoanByIncome;

    // The actual max is the lesser of the two constraints
    const maxPropertyPrice = Math.min(maxPriceByLTV, maxPriceByIncome);
    const finalLoan = maxPropertyPrice - initialCapital;

    // Total interest
    const actualMonthly = monthlyPaymentShpitzer(finalLoan, interestRate, termYears);
    const totalPaid = actualMonthly * termYears * 12;
    const totalInterest = totalPaid - finalLoan;

    return {
        estimatedNetIncome: Math.round(netIncome),
        maxMonthlyPayment: Math.round(actualMonthly),
        maxLoanAmount: Math.round(finalLoan),
        maxPropertyPrice: Math.round(maxPropertyPrice),
        ltvLimit,
        totalInterestPaid: Math.round(totalInterest),
        isWarning: dsr > 0.33,
    };
}

/** Buyer type labels for display */
export const BUYER_LABELS: Record<BuyerType, string> = {
    FIRST_HOME: '1st Home',
    MOVER: 'Upgrader',
    INVESTOR: 'Investor',
};

/** Buyer type descriptions for tooltips */
export const BUYER_DESCRIPTIONS: Record<BuyerType, string> = {
    FIRST_HOME: 'First-time buyer — up to 75% financing',
    MOVER: 'Selling existing property — up to 70% financing',
    INVESTOR: 'Investment property — up to 50% financing',
};
