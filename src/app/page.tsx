'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Calculator,
  MapPin,
  Info,
  ArrowUpRight,
  ArrowRight,
  Minus,
  Building2,
  Banknote,
  ShieldCheck,
  CircleDollarSign,
  Activity,
  ChevronDown,
} from 'lucide-react';
import {
  BuyerType,
  MortgageInputs,
  calculateMortgage,
  MortgageResults,
  BUYER_LABELS,
  BUYER_DESCRIPTIONS,
} from '@/lib/mortgage-engine';
import snapshot, { Neighborhood } from '@/data/market-snapshot';
import DealModal from '@/components/DealModal';

/* ━━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const formatILS = (v: number) =>
  new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(v);

const formatCompact = (v: number) => {
  if (v >= 1_000_000) return `₪${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₪${(v / 1_000).toFixed(0)}K`;
  return formatILS(v);
};

const trendIcon = (trend: string) => {
  if (trend === 'rising') return <ArrowUpRight className="w-3.5 h-3.5 text-gold" />;
  if (trend === 'cooling') return <ChevronDown className="w-3.5 h-3.5 text-warning" />;
  return <Minus className="w-3.5 h-3.5 text-slate-muted" />;
};

const trendLabel = (trend: string) => {
  if (trend === 'rising') return 'Rising';
  if (trend === 'cooling') return 'Cooling';
  return 'Stable';
};

/* ━━━━ Animation Variants ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.97, filter: 'blur(8px)' },
  show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: 'easeOut' as const } },
};

/* ━━━━ Page ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function Home() {
  const [inputs, setInputs] = useState<MortgageInputs>({
    initialCapital: 800_000,
    monthlyGrossIncome: 25_000,
    buyerType: 'FIRST_HOME',
    dsr: 0.30,
    interestRate: 0.051,
    termYears: 25,
  });

  const [results, setResults] = useState<MortgageResults | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);

  useEffect(() => {
    setResults(calculateMortgage(inputs));
  }, [inputs]);

  /* Filter neighborhoods within 15% budget tolerance */
  const opportunities = useMemo(() => {
    if (!results) return [];
    return snapshot.neighborhoods
      .filter((n) => n.avgPrice <= results.maxPropertyPrice * 1.15)
      .sort((a, b) => b.yearOverYear - a.yearOverYear);
  }, [results]);

  const updateInput = <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  /* DSR visual progress for slider track */
  const dsrProgress = ((inputs.dsr - 0.20) / (0.40 - 0.20)) * 100;
  const dsrTrack = inputs.dsr > 0.33
    ? `linear-gradient(90deg, #C8A84E ${dsrProgress * 0.82}%, #D97706 ${dsrProgress}%, #F0EBE1 ${dsrProgress}%)`
    : `linear-gradient(90deg, #C8A84E 0%, #C8A84E ${dsrProgress}%, #F0EBE1 ${dsrProgress}%)`;

  const capitalProgress = ((inputs.initialCapital - 100_000) / (10_000_000 - 100_000)) * 100;
  const capitalTrack = `linear-gradient(90deg, #C8A84E 0%, #C8A84E ${capitalProgress}%, #F0EBE1 ${capitalProgress}%)`;

  const incomeProgress = ((inputs.monthlyGrossIncome - 5_000) / (100_000 - 5_000)) * 100;
  const incomeTrack = `linear-gradient(90deg, #C8A84E 0%, #C8A84E ${incomeProgress}%, #F0EBE1 ${incomeProgress}%)`;

  return (
    <div className="min-h-screen relative">
      {/* ── Background Gradient Orbs ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gold opacity-[0.04] blur-[120px]" />
        <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-racing-light opacity-[0.05] blur-[100px]" />
      </div>

      {/* ━━━━ Header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-racing flex items-center justify-center border border-racing-light/30 shadow-lg shadow-racing/20">
              <TrendingUp className="w-5 h-5 text-gold" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-[22px] font-bold tracking-tight text-racing">
                Israstat
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-muted -mt-0.5">
                Mortgage Intelligence
              </p>
            </div>
          </div>

          {/* Market Pulse Badge */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-cream-warm border border-racing/5">
            <div className="pulse-dot" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-light">
              CPI {snapshot.cpiValue} ({snapshot.cpiChange > 0 ? '+' : ''}{snapshot.cpiChange}%)
            </span>
          </div>
        </motion.div>
      </header>

      {/* ━━━━ Main Grid ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── LEFT COLUMN: Controls ── */}
        <motion.aside
          variants={stagger}
          initial="hidden"
          animate="show"
          className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6"
        >
          {/* Parameters Glass Card */}
          <motion.div variants={fadeUp} className="glass-card p-7">
            {/* Section Header */}
            <div className="flex items-center gap-2.5 mb-7 pb-4 border-b border-racing/[0.06]">
              <Calculator className="w-[18px] h-[18px] text-gold" strokeWidth={2} />
              <h2 className="font-display text-lg font-bold tracking-tight">Parameters</h2>
            </div>

            <div className="space-y-7">
              {/* Buyer Type */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-muted mb-3">
                  Buyer Profile
                </label>
                <div className="buyer-toggle">
                  {(['FIRST_HOME', 'MOVER', 'INVESTOR'] as BuyerType[]).map((type) => (
                    <button
                      key={type}
                      title={BUYER_DESCRIPTIONS[type]}
                      onClick={() => updateInput('buyerType', type)}
                      className={inputs.buyerType === type ? 'active' : ''}
                    >
                      {BUYER_LABELS[type]}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-[10px] text-slate-muted leading-relaxed">
                  {BUYER_DESCRIPTIONS[inputs.buyerType]}
                </p>
              </div>

              {/* Capital Slider */}
              <div>
                <div className="flex justify-between items-baseline mb-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-muted">
                    Initial Capital
                  </label>
                  <span className="font-mono text-sm font-bold text-racing tabular-nums">
                    {formatILS(inputs.initialCapital)}
                  </span>
                </div>
                <input
                  type="range"
                  min={100_000}
                  max={10_000_000}
                  step={50_000}
                  value={inputs.initialCapital}
                  onChange={(e) => updateInput('initialCapital', Number(e.target.value))}
                  style={{ background: capitalTrack }}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] text-slate-muted/60">₪100K</span>
                  <span className="text-[9px] text-slate-muted/60">₪10M</span>
                </div>
              </div>

              {/* Income Slider */}
              <div>
                <div className="flex justify-between items-baseline mb-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-muted">
                    Gross Monthly Income
                  </label>
                  <span className="font-mono text-sm font-bold text-racing tabular-nums">
                    {formatILS(inputs.monthlyGrossIncome)}
                  </span>
                </div>
                <input
                  type="range"
                  min={5_000}
                  max={100_000}
                  step={500}
                  value={inputs.monthlyGrossIncome}
                  onChange={(e) => updateInput('monthlyGrossIncome', Number(e.target.value))}
                  style={{ background: incomeTrack }}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] text-slate-muted/60">₪5K</span>
                  <span className="text-[9px] text-slate-muted/60">₪100K</span>
                </div>
              </div>

              {/* DSR Slider */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-muted">
                      DSR Ratio
                    </label>
                    <AnimatePresence>
                      {inputs.dsr > 0.33 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded-md bg-warning-bg text-warning border border-warning-border"
                        >
                          <ShieldCheck className="w-2.5 h-2.5" />
                          BoI Limit
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className={`font-mono text-sm font-bold tabular-nums ${inputs.dsr > 0.33 ? 'text-warning' : 'text-racing'}`}>
                    {Math.round(inputs.dsr * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.20}
                  max={0.40}
                  step={0.01}
                  value={inputs.dsr}
                  onChange={(e) => updateInput('dsr', Number(e.target.value))}
                  style={{ background: dsrTrack }}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] text-slate-muted/60">20%</span>
                  <span className="text-[9px] text-slate-muted/60 flex items-center gap-1">
                    33% <span className="text-[7px] text-warning/60">BoI</span>
                  </span>
                  <span className="text-[9px] text-slate-muted/60">40%</span>
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <div className="flex justify-between items-baseline mb-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-muted">
                    Loan Term
                  </label>
                  <span className="font-mono text-sm font-bold text-racing tabular-nums">
                    {inputs.termYears} years
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={30}
                  step={1}
                  value={inputs.termYears}
                  onChange={(e) => updateInput('termYears', Number(e.target.value))}
                  style={{
                    background: `linear-gradient(90deg, #C8A84E 0%, #C8A84E ${((inputs.termYears - 10) / 20) * 100}%, #F0EBE1 ${((inputs.termYears - 10) / 20) * 100}%)`,
                  }}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] text-slate-muted/60">10 yr</span>
                  <span className="text-[9px] text-slate-muted/60">30 yr</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Market Alerts */}
          <motion.div variants={fadeUp} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-racing/[0.06]">
              <Activity className="w-[16px] h-[16px] text-gold" strokeWidth={2} />
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate">Market Pulse</h3>
            </div>
            <ul className="space-y-3">
              {snapshot.alerts.map((alert, i) => (
                <li key={i} className="flex gap-3 items-start text-[12px] leading-relaxed text-slate-light">
                  <div className="pulse-dot mt-1.5" />
                  <span>{alert}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.aside>

        {/* ── RIGHT COLUMN: Results ── */}
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8"
        >
          {/* ── Hero Results Card ── */}
          <motion.div variants={fadeScale} className="hero-card p-8 sm:p-10 relative z-10">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/[0.06]">
                <Banknote className="w-[18px] h-[18px] text-gold" strokeWidth={2} />
                <h2 className="font-display text-lg font-bold text-cream tracking-tight">
                  Your Purchasing Power
                </h2>
              </div>

              <AnimatePresence mode="wait">
                {results && (
                  <motion.div
                    key={`${results.maxPropertyPrice}-${results.maxLoanAmount}`}
                    initial={{ opacity: 0, filter: 'blur(12px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(8px)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Big Number */}
                    <div className="text-center py-4 sm:py-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cream/40 mb-3">
                        Maximum Property Value
                      </p>
                      <h3 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gold tracking-tight leading-none">
                        {formatILS(results.maxPropertyPrice)}
                      </h3>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6 mt-8 pt-8 border-t border-white/[0.06]">
                      <Stat label="Max Loan" value={formatCompact(results.maxLoanAmount)} />
                      <Stat label="Monthly Payment" value={formatILS(results.maxMonthlyPayment)} />
                      <Stat label="Net Income (Est)" value={formatILS(results.estimatedNetIncome)} />
                      <Stat label="LTV Limit" value={`${Math.round(results.ltvLimit * 100)}%`} />
                    </div>

                    {/* Interest Callout */}
                    <div className="mt-6 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-3">
                      <CircleDollarSign className="w-4 h-4 text-gold/60 flex-shrink-0" />
                      <p className="text-[11px] text-cream/50 leading-relaxed">
                        Total interest over {inputs.termYears} years:{' '}
                        <span className="font-bold text-cream/70">{formatILS(results.totalInterestPaid)}</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Opportunity Explorer ── */}
          <motion.div variants={fadeUp} className="glass-card p-7 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-racing/[0.06]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-[18px] h-[18px] text-gold" strokeWidth={2} />
                <h2 className="font-display text-lg font-bold tracking-tight">Opportunity Explorer</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-muted tracking-wider uppercase">
                {opportunities.length} match{opportunities.length !== 1 && 'es'}
              </span>
            </div>

            {/* Regional Trends Ribbon */}
            <div className="flex gap-2.5 overflow-x-auto pb-5 no-scrollbar -mx-1 px-1">
              {snapshot.regions.map((r) => (
                <div key={r.id} className="trend-chip">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-muted/60 mb-1">
                    {r.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-bold text-racing tabular-nums">
                      +{r.annualGrowth}%
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-gold" />
                  </div>
                  <p className="text-[9px] text-slate-muted/50 mt-0.5">
                    ₪{(r.avgPricePerSqm / 1000).toFixed(0)}K/sqm
                  </p>
                </div>
              ))}
            </div>

            {/* Neighborhood Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
              <AnimatePresence mode="popLayout">
                {opportunities.length > 0 ? (
                  opportunities.map((n, idx) => (
                    <motion.div
                      key={n.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, delay: idx * 0.05, ease: 'easeOut' }}
                      layout
                      className="opp-card cursor-pointer"
                      onClick={() => setSelectedNeighborhood(n)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-display text-[15px] font-bold text-racing leading-tight">
                            {n.name}
                          </h4>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-muted/60 mt-0.5">
                            {n.city} · {n.rooms} rooms
                          </p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-cream-warm">
                          {trendIcon(n.trend)}
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate">
                            {trendLabel(n.trend)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-muted/50 mb-0.5">
                            Avg Entry
                          </p>
                          <p className="text-base font-bold font-mono text-racing tabular-nums">
                            {formatILS(n.avgPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-muted/50 mb-0.5">
                            YoY
                          </p>
                          <p className={`text-sm font-bold font-mono tabular-nums ${n.yearOverYear > 0 ? 'text-racing-light' : n.yearOverYear < 0 ? 'text-warning' : 'text-slate-muted'}`}>
                            {n.yearOverYear > 0 ? '+' : ''}{n.yearOverYear}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-2 py-16 flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cream-dark flex items-center justify-center mb-4">
                      <Info className="w-5 h-5 text-slate-muted/40" />
                    </div>
                    <p className="text-sm text-slate-muted/60 max-w-xs leading-relaxed">
                      No neighborhoods match your current budget.
                      <br />
                      Try increasing capital or adjusting your DSR ratio.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </motion.section>
      </main>

      {/* ━━━━ Footer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8 mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-racing/[0.06]">
          <p className="text-[10px] text-slate-muted/50 tracking-wider">
            Data sourced from Israel Central Bureau of Statistics · {snapshot.lastUpdate}
          </p>
          <p className="text-[10px] text-slate-muted/50 tracking-wider">
            Calculations are estimates. Consult a licensed mortgage advisor.
          </p>
        </div>
      </footer>

      {/* ━━━━ Deal Analysis Modal ━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {selectedNeighborhood && (
          <DealModal
            neighborhood={selectedNeighborhood}
            onClose={() => setSelectedNeighborhood(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ━━━━ Sub-Components ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-cream/30 mb-1">{label}</p>
      <p className="text-[17px] font-bold text-cream/90 tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
