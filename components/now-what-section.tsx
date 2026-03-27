"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ACTION_POOL } from "@/app/action-data";

// Helper to bold numbers in stat text
function formatStatWithNumbers(text: string) {
  const numberRegex = /(\$?\d[\d,]*\.?\d*%?)/g;
  const parts = text.split(numberRegex);

  return parts.map((part, index) => {
    if (/^\$?\d[\d,]*\.?\d*%?$/.test(part) && part.length > 0) {
      return (
        <strong
          key={index}
          style={{
            fontWeight: 700,
            color: "#22d3ee",
          }}
        >
          {part}
        </strong>
      );
    }
    return part;
  });
}

export function NowWhatSection() {
  // Randomly select 5 actions from the pool using Date.now() for entropy
  const selectedActions = useMemo(() => {
    const seed = Date.now();
    const shuffled = [...ACTION_POOL]
      .map(item => ({ item, sort: Math.random() * seed }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
    return shuffled.slice(0, 5);
  }, []);

  return (
    <section
      style={{
        padding: "100px 24px",
        background: "#0a0e17",
      }}
    >
      {/* Section header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 48,
        }}
      >
        {/* Small label */}
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.4)",
            marginBottom: 12,
          }}
        >
          The Next Step
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 36,
            fontWeight: 400,
            color: "white",
            marginBottom: 16,
          }}
        >
          {"You've seen the numbers. Now pick one thing."}
        </h2>

        {/* Subhead */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 0,
          }}
        >
          Five actions, ranked by actual impact. No guilt. Just math.
        </p>
      </div>

      {/* Action cards */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {selectedActions.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.6,
              delay: index * 0.15,
              ease: "easeOut",
            }}
            style={{
              background: "rgba(15,23,42,0.88)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "36px 40px",
            }}
          >
            {/* Action title */}
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 22,
                fontWeight: 700,
                color: "white",
                margin: 0,
                textAlign: "left",
              }}
            >
              {card.title}
            </h3>

            {/* Impact stat */}
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 17,
                color: "white",
                marginTop: 12,
                marginBottom: 0,
                lineHeight: 1.6,
                textAlign: "left",
              }}
            >
              {formatStatWithNumbers(card.stat)}
            </p>

            {/* Challenge line */}
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 18,
                color: "rgba(255,255,255,0.55)",
                marginTop: 12,
                marginBottom: 0,
                textAlign: "left",
              }}
            >
              {card.voice}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
