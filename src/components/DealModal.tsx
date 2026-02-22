'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    TrendingUp,
    TrendingDown,
    Minus,
    Building2,
    Calendar,
    Ruler,
    Layers,
    MapPin,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    ReferenceLine,
} from 'recharts';
import {
    Deal,
    DealSummary,
    generateDeals,
    formatDealDate,
    formatShortDate,
    CATEGORY_LABELS,
    CATEGORY_COLORS,
} from '@/lib/deal-provider';
import type { Neighborhood } from '@/data/market-snapshot';

/* ─── Types ────────────────────────────────────────── */

interface DealModalProps {
    neighborhood: Neighborhood;
    onClose: () => void;
}

/* ─── Formatters ───────────────────────────────────── */

const formatILS = (v: number) =>
    new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 0,
    }).format(v);

const formatCompactK = (v: number) =>
    `₪${(v / 1000).toFixed(0)}K`;

/* ─── Custom Tooltip ───────────────────────────────── */

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string; pricePerSqm: number; price: number; rooms: number; sqm: number; category: string } }> }) {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
        <div className="chart-tooltip">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-muted/60 mb-1">
                {formatShortDate(d.date)}
            </p>
            <p className="text-[15px] font-bold font-mono text-racing tabular-nums">
                {formatILS(d.pricePerSqm)}<span className="text-[10px] text-slate-muted/60 font-normal">/sqm</span>
            </p>
            <p className="text-[10px] text-slate-muted mt-0.5">
                {d.rooms} rooms · {d.sqm}sqm · {formatILS(d.price)}
            </p>
        </div>
    );
}

/* ─── Component ────────────────────────────────────── */

