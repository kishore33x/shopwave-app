import { LucideIcon } from "lucide-react";
import { memo } from "react";

type StatCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon?: LucideIcon;
};

function StatCard({ title, value, helper, icon: Icon }: StatCardProps) {
  return (
    <div className="panel relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:shadow-lg">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-cyan-400/0 via-cyan-300/80 to-indigo-300/0" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 transition-colors duration-300">{title}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-white transition-colors duration-300">{value}</p>
          {helper ? <p className="mt-2 text-xs text-slate-300 transition-colors duration-300">{helper}</p> : null}
        </div>
        {Icon ? (
          <span className="rounded-xl border border-white/10 bg-white/10 p-2 text-cyan-200">
            <Icon size={18} strokeWidth={2.25} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default memo(StatCard);
