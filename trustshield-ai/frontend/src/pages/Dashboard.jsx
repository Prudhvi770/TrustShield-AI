import React, { useEffect, useState } from 'react';
import { TrendingUp, ShieldX, AlertTriangle, ShieldCheck } from 'lucide-react';
import { fetchDashboardData } from '../api/client';
export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData()
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Loading analytics telemetry...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header matching Screenshot 4 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">INSIGHTS</div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Aggregate trends across all verifications — helping you understand what threats are circulating this week.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Last 7 days</span>
        </div>
      </div>

      {/* 4 Stat Cards matching Screenshot 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total verifications */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500">Total verifications</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {data.metrics.total_verifications}
          </div>
        </div>

        {/* Fraudulent */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500">Fraudulent</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {data.metrics.fraudulent}
          </div>
        </div>

        {/* Suspicious */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500">Suspicious</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {data.metrics.suspicious}
          </div>
        </div>

        {/* Verified safe */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500">Verified safe</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {data.metrics.verified_safe}
          </div>
        </div>
      </div>

      {/* Spline Volume Chart matching Screenshot 4 */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs mb-8">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-900">Verification volume</h3>
          <p className="text-xs text-slate-500 mt-0.5">Requests processed per day</p>
        </div>

        {/* Custom SVG Spline Line matching Screenshot 4 curve */}
        <div className="relative w-full h-48 sm:h-56">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
            {/* Grid horizontal dashed lines */}
            <line x1="0" y1="30" x2="700" y2="30" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="0" y1="90" x2="700" y2="90" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="0" y1="150" x2="700" y2="150" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />

            {/* Labels on y-axis */}
            <text x="5" y="26" fontSize="11" fill="#94A3B8" fontWeight="600">120</text>
            <text x="5" y="86" fontSize="11" fill="#94A3B8" fontWeight="600">90</text>
            <text x="5" y="146" fontSize="11" fill="#94A3B8" fontWeight="600">30</text>
            <text x="5" y="195" fontSize="11" fill="#94A3B8" fontWeight="600">0</text>

            {/* Spline Curve representing volume points [42, 58, 72, 61, 94, 122, 104] */}
            <path
              d="M 50 145 C 100 135, 120 120, 150 115 C 190 110, 220 90, 250 85 C 290 80, 320 120, 350 115 C 390 110, 420 70, 450 60 C 490 45, 520 20, 550 20 C 600 20, 630 45, 660 50"
              fill="none"
              stroke="#334155"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Highlighted Data Points */}
            <circle cx="50" cy="145" r="4.5" fill="#0F172A" />
            <circle cx="150" cy="115" r="4.5" fill="#0F172A" />
            <circle cx="250" cy="85" r="4.5" fill="#0F172A" />
            <circle cx="350" cy="115" r="4.5" fill="#0F172A" />
            <circle cx="450" cy="60" r="4.5" fill="#0F172A" />
            <circle cx="550" cy="20" r="5.5" fill="#0F172A" />
            <circle cx="660" cy="50" r="4.5" fill="#0F172A" />
          </svg>

          {/* X Axis Day Labels */}
          <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2 px-6">
            {data.verification_volume.map((item, idx) => (
              <span key={idx}>{item.day}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart matching Screenshot 5 */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-900">By category</h3>
          <p className="text-xs text-slate-500 mt-0.5">Threat breakdown</p>
        </div>

        <div className="space-y-4">
          {data.threat_categories.map((cat, idx) => {
            const maxVal = 240;
            const pct = Math.round((cat.count / maxVal) * 100);

            return (
              <div key={idx} className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-4 sm:col-span-3 text-right pr-3 text-xs font-bold text-slate-700">
                  {cat.category}
                </div>

                <div className="col-span-7 sm:col-span-8 bg-slate-100 h-8 rounded-lg overflow-hidden flex items-center">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3 text-white text-xs font-bold"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color
                    }}
                  >
                    {cat.count > 60 && cat.count}
                  </div>
                </div>

                <div className="col-span-1 text-xs font-mono font-bold text-slate-600 pl-1">
                  {cat.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
