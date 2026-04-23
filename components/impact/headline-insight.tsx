"use client";

import { motion } from "framer-motion";
import { formatAbbreviated } from "@/lib/format";

// Sparse population anchors (billions) from /app/today HISTORICAL_ERAS.
// Piecewise-linear interpolation covers any birth year in [1920, 2025].
const POPULATION_BY_YEAR: ReadonlyArray<readonly [number, number]> = [
  [1900, 1.6e9],
  [1950, 2.5e9],
  [1970, 3.7e9],
  [1990, 5.3e9],
  [2000, 6.1e9],
  [2010, 6.9e9],
  [2020, 7.8e9],
  [2026, 8.1e9],
];

function interpolate(
  year: number,
  data: ReadonlyArray<readonly [number, number]>,
): number {
  if (year <= data[0][0]) return data[0][1];
  if (year >= data[data.length - 1][0]) return data[data.length - 1][1];
  for (let i = 0; i < data.length - 1; i++) {
    const [y0, v0] = data[i];
    const [y1, v1] = data[i + 1];
    if (year >= y0 && year <= y1) {
      const t = (year - y0) / (y1 - y0);
      return v0 + (v1 - v0) * t;
    }
  }
  return data[data.length - 1][1];
}

export function HeadlineInsight({
  birthYear,
  daysLived,
  co2Tonnes,
  milesTraveled,
  mealsConsumed,
}: {
  birthYear: number;
  daysLived: number;
  co2Tonnes: number;
  milesTraveled: number;
  mealsConsumed: number;
}) {
  const yearsAlive = Math.max(1, Math.floor(daysLived / 365));
  const popAtBirth = interpolate(birthYear, POPULATION_BY_YEAR);
  const popToday = POPULATION_BY_YEAR[POPULATION_BY_YEAR.length - 1][1];
  const co2Rounded = Math.round(co2Tonnes).toLocaleString();
  const yearsLabel = yearsAlive === 1 ? "year" : "years";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mb-12"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-serif text-[24px] leading-[1.25] text-white sm:text-[30px] md:text-[38px] md:leading-[1.2] lg:text-[44px]">
          You were born into a world of{" "}
          <span className="text-[#14b8a6]">
            {formatAbbreviated(popAtBirth, 1)}
          </span>
          . In the{" "}
          <span className="text-[#14b8a6]">{yearsAlive}</span> {yearsLabel} since,
          it has grown to{" "}
          <span className="text-[#14b8a6]">
            {formatAbbreviated(popToday, 1)}
          </span>{" "}
          &mdash; and you&rsquo;ve personally emitted{" "}
          <span className="text-[#14b8a6]">{co2Rounded}</span> tonnes of CO
          <sub>2</sub>.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          className="mt-10 grid grid-cols-3 gap-3 sm:gap-8 md:mt-12"
        >
          <SignatureStat
            value={daysLived.toLocaleString()}
            label="Days alive"
          />
          <SignatureStat
            value={formatAbbreviated(milesTraveled, 1)}
            label="Miles traveled"
          />
          <SignatureStat
            value={formatAbbreviated(mealsConsumed, 1)}
            label="Meals eaten"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function SignatureStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="font-mono text-[22px] font-semibold tabular-nums text-white sm:text-[30px] md:text-[36px]"
        style={{ textShadow: "0 0 20px rgba(20,184,166,0.25)" }}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-[#94a3b8] sm:text-[12px]">
        {label}
      </div>
    </div>
  );
}
