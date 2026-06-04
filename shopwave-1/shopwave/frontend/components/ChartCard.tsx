import { memo } from "react";

function ChartCard({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="mb-5">
        <h2 className="font-display text-lg font-semibold text-white transition-colors duration-300">{title}</h2>
        {subtitle ? <p className="text-sm text-gray-300 transition-colors duration-300">{subtitle}</p> : null}
      </div>
      <div className="h-[320px]">{children}</div>
    </section>
  );
}

export default memo(ChartCard);
