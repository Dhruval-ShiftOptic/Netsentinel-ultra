"use client";
export default function Graph({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => `${(i/(values.length-1))*100},${90 - (v/max)*70}`).join(' ');
  return (
    <div className="graphWrap">
      <svg viewBox="0 0 100 100" className="graphSvg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(110, 180, 255, 0.6)" />
            <stop offset="100%" stopColor="rgba(110, 180, 255, 0)" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="rgba(143,207,255,1)" strokeWidth="1.4" points={points} />
        <polygon fill="url(#lineFill)" points={`0,95 ${points} 100,95`} />
      </svg>
      <div className="graphLabels">{values.map((v, i)=><span key={i}>{v}</span>)}</div>
    </div>
  );
}
