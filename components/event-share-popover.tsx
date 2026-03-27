"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Share2, Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  category: string;
}

interface EventSharePopoverProps {
  event: TimelineEvent;
  slug: string;
  eraColor: string;
  categoryColor: string;
  position?: "left" | "right";
  buttonSize?: "sm" | "md";
}

// Category accent color (solid) for text and borders
function getCategoryAccentColor(category: string): string {
  const colors: Record<string, string> = {
    "Science": "#f59e0b",
    "Technology": "#22d3ee",
    "Exploration": "#14b8a6",
    "Environment": "#22c55e",
    "Energy": "#f97316",
    "Global Cooperation": "#a855f7",
  };
  return colors[category] || "#64748b";
}

// Category tint color for Earth overlay (25% opacity)
function getCategoryTintColor(category: string): string {
  const colors: Record<string, string> = {
    "Science": "rgba(245, 158, 11, 0.25)",
    "Technology": "rgba(34, 211, 238, 0.25)",
    "Exploration": "rgba(20, 184, 166, 0.25)",
    "Environment": "rgba(34, 197, 94, 0.25)",
    "Energy": "rgba(249, 115, 22, 0.25)",
    "Global Cooperation": "rgba(168, 85, 247, 0.25)",
  };
  return colors[category] || "rgba(100, 116, 139, 0.25)";
}

