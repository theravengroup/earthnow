"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShareButton } from "@/components/share-button";

interface ImpactData {
  waterUsed: number;
  co2Produced: number;
  treesToOffset: number;
  mealsConsumed: number;
  energyUsed: number;
  milesTraveled: number;
  wasteProduced: number;
  plasticUsed: number;
  daysLived: number;
}

interface ImpactShareCarouselProps {
  birthYear: string;
  calculatedImpact: ImpactData;
  onRegenerate: () => void;
  onShareCurrentCard: (card: { intro: string; value: string; unit: string; context: string; color: string }) => void;
  onGetImageBlob: () => Promise<Blob | null>;
}

// Format large numbers with abbreviations
function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Math.floor(num).toLocaleString();
}

// Generate seeded random stars for consistent rendering
function generateStars(seed: number, count: number) {
  const stars = [];
  let s = seed;
  
  // Simple seeded random function
  const seededRandom = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  
  for (let i = 0; i < count; i++) {
    stars.push({
      left: seededRandom() * 100,
      top: seededRandom() * 100,
      size: 1 + seededRandom() * 1,
      opacity: 0.2 + seededRandom() * 0.4,
    });
  }
  
  return stars;
}

export function ImpactShareCarousel({
  birthYear,
  calculatedImpact,
  onRegenerate,
  onShareCurrentCard,
  onGetImageBlob,
}: ImpactShareCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  
  // Generate stars once with a fixed seed
  const stars = useMemo(() => generateStars(42, 50), []);
  
  // Card data for the 9 single-stat cards
  const cardData = [
    {
      intro: "In my lifetime, I've used",
      value: formatNumber(calculatedImpact.waterUsed),
      unit: "gallons of clean water.",
      context: "That's 3 Olympic swimming pools. Most of it went down the drain.",
      color: "#00bcd4", // cyan
    },
    {
      intro: "Since I was born,",
      value: Math.floor(calculatedImpact.co2Produced).toLocaleString(),
      unit: "tonnes of CO₂ entered the atmosphere on my behalf.",
      context: `It would take ${formatNumber(calculatedImpact.treesToOffset)} trees their entire lifetime to absorb that.`,
      color: "#ffb300", // amber
    },
    {
      intro: "It would take",
      value: formatNumber(calculatedImpact.treesToOffset),
      unit: "trees to offset my carbon footprint.",
      context: "That's a small forest. Just for one person.",
      color: "#00e676", // green
    },
    {
      intro: "I've consumed roughly",
      value: formatNumber(calculatedImpact.mealsConsumed),
      unit: "meals in my lifetime.",
      context: "About 30% of that food could have fed someone who had none.",
      color: "#ff7043", // deep orange
    },
    {
      intro: "My life has used",
      value: formatNumber(calculatedImpact.energyUsed),
      unit: "kWh of energy.",
      context: "Enough to power a small town for a year.",
      color: "#ffd740", // yellow
    },
    {
      intro: "I've traveled roughly",
      value: formatNumber(calculatedImpact.milesTraveled),
      unit: "miles in my lifetime.",
      context: "That's 33 trips around the Earth. Most of it burning fuel.",
      color: "#ce93d8", // purple
    },
    {
      intro: "I've generated",
      value: formatNumber(calculatedImpact.wasteProduced),
      unit: "pounds of waste.",
      context: "Almost all of it is still here. Somewhere.",
      color: "#ff5252", // red
    },
    {
      intro: "My lifetime's share of plastic:",
      value: formatNumber(calculatedImpact.plasticUsed),
      unit: "pounds.",
      context: "None of it has decomposed yet. None of it will in your lifetime.",
      color: "#ff80ab", // pink
    },
    {
      intro: "I've been alive for",
      value: formatNumber(calculatedImpact.daysLived),
      unit: "days.",
      context: "Every single one of them left a mark on this planet.",
      color: "#80cbc4", // teal
    },
  ];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? cardData.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === cardData.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
    
    touchStartX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentCard = cardData[currentIndex];

  return (
    <div className="flex flex-col items-center">
      {/* Carousel Container */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: "100%", maxWidth: 700 }}
      >
        {/* Left Arrow */}
        <button
          onClick={goToPrevious}
          className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 md:left-[-20px]"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          aria-label="Previous card"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>

        {/* Card Container with swipe support */}
        <div
          className="relative overflow-hidden"
          style={{ width: 600, maxWidth: "calc(100vw - 40px)" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                position: "relative",
                width: '100%',
                minHeight: 0,
                height: 'calc(100vh - 260px)',
                maxHeight: '580px',
                borderRadius: 24,
                overflow: "hidden",
              }}
            >
              {/* Layer 1 — Rich gradient background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, #0a0e17 0%, #0d1b2a 25%, #1b2a4a 50%, #0f2027 75%, #0a0e17 100%)",
                }}
              />

              {/* Layer 2 — Earth image (positioned higher to clear glass panel) */}
              <div
                style={{
                  position: "absolute",
                  top: "-60%",
                  right: "-35%",
                  width: 'min(900px, 150vw)',
                  height: 'min(900px, 150vw)',
                  aspectRatio: "1 / 1",
                  flexShrink: 0,
                  borderRadius: "50%",
                  opacity: 0.45,
                  backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1200px-The_Blue_Marble_%28remastered%29.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* Layer 3 — Dark gradient to fade Earth before glass panel */}
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: 0,
                  right: 0,
                  height: "35%",
                  background: "linear-gradient(to bottom, transparent 0%, rgba(10,14,23,0.95) 100%)",
                  zIndex: 2,
                }}
              />

              {/* Layer 4 — Bottom fill to ensure dark background behind glass */}
              <div
                style={{
                  position: "absolute",
                  top: "60%",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(10,14,23,0.95)",
                  zIndex: 2,
                }}
              />

              {/* Layer 4 — Stars */}
              {stars.map((star, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${star.left}%`,
                    top: `${star.top}%`,
                    width: star.size,
                    height: star.size,
                    borderRadius: "50%",
                    background: "#ffffff",
                    opacity: star.opacity,
                  }}
                />
              ))}

              {/* Layer 5 — Content container with flexbox layout */}
              <div
                style={{
                  position: "relative",
                  zIndex: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minHeight: 680,
                  padding: 0,
                }}
              >
                {/* Header section - outside glass panel */}
                <div
                  style={{
                    padding: "32px 0",
                    textAlign: "center",
                  }}
                >
                  {/* EarthNow wordmark */}
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    EarthNow
                  </span>

                  {/* Born in year */}
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      color: "#22d3ee",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    Born in {birthYear}
                  </span>
                </div>

                {/* Glass panel - lower portion */}
                <div
                  style={{
                    marginTop: "auto",
                    marginBottom: 24,
                    width: "78%",
                    height: "auto",
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "clamp(20px, 4vw, 40px) clamp(20px, 4vw, 36px)",
                    textAlign: "center",
                    zIndex: 10,
                  }}
                >
                  {/* Intro line */}
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 'clamp(18px, 4.5vw, 28px)',
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {currentCard.intro}
                  </span>

                  {/* Hero number */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 'clamp(48px, 12vw, 80px)',
                      fontWeight: 700,
                      color: currentCard.color,
                      marginTop: 12,
                      textShadow: "0 0 40px currentColor, 0 0 80px currentColor",
                    }}
                  >
                    {currentCard.value}
                  </span>

                  {/* Unit line */}
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 'clamp(18px, 4.5vw, 28px)',
                      color: "rgba(255,255,255,0.9)",
                      marginTop: 8,
                    }}
                  >
                    {currentCard.unit}
                  </span>

                  {/* Context line */}
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      color: "rgba(255,255,255,0.45)",
                      marginTop: 24,
                      maxWidth: 380,
                      lineHeight: 1.6,
                    }}
                  >
                    {currentCard.context}
                  </span>

                  {/* earthnow.app footer */}
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.3)",
                      marginTop: 24,
                    }}
                  >
                    earthnow.app
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        <button
          onClick={goToNext}
          className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 md:right-[-20px]"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          aria-label="Next card"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="mt-6 flex items-center gap-2">
        {cardData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="h-2 w-2 rounded-full transition-all"
            style={{
              background: index === currentIndex 
                ? "rgba(255,255,255,0.9)" 
                : "rgba(255,255,255,0.3)",
              transform: index === currentIndex ? "scale(1.2)" : "scale(1)",
            }}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>

      {/* Share Actions */}
      <div className="mt-8 flex justify-center">
        <ShareButton
          text={`${cardData[currentIndex].intro} ${cardData[currentIndex].value} ${cardData[currentIndex].unit}\n\n${cardData[currentIndex].context}`}
          title="My Lifetime Impact"
          getImageBlob={async () => {
            onShareCurrentCard(cardData[currentIndex]);
            return onGetImageBlob();
          }}
          label="Share My Impact"
          size="md"
          align="center"
        />
      </div>

      {/* Regenerate option */}
      <button
        onClick={onRegenerate}
        className="mt-6 text-[13px] text-[#64748b] transition-colors hover:text-white"
      >
        Regenerate card
      </button>
    </div>
  );
}
