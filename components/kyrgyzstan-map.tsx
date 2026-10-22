"use client";

import mapData from "@/public/map/regions.json";
import { heatColor } from "@/lib/utils";

type RegionStat = {
  id: string;
  name: string;
  value: number;
};

type KyrgyzstanMapProps = {
  regions: RegionStat[];
  activeId: string;
  onSelect: (id: string) => void;
  label: string;
};

export function KyrgyzstanMap({ regions, activeId, onSelect, label }: KyrgyzstanMapProps) {
  const values = new Map(regions.map((region) => [region.id, region]));
  const max = Math.max(...regions.map((region) => region.value), 1);

  return (
    <svg viewBox={mapData.viewBox} className="h-auto w-full overflow-hidden" role="img" aria-label={label}>
      {mapData.regions.map((region) => {
        const stat = values.get(region.id);
        const amount = (stat?.value ?? 0) / max;
        const active = activeId === region.id;
        return (
          <path
            key={region.id}
            d={region.path}
            fill={heatColor(amount)}
            fillOpacity={active ? 0.95 : 0.55 + amount * 0.35}
            stroke={active ? "#ffffff" : "rgba(255,255,255,0.45)"}
            strokeWidth={active ? 3 : 1.4}
            fillRule="evenodd"
            className="cursor-pointer transition-[fill-opacity,stroke-width] duration-200"
            role="button"
            tabIndex={0}
            aria-label={`${stat?.name ?? region.name}: ${stat?.value ?? 0}`}
            onClick={() => onSelect(region.id)}
            onMouseEnter={() => onSelect(region.id)}
            onFocus={() => onSelect(region.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(region.id);
              }
            }}
          />
        );
      })}
      {mapData.cities.map((city) => {
        const stat = values.get(city.id);
        const amount = (stat?.value ?? 0) / max;
        const active = activeId === city.id;
        const radius = 7 + amount * 10;
        return (
          <g
            key={city.id}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`${city.name}: ${stat?.value ?? 0}`}
            onClick={() => onSelect(city.id)}
            onMouseEnter={() => onSelect(city.id)}
            onFocus={() => onSelect(city.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(city.id);
              }
            }}
          >
            <circle cx={city.x} cy={city.y} r={radius + 8} fill={heatColor(amount)} opacity={0.28} />
            <circle cx={city.x} cy={city.y} r={radius} fill={active ? "#ffffff" : heatColor(amount)} stroke="#07060d" strokeWidth={2} />
            <text x={city.x + 16} y={city.y + 4} fill="#ffffff" fontSize="15" fontWeight="600">
              {city.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
