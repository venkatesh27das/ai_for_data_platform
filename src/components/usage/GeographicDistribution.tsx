import type { CSSProperties } from "react";

const geographicUsage = [
  { code: "NA", color: "#6d28d9", left: 22, region: "North America", share: 37, top: 35, volume: "9.1K" },
  { code: "AP", color: "#2563eb", left: 82, region: "Asia Pacific", share: 25.6, top: 66, volume: "6.3K" },
  { code: "EU", color: "#7c3aed", left: 51, region: "Europe", share: 21.1, top: 29, volume: "5.2K" },
  { code: "IN", color: "#ea580c", left: 69, region: "India", share: 8.5, top: 50, volume: "2.1K" },
  { code: "OT", color: "#64748b", left: 49, region: "Others", share: 7.8, top: 62, volume: "1.9K" },
] as const;

export function GeographicDistribution() {
  return (
    <div className="geo-panel">
      <div
        aria-label="World map showing consumption concentrated in North America, Europe, India, and Asia Pacific"
        className="world-map"
        role="img"
      >
        <img alt="" aria-hidden="true" src="/usage/world-map.png" />
        {geographicUsage.map((region) => (
          <span
            aria-hidden="true"
            className="geo-marker"
            key={region.code}
            style={
              {
                "--geo-color": region.color,
                "--geo-left": `${region.left}%`,
                "--geo-size": `${12 + region.share / 3}px`,
                "--geo-top": `${region.top}%`,
              } as CSSProperties
            }
          >
            <i />
            <small>{region.code}</small>
          </span>
        ))}
        <span className="geo-map-key"><i /> Consumption volume</span>
      </div>

      <ol className="geo-ranking">
        {geographicUsage.map((region, index) => (
          <li key={region.code}>
            <span className="geo-rank">{index + 1}</span>
            <span className="geo-region">
              <span>
                <strong>{region.region}</strong>
                <small>{region.volume} requests</small>
              </span>
              <i>
                <em
                  style={{
                    backgroundColor: region.color,
                    width: `${(region.share / geographicUsage[0].share) * 100}%`,
                  }}
                />
              </i>
            </span>
            <b>{region.share.toFixed(1)}%</b>
          </li>
        ))}
      </ol>
    </div>
  );
}
