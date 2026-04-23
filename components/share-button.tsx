"use client";

import { useState, useEffect, useRef } from "react";
import { Share2, Copy, Download, Link, Mail } from "lucide-react";
import { toast } from "sonner";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

interface ShareButtonProps {
  // What to share
  text: string;           // The text content to share
  url?: string;           // URL to include (defaults to earthnow.app)
  title?: string;         // Share title
  // Optional image generation
  getImageBlob?: () => Promise<Blob | null>;
  // Appearance
  label?: string;         // Button label (default: "Share")
  size?: "sm" | "md";
  align?: "left" | "right" | "center";
  /**
   * When true, renders the share trigger as a prominent teal-gradient CTA
   * suitable for "primary action" moments (e.g. the Lifetime Impact share
   * carousel). Overrides `size` padding/typography.
   */
  primary?: boolean;
}

export function ShareButton({
  text,
  url = SITE_URL,
  title = SITE_NAME,
  getImageBlob,
  label = "Share",
  size = "sm",
  align = "right",
  primary = false,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window));
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close popover on outside click or escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const handleMainClick = async () => {
    // Mobile: use native share sheet directly
    if (isMobile && navigator.share) {
      setIsGenerating(true);
      try {
        let imageBlob: Blob | null = null;
        if (getImageBlob) imageBlob = await getImageBlob();

        const canShareFiles = imageBlob && navigator.canShare?.({
          files: [new File([imageBlob], 'earthnow.png', { type: 'image/png' })]
        });

        if (canShareFiles && imageBlob) {
          await navigator.share({
            title,
            text,
            url,
            files: [new File([imageBlob], 'earthnow.png', { type: 'image/png' })],
          });
        } else {
          await navigator.share({ title, text, url });
        }
      } catch (err) {
        const errorName = err instanceof Error ? err.name : 'UnknownError';
        if (errorName !== 'AbortError') {
          // Fallback to copy
          await navigator.clipboard.writeText(`${text}\n\n${url}`).catch(() => {});
          toast.success('Copied to clipboard');
        }
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Desktop: toggle popover
    setIsOpen(prev => !prev);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`${title || 'EarthNow'} — The Planet Right Now`);
    const body = encodeURIComponent(
      `${text}\n\nearthnow.app — Real-time data on our living planet.\n\nView it live: ${url}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy link');
    }
    setIsOpen(false);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
    setIsOpen(false);
  };

  const handleCopyImage = async () => {
    if (!getImageBlob) return;
    setIsGenerating(true);
    try {
      const blob = await getImageBlob();
      if (!blob) throw new Error('No image');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      toast.success('Image copied');
    } catch {
      toast.error('Could not copy image');
    } finally {
      setIsGenerating(false);
    }
    setIsOpen(false);
  };

  const handleDownload = async () => {
    if (!getImageBlob) return;
    setIsGenerating(true);
    try {
      const blob = await getImageBlob();
      if (!blob) throw new Error('No image');
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'earthnow.png';
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Download failed');
    } finally {
      setIsGenerating(false);
    }
    setIsOpen(false);
  };

  const btnPadding = primary ? '14px 32px' : size === 'sm' ? '5px 12px' : '8px 18px';
  const btnFontSize = primary ? 15 : size === 'sm' ? 12 : 14;
  const popoverLeft = align === 'right' ? 'auto' : align === 'left' ? 0 : '50%';
  const popoverRight = align === 'right' ? 0 : 'auto';
  const popoverTransform = align === 'center' ? 'translateX(-50%)' : 'none';

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 12px',
    background: 'none',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'left',
    transition: 'background 0.15s ease',
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={handleMainClick}
        disabled={isGenerating}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: primary ? 10 : 6,
          background: primary
            ? 'linear-gradient(135deg, #0f766e, #14b8a6)'
            : 'none',
          border: primary
            ? '1px solid rgba(20,184,166,0.45)'
            : '1px solid rgba(255,255,255,0.15)',
          borderRadius: 999,
          padding: btnPadding,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: btnFontSize,
          fontWeight: primary ? 600 : 500,
          color: primary ? '#ffffff' : 'rgba(255,255,255,0.55)',
          letterSpacing: '0.02em',
          boxShadow: primary
            ? '0 0 30px rgba(20,184,166,0.28), 0 4px 14px rgba(0,0,0,0.35)'
            : 'none',
          transition: primary
            ? 'transform 0.2s ease, box-shadow 0.2s ease'
            : 'color 0.2s ease, border-color 0.2s ease',
        }}
        onMouseEnter={e => {
          if (primary) {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow =
              '0 0 38px rgba(20,184,166,0.5), 0 6px 18px rgba(0,0,0,0.4)';
          } else {
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }
        }}
        onMouseLeave={e => {
          if (primary) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow =
              '0 0 30px rgba(20,184,166,0.28), 0 4px 14px rgba(0,0,0,0.35)';
          } else {
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }
        }}
      >
        {isGenerating ? (
          <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
        ) : (
          <Share2 style={{ width: btnFontSize + 2, height: btnFontSize + 2 }} />
        )}
        {label}
      </button>

      {/* Desktop popover */}
      {isOpen && !isMobile && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: popoverLeft,
            right: popoverRight,
            transform: popoverTransform,
            zIndex: 100,
            background: 'rgba(15, 20, 30, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '6px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            minWidth: 180,
          }}
        >
          <button onClick={handleEmailShare} style={menuItemStyle}>
            <Mail style={{ width: 14, height: 14, opacity: 0.6 }} />
            Share via email
          </button>
          {getImageBlob && (
            <>
              <button onClick={handleDownload} style={menuItemStyle}>
                <Download style={{ width: 14, height: 14, opacity: 0.6 }} />
                Download image
              </button>
              <button onClick={handleCopyImage} style={menuItemStyle}>
                <Copy style={{ width: 14, height: 14, opacity: 0.6 }} />
                Copy image
              </button>
            </>
          )}
          <button onClick={handleCopyText} style={menuItemStyle}>
            <Copy style={{ width: 14, height: 14, opacity: 0.6 }} />
            Copy text
          </button>
          <button onClick={handleCopyLink} style={menuItemStyle}>
            <Link style={{ width: 14, height: 14, opacity: 0.6 }} />
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}
