"use client";

import { BrainCircuit } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/lib/formatCurrency";
import { CategoryRevenue, DailyRevenue, SalesSummary } from "@/lib/types";

type AIInsightsProps = {
  summary: SalesSummary | null;
  categoryData: CategoryRevenue[];
  trends: DailyRevenue[];
};

const STAGGER_MS = 260;
const TYPE_SPEED_MS = 16;
const HIGHLIGHT_PATTERN = /(₹\d[\d,]*(?:\.\d+)?|\d{4}-\d{2}-\d{2}|\d+(?:\.\d+)?%)/g;

function renderHighlightedText(text: string): React.ReactNode {
  const parts = text.split(HIGHLIGHT_PATTERN);

  return parts.map((part, index) => {
    if (!part) return null;

    if (/^₹\d[\d,]*(?:\.\d+)?$/.test(part)) {
      return (
        <span key={`${part}-${index}`} className="font-semibold text-blue-400">
          {part}
        </span>
      );
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
      return (
        <span key={`${part}-${index}`} className="font-semibold text-indigo-400">
          {part}
        </span>
      );
    }

    if (/^\d+(?:\.\d+)?%$/.test(part)) {
      return (
        <span key={`${part}-${index}`} className="font-semibold text-blue-400">
          {part}
        </span>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function AIInsights({ summary, categoryData, trends }: AIInsightsProps) {
  const [visibleInsights, setVisibleInsights] = useState<number[]>([]);
  const [activeInsights, setActiveInsights] = useState<Record<number, boolean>>({});
  const [typedLengths, setTypedLengths] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);

  const insights = useMemo(() => {
    const topCategory = categoryData[0];
    const highestDay = trends.reduce<DailyRevenue | null>((max, day) => {
      if (!max || day.revenue > max.revenue) return day;
      return max;
    }, null);

    const firstRevenue = trends[0]?.revenue ?? 0;
    const lastRevenue = trends[trends.length - 1]?.revenue ?? 0;
    const salesDirection = lastRevenue >= firstRevenue ? "increased" : "declined";

    return [
      topCategory
        ? `Top category is ${topCategory.category} with ${formatCurrency(topCategory.revenue)} in revenue.`
        : "Category data is still loading; top contributor will appear shortly.",
      trends.length > 1
        ? `Sales ${salesDirection} across the selected period (${trends[0]?.date} to ${trends[trends.length - 1]?.date}).`
        : "Insufficient trend data to compare periods.",
      highestDay
        ? `Highest revenue day is ${highestDay.date} at ${formatCurrency(highestDay.revenue)}.`
        : "Daily peak revenue insight will appear when trend data is available.",
      summary
        ? `Average order value is ${formatCurrency(summary.averageOrderValue)} and remains stable.`
        : "Average order value insight will appear after summary data loads."
    ];
  }, [categoryData, summary, trends]);

  useEffect(() => {
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];
    const intervals: Array<ReturnType<typeof setInterval>> = [];

    setVisibleInsights([]);
    setActiveInsights({});
    setTypedLengths(Array(insights.length).fill(0));
    setIsGenerating(true);

    insights.forEach((insight, index) => {
      const showTimeout = setTimeout(() => {
        setVisibleInsights((prev) => [...prev, index]);

        window.requestAnimationFrame(() => {
          setActiveInsights((prev) => ({ ...prev, [index]: true }));
        });

        const typingInterval = setInterval(() => {
          setTypedLengths((prev) => {
            const currentLength = prev[index] ?? 0;
            if (currentLength >= insight.length) {
              clearInterval(typingInterval);
              return prev;
            }

            const next = [...prev];
            next[index] = currentLength + 1;
            return next;
          });
        }, TYPE_SPEED_MS);

        intervals.push(typingInterval);
      }, index * STAGGER_MS);

      timeouts.push(showTimeout);
    });

    const doneTimeout = setTimeout(() => {
      setIsGenerating(false);
    }, insights.length * STAGGER_MS + 500);

    timeouts.push(doneTimeout);

    return () => {
      timeouts.forEach((timer) => clearTimeout(timer));
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [insights]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <section className="relative z-0 min-h-[120px] rounded-2xl bg-white/10 p-6 shadow-md backdrop-blur-md">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-xl border border-white/10 bg-white/10 p-2 text-cyan-200 animate-pulse">
            <BrainCircuit size={18} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-white">AI Insights</h2>
            <p className="text-sm text-gray-300">Auto-generated from your current analytics data</p>
          </div>
        </div>

        {isGenerating && visibleInsights.length === 0 ? (
          <div className="space-y-3">
            <div className="h-4 w-11/12 rounded bg-white/10" />
            <div className="h-4 w-10/12 rounded bg-white/10" />
            <div className="h-4 w-9/12 rounded bg-white/10" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleInsights.map((index) => {
              const insight = insights[index];
              const typedText = insight.slice(0, typedLengths[index] ?? 0);
              const isActive = activeInsights[index];

              return (
                <div
                  key={`${index}-${insight}`}
                  className={`rounded-lg bg-white/5 px-4 py-2 text-gray-300 transition-all duration-300 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                >
                  {renderHighlightedText(typedText)}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default memo(AIInsights);
