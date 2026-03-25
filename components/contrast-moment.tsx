"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShareButton } from "@/components/share-button";
import { CONTRAST_DATA } from "@/lib/data/contrast-data";

// Helper to bold numbers in a string
function formatWithBoldNumbers(text: string, color: string) {
  // Match numbers with optional $ prefix, commas between digits, decimal points, and % suffix
  // Pattern: optional $, digit, then any combo of digits/commas, optional decimal portion, optional %
  const numberRegex = /(\$?\d[\d,]*\.?\d*%?)/g;
  const parts = text.split(numberRegex);
  
  return parts.map((part, index) => {
    // Check if this part is a valid number format (must start with $ or digit, contain at least one digit)
    if (/^\$?\d[\d,]*\.?\d*%?$/.test(part) && part.length > 0) {
      return (
        <strong
          key={index}
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color,
          }}
        >
          {part}
        </strong>
      );
    }
    return part;
  });
}

interface ContrastMomentProps {
  pool: "A" | "B" | "C" | "D" | "E" | "F";
}

export function ContrastMoment({ pool }: ContrastMomentProps) {
  const selectedContrast = useMemo(() => {
    const poolItems = CONTRAST_DATA.filter(c => c.pool === pool);
    return poolItems[Math.floor(Math.random() * poolItems.length)];
  }, [pool]);

  return (
    <motion.section
      style={{ padding: '60px 24px', background: '#0a0e17' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        overflow: 'hidden',
      }}>
        {/* Stat 1 */}
        <div style={{ padding: '32px 32px 28px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(18px, 3.5vw, 24px)',
            color: 'white',
            lineHeight: 1.5,
            margin: 0,
          }}>
            {formatWithBoldNumbers(selectedContrast.stat1, '#22d3ee')}
          </p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 32px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'rgba(255,255,255,0.35)',
            whiteSpace: 'nowrap',
          }}>
            happening at the same time
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Stat 2 */}
        <div style={{ padding: '28px 32px 24px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(18px, 3.5vw, 24px)',
            color: 'white',
            lineHeight: 1.5,
            margin: 0,
          }}>
            {formatWithBoldNumbers(selectedContrast.stat2, '#f87171')}
          </p>
        </div>

        {/* Voice */}
        {selectedContrast.voice && (
          <div style={{
            padding: '16px 32px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              textAlign: 'center',
            }}>
              {selectedContrast.voice}
            </p>
          </div>
        )}

        {/* Share button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 24px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <ShareButton
            text={`${selectedContrast.stat1}\n\n${selectedContrast.stat2}${selectedContrast.voice ? `\n\n"${selectedContrast.voice}"` : ''}`}
            label="Share"
            size="sm"
            align="right"
          />
        </div>
      </div>
    </motion.section>
  );
}