// Generate cinematic share card PNG using canvas
// 600x500 card with Earth image and glass panel
async function generateShareCardPNG(
  event: TimelineEvent,
  eraColor: string,
  categoryColor: string
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Scale factor for high-res export (2x)
  const scale = 2;
  const width = 600 * scale;
  const height = 500 * scale;
  canvas.width = width;
  canvas.height = height;

  const accentColor = getCategoryAccentColor(event.category);
  const tintColor = getCategoryTintColor(event.category);

  // ============================================
  // LAYER 1: RICH GRADIENT BACKGROUND
  // ============================================
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#0a0e17");
  bgGradient.addColorStop(0.25, "#0d1b2a");
  bgGradient.addColorStop(0.5, "#1b2a4a");
  bgGradient.addColorStop(0.75, "#0f2027");
  bgGradient.addColorStop(1, "#0a0e17");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // ============================================
  // LAYER 2: EARTH IMAGE WITH CATEGORY TINT
  // Position: top: -55%, right: -30%, 850x850
  // ============================================
  const earthSize = 850 * scale;
  const earthX = width - earthSize + (width * 0.30); // right: -30%
  const earthY = -earthSize * 0.55; // top: -55%
  
  // Load and draw Earth image
  const earthImg = new Image();
  earthImg.crossOrigin = "anonymous";
  
  await new Promise<void>((resolve) => {
    earthImg.onload = () => {
      // Draw circular clipped Earth
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthX + earthSize / 2, earthY + earthSize / 2, earthSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // Draw Earth with opacity (atmospheric, not dominant)
      ctx.globalAlpha = 0.25;
      ctx.drawImage(earthImg, earthX, earthY, earthSize, earthSize);
      ctx.globalAlpha = 1;
      
      // Category color tint overlay with mixBlendMode simulation
      const tintGradient = ctx.createRadialGradient(
        earthX + earthSize / 2, earthY + earthSize / 2, 0,
        earthX + earthSize / 2, earthY + earthSize / 2, earthSize * 0.5
      );
      // Parse tint color
      const tintMatch = tintColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)/);
      if (tintMatch) {
        const [, r, g, b, a] = tintMatch;
        tintGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${parseFloat(a)})`);
        tintGradient.addColorStop(0.7, "transparent");
      }
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = tintGradient;
      ctx.fillRect(earthX, earthY, earthSize, earthSize);
      ctx.globalCompositeOperation = "source-over";
      
      ctx.restore();
      resolve();
    };
    earthImg.onerror = () => resolve(); // Continue without Earth if load fails
    earthImg.src = "/earth-globe.jpg";
  });

  // ============================================
  // LAYER 3: STARS
  // 30-40 small white dots, varying opacity
  // ============================================
  const starCount = 35;
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = (1 + Math.random()) * scale;
    const opacity = 0.15 + Math.random() * 0.35;
    
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fill();
  }

  // ============================================
  // LAYER 4: DARK GRADIENT TRANSITION
  // top: 15%, height: 40% - tighter fade for cleaner glass background
  // ============================================
  const fadeGradient = ctx.createLinearGradient(0, height * 0.15, 0, height * 0.55);
  fadeGradient.addColorStop(0, "transparent");
  fadeGradient.addColorStop(1, "rgba(10, 14, 23, 0.95)");
  ctx.fillStyle = fadeGradient;
  ctx.fillRect(0, height * 0.15, width, height * 0.40);

  // ============================================
  // LAYER 5: "A MOMENT IN HUMAN HISTORY" LABEL
  // At top of card, above glass panel
  // ============================================
  const contentX = width / 2;
  const labelY = 32 * scale + 14 * scale; // paddingTop: 32px
  
  ctx.font = `400 ${11 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.textAlign = "center";
  ctx.fillText("A MOMENT IN HUMAN HISTORY", contentX, labelY);

  // ============================================
  // LAYER 6: GLASS PANEL (center-to-upper area)
  // margin: 20px auto 0 auto - overlaps transition zone
  // ============================================
  const panelWidth = width * 0.80;
  const panelX = (width - panelWidth) / 2;
  const panelY = 20 * scale; // margin-top: 20px
  const panelPadding = { x: 36 * scale, y: 32 * scale }; // tighter padding: 32px 36px
  const panelRadius = 20 * scale;
  const panelHeight = height * 0.68; // taller panel to fill space
  
  // Glass panel background with subtle blur effect
  ctx.save();
  roundRect(ctx, panelX, panelY, panelWidth, panelHeight, panelRadius);
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  ctx.restore();

  // ============================================
  // GLASS PANEL CONTENT
  // ============================================
  let contentY = panelY + panelPadding.y;

  // Date - Space Mono style, 48px, bold, with glow
  ctx.font = `700 ${48 * scale}px ui-monospace, 'SF Mono', Monaco, monospace`;
  ctx.fillStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 40 * scale;
  ctx.fillText(event.year, contentX, contentY);
  ctx.shadowBlur = 80 * scale;
  ctx.fillText(event.year, contentX, contentY);
  ctx.shadowBlur = 0;
  contentY += 14 * scale + 32 * scale;

  // Title - Cormorant Garamond style, italic, 26px
  ctx.font = `italic 400 ${26 * scale}px 'Georgia', 'Times New Roman', serif`;
  ctx.fillStyle = "#ffffff";
  const titleLines = wrapText(ctx, event.title, 400 * scale, 26 * scale);
  titleLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, contentX, contentY + i * 34 * scale);
  });
  contentY += Math.min(titleLines.length, 2) * 34 * scale + 14 * scale;

  // Description - 15px, muted
  ctx.font = `400 ${15 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  const descLines = wrapText(ctx, event.description, 380 * scale, 15 * scale);
  const maxDescLines = 3;
  descLines.slice(0, maxDescLines).forEach((line, i) => {
    ctx.fillText(line, contentX, contentY + i * 26 * scale);
  });
  contentY += Math.min(descLines.length, maxDescLines) * 26 * scale + 16 * scale; // marginTop: 16px to badge

  // Category badge
  const badgeText = event.category.toUpperCase();
  ctx.font = `400 ${11 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  const badgeMetrics = ctx.measureText(badgeText);
  const badgePadding = 14 * scale;
  const badgeWidth = badgeMetrics.width + badgePadding * 2;
  const badgeHeight = 26 * scale;
  const badgeX = contentX - badgeWidth / 2;
  const badgeY = contentY;
  
  // Badge border only (no fill)
  roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 20 * scale);
  ctx.strokeStyle = `${accentColor}40`; // 25% opacity
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  
  // Badge text
  ctx.fillStyle = accentColor;
  ctx.fillText(badgeText, contentX, badgeY + 17 * scale);

  // ============================================
  // LAYER 7: BRANDING (absolute bottom of card)
  // position: absolute, bottom: 20px, inside card border
  // ============================================
  const footerY = height - 20 * scale;
  
  // EarthNow wordmark
  ctx.font = `600 ${14 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.textAlign = "center";
  ctx.fillText("EarthNow", contentX, footerY - 18 * scale);
  
  // URL
  ctx.font = `400 ${12 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillText("earthnow.app/timeline", contentX, footerY);

  await new Promise(requestAnimationFrame);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

// Helper: wrap text into lines
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  // Limit to reasonable number of lines
  return lines.slice(0, Math.floor(400 / (fontSize * 1.2)));
}