export default function DealModal({ neighborhood, onClose }: DealModalProps) {
    const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Deal['category'] | 'all'>('all');

    // Generate deals
    const summary: DealSummary = useMemo(
        () =>
            generateDeals(
                neighborhood.name,
                neighborhood.city,
                neighborhood.avgPricePerSqm,
                neighborhood.trend,
                40,
            ),
        [neighborhood],
    );

    // Chart data (all deals as scatter points on the area chart)
    const chartData = useMemo(
        () =>
            summary.deals.map((d) => ({
                date: d.date,
                pricePerSqm: d.pricePerSqm,
                price: d.price,
                rooms: d.rooms,
                sqm: d.sqm,
                id: d.id,
                category: d.category,
            })),
        [summary],
    );

    // Rolling average for the trend line
    const trendLine = useMemo(() => {
        const sorted = [...summary.deals].sort((a, b) => a.date.localeCompare(b.date));
        const points: { date: string; avg: number }[] = [];
        const windowSize = 5;
        for (let i = 0; i < sorted.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const window = sorted.slice(start, i + 1);
            const avg = window.reduce((s, d) => s + d.pricePerSqm, 0) / window.length;
            points.push({ date: sorted[i].date, avg: Math.round(avg) });
        }
        return points;
    }, [summary]);

    // Merge chart data with trend line
    const mergedChart = useMemo(() => {
        return chartData.map((d, i) => ({
            ...d,
            trendAvg: trendLine[i]?.avg ?? d.pricePerSqm,
        }));
    }, [chartData, trendLine]);

    // Filtered deals
    const filteredDeals = useMemo(
        () =>
            selectedCategory === 'all'
                ? summary.deals
                : summary.deals.filter((d) => d.category === selectedCategory),
        [summary, selectedCategory],
    );

    // Get the hovered deal for the reference dot
    const hoveredDeal = useMemo(
        () => (hoveredDealId ? summary.deals.find((d) => d.id === hoveredDealId) : null),
        [hoveredDealId, summary],
    );

    const hoveredChartIdx = useMemo(
        () => (hoveredDeal ? mergedChart.findIndex((d) => d.id === hoveredDeal.id) : -1),
        [hoveredDeal, mergedChart],
    );

    // Close on escape
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose],
    );

    // Category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: summary.deals.length };
        for (const d of summary.deals) {
            counts[d.category] = (counts[d.category] || 0) + 1;
        }
        return counts;
    }, [summary]);

    const trendIconEl =
        summary.trendDirection === 'up' ? (
            <TrendingUp className="w-4 h-4 text-racing-light" />
        ) : summary.trendDirection === 'down' ? (
            <TrendingDown className="w-4 h-4 text-warning" />
        ) : (
            <Minus className="w-4 h-4 text-slate-muted" />
        );

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={onClose}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
            >
                <motion.div
                    className="modal-container"
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 20 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Header ── */}
                    <div className="modal-header">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-racing flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-gold" />
                            </div>
                            <div>
                                <h2 className="font-display text-xl font-bold text-racing tracking-tight">
                                    {neighborhood.name}
                                </h2>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-muted flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" />
                                    {neighborhood.city} · {summary.totalDeals} deals
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream-warm border border-racing/5">
                                {trendIconEl}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate">
                                    {summary.trendDirection === 'up'
                                        ? 'Uptrend'
                                        : summary.trendDirection === 'down'
                                            ? 'Downtrend'
                                            : 'Stable'}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-xl bg-cream-dark hover:bg-cream-warm flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-muted" />
                            </button>
                        </div>
                    </div>

                    {/* ── Content: Split View ── */}
                    <div className="modal-body">
                        {/* LEFT: Chart */}
                        <div className="modal-chart-pane">
                            {/* Summary Stats Row */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                <div className="stat-pill">
                                    <p className="stat-pill-label">Median Price</p>
                                    <p className="stat-pill-value">{formatILS(summary.medianPrice)}</p>
                                </div>
                                <div className="stat-pill">
                                    <p className="stat-pill-label">Median ₪/sqm</p>
                                    <p className="stat-pill-value">{formatCompactK(summary.medianPricePerSqm)}</p>
                                </div>
                                <div className="stat-pill">
                                    <p className="stat-pill-label">Range</p>
                                    <p className="stat-pill-value">
                                        {formatCompactK(summary.priceRange[0])} – {formatCompactK(summary.priceRange[1])}
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={mergedChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#C8A84E" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#C8A84E" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="rgba(11,61,46,0.06)"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 9, fill: '#8A9A8F' }}
                                            tickFormatter={(v: string) => formatDealDate(v)}
                                            axisLine={{ stroke: 'rgba(11,61,46,0.08)' }}
                                            tickLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 9, fill: '#8A9A8F' }}
                                            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                                            axisLine={false}
                                            tickLine={false}
                                            domain={['dataMin - 2000', 'dataMax + 2000']}
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="trendAvg"
                                            stroke="#C8A84E"
                                            strokeWidth={2}
                                            fill="url(#areaGrad)"
                                            dot={(props: Record<string, unknown>) => {
                                                const cx = (props.cx as number) ?? 0;
                                                const cy = (props.cy as number) ?? 0;
                                                const payload = props.payload as { id: string; category: string } | undefined;
                                                if (!payload) return <circle r={0} />;
                                                const isHovered = payload.id === hoveredDealId;
                                                return (
                                                    <circle
                                                        key={payload.id}
                                                        cx={cx}
                                                        cy={cy}
                                                        r={isHovered ? 7 : 3.5}
                                                        fill={isHovered ? '#C8A84E' : CATEGORY_COLORS[payload.category as Deal['category']]}
                                                        stroke={isHovered ? '#0B3D2E' : '#fff'}
                                                        strokeWidth={isHovered ? 2.5 : 1.5}
                                                        style={{
                                                            transition: 'r 0.2s ease, fill 0.2s ease, stroke-width 0.2s ease',
                                                            filter: isHovered ? 'drop-shadow(0 0 6px rgba(200,168,78,0.6))' : 'none',
                                                        }}
                                                    />
                                                );
                                            }}
                                            activeDot={false}
                                        />
                                        {/* Median reference line */}
                                        <ReferenceLine
                                            y={summary.medianPricePerSqm}
                                            stroke="rgba(11,61,46,0.15)"
                                            strokeDasharray="6 3"
                                            label={{
                                                value: 'Median',
                                                position: 'insideTopRight',
                                                fontSize: 9,
                                                fill: '#8A9A8F',
                                            }}
                                        />
                                        {/* Hovered deal highlight */}
                                        {hoveredDeal && hoveredChartIdx >= 0 && (
                                            <ReferenceDot
                                                x={mergedChart[hoveredChartIdx].date}
                                                y={mergedChart[hoveredChartIdx].trendAvg}
                                                r={0}
                                            />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 mt-4">
                                {(Object.entries(CATEGORY_COLORS) as [Deal['category'], string][]).map(([cat, color]) => (
                                    <div key={cat} className="flex items-center gap-1.5">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-muted/60">
                                            {CATEGORY_LABELS[cat]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Deal List */}
                        <div className="modal-list-pane">
                            {/* Category Filter */}
                            <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-racing/[0.06]">
                                {(['all', 'below-market', 'market', 'above-market', 'luxury'] as const).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                                    >
                                        {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
                                        <span className="category-count">{categoryCounts[cat] || 0}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Deal Cards */}
                            <div className="deal-list">
                                {filteredDeals.map((deal) => (
                                    <div
                                        key={deal.id}
                                        className={`deal-card ${hoveredDealId === deal.id ? 'deal-card-active' : ''}`}
                                        onMouseEnter={() => setHoveredDealId(deal.id)}
                                        onMouseLeave={() => setHoveredDealId(null)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-[13px] font-bold text-racing leading-tight">
                                                    {deal.address}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-muted/50 flex items-center gap-0.5">
                                                        <Calendar className="w-2.5 h-2.5" />
                                                        {formatShortDate(deal.date)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                className="deal-category-badge"
                                                style={{
                                                    backgroundColor: `${CATEGORY_COLORS[deal.category]}15`,
                                                    color: CATEGORY_COLORS[deal.category],
                                                    borderColor: `${CATEGORY_COLORS[deal.category]}30`,
                                                }}
                                            >
                                                {CATEGORY_LABELS[deal.category]}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            <div>
                                                <p className="deal-stat-label">Price</p>
                                                <p className="deal-stat-value">{formatILS(deal.price)}</p>
                                            </div>
                                            <div>
                                                <p className="deal-stat-label">₪/sqm</p>
                                                <p className="deal-stat-value">{formatCompactK(deal.pricePerSqm)}</p>
                                            </div>
                                            <div>
                                                <p className="deal-stat-label flex items-center gap-0.5"><Ruler className="w-2.5 h-2.5" />Size</p>
                                                <p className="deal-stat-value">{deal.sqm}m²</p>
                                            </div>
                                            <div>
                                                <p className="deal-stat-label flex items-center gap-0.5"><Layers className="w-2.5 h-2.5" />Floor</p>
                                                <p className="deal-stat-value">{deal.rooms}r · F{deal.floor}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
