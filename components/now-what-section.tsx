"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Share2, Download, Copy, Check, X } from "lucide-react";
import { SITE_URL } from "@/lib/constants";
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

// Generate a shareable card image on canvas
async function generateShareCard(
  action: { title: string; stat: string; voice: string },
  canvas: HTMLCanvasElement,
): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const w = 1080;
  const h = 1350; // 4:5 ratio for Instagram/social
  canvas.width = w;
  canvas.height = h;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0a0e17");
  bg.addColorStop(0.4, "#0d1220");
  bg.addColorStop(1, "#070b11");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle teal glow
  const glow = ctx.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.35, 400);
  glow.addColorStop(0, "rgba(20,184,166,0.08)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Top accent line
  ctx.fillStyle = "rgba(20,184,166,0.4)";
  ctx.fillRect(0, 0, w, 3);

  // "EARTHNOW INSPIRED ME TO..." label
  ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = "rgba(20,184,166,0.7)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("EARTHNOW INSPIRED ME TO", w / 2, 120);

  // Action title
  ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  // Word-wrap the title
  const titleWords = action.title.split(" ");
  let titleLines: string[] = [];
  let currentLine = "";
  for (const word of titleWords) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(test).width > w - 160) {
      titleLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  titleLines.push(currentLine);

  const titleStartY = 200;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, w / 2, titleStartY + i * 64);
  });

  // Divider
  const dividerY = titleStartY + titleLines.length * 64 + 40;
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 80, dividerY);
  ctx.lineTo(w / 2 + 80, dividerY);
  ctx.stroke();

  // Stat text — word-wrap
  ctx.font = '400 28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.textAlign = "center";

  const statWords = action.stat.split(" ");
  let statLines: string[] = [];
  currentLine = "";
  for (const word of statWords) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(test).width > w - 160) {
      statLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  statLines.push(currentLine);

  const statStartY = dividerY + 50;
  statLines.forEach((line, i) => {
    ctx.fillText(line, w / 2, statStartY + i * 40);
  });

  // Voice text — italic, word-wrap
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillStyle = "#14b8a6";
  ctx.textAlign = "center";

  const voiceWords = action.voice.split(" ");
  let voiceLines: string[] = [];
  currentLine = "";
  for (const word of voiceWords) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(test).width > w - 180) {
      voiceLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  voiceLines.push(currentLine);

  const voiceStartY = statStartY + statLines.length * 40 + 50;
  voiceLines.forEach((line, i) => {
    ctx.fillText(line, w / 2, voiceStartY + i * 36);
  });

  // Footer area
  // "I'm making this change." declaration
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "center";
  ctx.fillText("I'm making this change.", w / 2, h - 180);

  // Date
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  ctx.font = '400 18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = "#768a9e";
  ctx.fillText(dateStr, w / 2, h - 130);

  // EarthNow.app
  ctx.font = '500 20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = "#475569";
  ctx.fillText("EarthNow.app", w / 2, h - 80);

  // Bottom accent
  ctx.fillStyle = "rgba(20,184,166,0.4)";
  ctx.fillRect(0, h - 3, w, 3);

  return canvas;
}