// Helper: draw rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function EventSharePopover({
  event,
  slug,
  eraColor,
  categoryColor,
  position = "right",
  buttonSize = "sm",
}: EventSharePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Detect Web Share API with file support on mount
  useEffect(() => {
    const checkShareSupport = async () => {
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        try {
          const testBlob = new Blob(['test'], { type: 'image/png' });
          const testFile = new File([testBlob], 'test.png', { type: 'image/png' });
          const supported = navigator.canShare({ files: [testFile] });
          setCanShareFiles(supported);
        } catch {
          setCanShareFiles(false);
        }
      } else {
        setCanShareFiles(false);
      }
    };
    checkShareSupport();
  }, []);

  // Get deep link URL
  const getDeepLink = useCallback(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/timeline#${slug}`;
  }, [slug]);

  // Close on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Share this moment (Web Share API)
  const handleShare = async () => {
    setIsGenerating(true);

    try {
      const deepLink = getDeepLink();
      const shareText = `${event.title} (${event.year}) - ${event.description}`;

      // Try to generate image first
      const imageBlob = await generateShareCardPNG(event, eraColor, categoryColor);

      if (navigator.share) {
        // Check if file sharing is supported
        const canShareFiles =
          imageBlob &&
          navigator.canShare?.({
            files: [new File([imageBlob], "earthnow-moment.png", { type: "image/png" })],
          });

        if (canShareFiles && imageBlob) {
          // Share with image
          await navigator.share({
            title: event.title,
            text: shareText,
            url: deepLink,
            files: [new File([imageBlob], "earthnow-moment.png", { type: "image/png" })],
          });
        } else {
          // Share without image
          await navigator.share({
            title: event.title,
            text: shareText,
            url: deepLink,
          });
        }
        setIsOpen(false);
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(deepLink);
        toast.success("Link copied", {
          description: "Share link copied to clipboard",
          duration: 2000,
        });
        setIsOpen(false);
      }
    } catch (err) {
      // User cancelled or error
      const errorName = err instanceof Error ? err.name : 'UnknownError';
      if (errorName !== "AbortError") {
        toast.error("Sharing failed", {
          description: "Could not share this moment",
          duration: 2000,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy image to clipboard
  const handleCopyImage = async () => {
    setIsGenerating(true);
    try {
      const imageBlob = await generateShareCardPNG(event, eraColor, categoryColor);
      if (!imageBlob) {
        toast.error("Image generation failed", {
          description: "Try Download instead",
          duration: 3000,
        });
        setIsGenerating(false);
        return;
      }
      
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': imageBlob })
          ]);
          toast.success("Image copied", {
            description: "Share card copied to clipboard",
            duration: 2000,
          });
          setIsOpen(false);
        } catch {
          toast.error("Copy not supported", {
            description: "Copy not supported in this browser",
            duration: 2500,
          });
        }
      } else {
        toast.error("Copy not supported", {
          description: "Copy not supported in this browser",
          duration: 2500,
        });
      }
    } catch {
      toast.error("Image generation failed", {
        description: "Try Download instead",
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Download image
  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      const imageBlob = await generateShareCardPNG(event, eraColor, categoryColor);
      if (!imageBlob) throw new Error("Failed to generate image");

      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement("a");
      link.download = `earthnow-${slug}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Image downloaded", {
        description: "Share card saved to your device",
        duration: 2000,
      });
      setIsOpen(false);
    } catch {
      toast.error("Download failed", {
        description: "Could not generate image",
        duration: 2000,
      });
    } finally {
      setIsGenerating(false);
    }
  };



  const iconSize = buttonSize === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const buttonSizeClass = buttonSize === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <div className="relative">
      {/* Share button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex ${buttonSizeClass} items-center justify-center rounded-full opacity-100 md:opacity-0 transition-all duration-200 hover:bg-white/10 md:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20`}
        style={{ color: eraColor }}
        aria-label="Share this moment"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Share2 className={iconSize} />
      </button>

      {/* Tooltip when not open */}
      {!isOpen && (
        <div
          className={`pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-md bg-[#1a1f2e] px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 ${
            position === "left" ? "left-0" : "right-0"
          }`}
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}
        >
          Share this moment
        </div>
      )}

      {/* Popover menu */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute z-50 mt-2 w-[200px] animate-in fade-in-0 slide-in-from-bottom-2 ${
            position === "left" ? "left-0" : "right-0"
          }`}
          style={{
            background: "rgba(15, 20, 30, 0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
          role="menu"
          aria-label="Share options"
        >
          <div className="p-1.5">
            {/* Share this moment - only shown when Web Share API with files is supported */}
            {canShareFiles && (
              <button
                onClick={handleShare}
                disabled={isGenerating}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-white transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none disabled:opacity-50"
                role="menuitem"
              >
                {isGenerating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Share2 className="h-4 w-4 text-[#94a3b8]" />
                )}
                {isGenerating ? 'Generating...' : 'Share this moment'}
              </button>
            )}

            {/* Copy image */}
            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-white transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none disabled:opacity-50"
              role="menuitem"
            >
              {isGenerating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Copy className="h-4 w-4 text-[#94a3b8]" />
              )}
              {isGenerating ? 'Generating...' : 'Copy image'}
            </button>

            {/* Download image */}
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-white transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none disabled:opacity-50"
              role="menuitem"
            >
              {isGenerating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Download className="h-4 w-4 text-[#94a3b8]" />
              )}
              {isGenerating ? 'Generating...' : 'Download image'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
