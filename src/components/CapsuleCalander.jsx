import React, { useEffect, useState } from 'react';

const CapsuleTimeOnly = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const weekdayFull = now.toLocaleDateString('en-US', { weekday: 'long' }); // Monday
  const weekdayShort = now.toLocaleDateString('en-US', { weekday: 'short' }); // Mon
  const month = now.toLocaleDateString('en-US', { month: 'short' }); // Sep
  const day = now.getDate(); // 8
  const year = now.getFullYear(); // 2025
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // 09:34:12 AM

  return (
    // If parent uses a 2-column grid and you want this to span both columns, keep lg:col-span-2
    <div className="w-full col-span-1 lg:col-span-2">
      <div
        className="w-full rounded-xl bg-gradient-to-br from-purple-100 to-purple-100 text-dark-900 shadow-xl p-5
                   flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-4
                   transform-gpu transition-all duration-300 hover:-translate-y-1"
        aria-live="polite"
      >
        {/* Left: Big numeric day + weekday */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center px-4 py-2 bg-dark/10 rounded-lg min-w-[84px]">
            <div className="text-4xl sm:text-5xl font-extrabold leading-none">{day}</div>
            <div className="text-xs sm:text-sm uppercase opacity-90">{weekdayShort}</div>
          </div>

          <div className="hidden sm:flex flex-col">
            <div className="text-sm sm:text-base font-medium">{month} {year}</div>
            <div className="text-xs text-dark/90 mt-1">{weekdayFull}</div>
          </div>
        </div>

        {/* Right: Time - large and prominent */}
        <div className="ml-auto text-right sm:text-right">
          <div className="text-2xl sm:text-4xl font-extrabold tracking-tight">{time}</div>
          <div className="text-sm sm:text-base text-dark/90 mt-1">Local time</div>
        </div>
      </div>
    </div>
  );
};

export default CapsuleTimeOnly;