export function NowWhatSection() {
  // Randomly select 8 actions from the pool
  const selectedActions = useMemo(() => {
    const shuffled = [...ACTION_POOL]
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
    return shuffled.slice(0, 8);
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState<"image" | "text" | null>(null);
  const [direction, setDirection] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const activeAction = selectedActions[activeIndex];

  const goTo = useCallback(
    (newIndex: number) => {
      const wrapped =
        ((newIndex % selectedActions.length) + selectedActions.length) %
        selectedActions.length;
      setDirection(newIndex > activeIndex ? 1 : -1);
      setActiveIndex(wrapped);
    },
    [activeIndex, selectedActions.length]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchDeltaX.current > 50) goPrev();
    else if (touchDeltaX.current < -50) goNext();
    touchDeltaX.current = 0;
  };

  // Share functions
  const downloadImage = async () => {
    if (!canvasRef.current) return;
    await generateShareCard(activeAction, canvasRef.current);
    const link = document.createElement("a");
    link.download = `earthnow-action-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const copyImage = async () => {
    if (!canvasRef.current) return;
    await generateShareCard(activeAction, canvasRef.current);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to create blob"));
        }, "image/png");
      });
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied("image");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      await downloadImage();
    }
  };

  const copyText = async () => {
    const text = `${activeAction.title}\n\n${activeAction.stat}\n\n${activeAction.voice}\n\nInspired by EarthNow.app`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied("text");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // silent fail
    }
  };

  const handleShare = async () => {
    // Try native share first (mobile)
    if ("share" in navigator) {
      try {
        await navigator.share({
          title: activeAction.title,
          text: `${activeAction.stat}\n\n${activeAction.voice}`,
          url: SITE_URL,
        });
        return;
      } catch {
        // Fall through to modal
      }
    }
    setShareModalOpen(true);
  };

  // Slide animation variants
  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section
      style={{
        padding: "100px 24px",
        background: "#0a0e17",
      }}
    >
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
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

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 0,
          }}
        >
          Eight actions, ranked by actual impact. Swipe to explore.
        </p>
      </div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}
      >
        {/* Card area with fixed height to prevent layout shift */}
        <div
          style={{
            position: "relative",
            minHeight: 280,
            overflow: "hidden",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
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
                {activeAction.title}
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
                {formatStatWithNumbers(activeAction.stat)}
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
                {activeAction.voice}
              </p>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="mt-5 flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 hover:bg-[rgba(20,184,166,0.2)]"
                style={{
                  background: "rgba(20,184,166,0.1)",
                  border: "1px solid rgba(20,184,166,0.3)",
                  color: "#14b8a6",
                }}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share this action
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation controls */}
        <div
          className="mt-6 flex items-center justify-center gap-4"
        >
          {/* Previous button */}
          <button
            onClick={goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            aria-label="Previous action"
          >
            <ChevronLeft className="h-5 w-5 text-[#94a3b8]" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {selectedActions.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeIndex ? 24 : 8,
                  height: 8,
                  background:
                    i === activeIndex
                      ? "#14b8a6"
                      : "rgba(255,255,255,0.15)",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label={`Go to action ${i + 1}`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={goNext}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            aria-label="Next action"
          >
            <ChevronRight className="h-5 w-5 text-[#94a3b8]" />
          </button>
        </div>

        {/* Counter */}
        <p
          className="mt-3 text-center font-mono text-[12px] tracking-wider"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {activeIndex + 1} / {selectedActions.length}
        </p>
      </div>

      {/* Hidden canvas for share card generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
              style={{
                background: "rgba(10,14,23,0.85)",
                backdropFilter: "blur(8px)",
              }}
              onClick={() => setShareModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="fixed left-1/2 top-1/2 z-[101] w-[95%] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Share this action"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,25,35,0.98) 0%, rgba(10,14,23,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow:
                  "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px rgba(20,184,166,0.1)",
              }}
            >
              <button
                onClick={() => setShareModalOpen(false)}
                className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white/15"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <X className="h-4 w-4 text-[#94a3b8]" />
              </button>

              <div className="p-6 pt-16">
                {/* Preview */}
                <div className="mb-5 text-center">
                  <p className="mb-3 flex items-center justify-center gap-2 text-[13px] uppercase tracking-wider text-[#94a3b8]">
                    <Share2 className="h-3.5 w-3.5" />
                    Share This Action
                  </p>
                  <div
                    className="relative mx-auto overflow-hidden rounded-xl"
                    style={{
                      width: "100%",
                      maxWidth: 280,
                      aspectRatio: "4/5",
                      background:
                        "linear-gradient(180deg, #0a0e17 0%, #0d1220 50%, #070b11 100%)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow:
                        "0 8px 32px rgba(0,0,0,0.3), 0 0 40px rgba(20,184,166,0.08)",
                    }}
                  >
                    <div className="flex h-full flex-col items-center justify-center p-5 text-center">
                      <p
                        className="text-[9px] font-semibold uppercase tracking-[0.15em]"
                        style={{ color: "rgba(20,184,166,0.7)" }}
                      >
                        EarthNow inspired me to
                      </p>
                      <p className="mt-2 text-[15px] font-bold text-white">
                        {activeAction.title}
                      </p>
                      <div className="my-3 h-px w-10 bg-white/10" />
                      <p className="text-[10px] leading-relaxed text-white/70">
                        {activeAction.stat.length > 100
                          ? activeAction.stat.slice(0, 100) + "..."
                          : activeAction.stat}
                      </p>
                      <p
                        className="mt-3 font-serif text-[10px] italic"
                        style={{ color: "#14b8a6" }}
                      >
                        I&apos;m making this change.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={downloadImage}
                    className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[13px] font-medium transition-all duration-200"
                    style={{
                      background: "rgba(20,184,166,0.15)",
                      border: "1px solid rgba(20,184,166,0.3)",
                      color: "#14b8a6",
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download Image
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={copyImage}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: copied === "image" ? "#14b8a6" : "#94a3b8",
                      }}
                    >
                      {copied === "image" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied === "image" ? "Copied!" : "Copy Image"}
                    </button>
                    <button
                      onClick={copyText}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: copied === "text" ? "#14b8a6" : "#94a3b8",
                      }}
                    >
                      {copied === "text" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied === "text" ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShareModalOpen(false)}
                  className="mt-4 w-full text-center text-[13px] text-[#768a9e] transition-colors hover:text-white"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
