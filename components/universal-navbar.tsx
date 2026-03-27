"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Primary navigation links (left of divider)
// Order: Past → Present → Personal Impact (narrative flow)
const primaryNavLinks = [
  { id: "vital-signs", label: "Vital Signs", href: "/#vital-signs", type: "section" },
  { id: "systems", label: "Systems", href: "/#systems", type: "section" },
  { id: "milestones", label: "How We Got Here", href: "/#milestones", type: "section" },
  { id: "your-impact", label: "Your Impact", href: "/#your-impact", type: "section" },
  { id: "while-you-were-here", label: "Right Now", href: "/#while-you-were-here", type: "section" },
  { id: "today", label: "Today", href: "/today", type: "page" },
];

interface UniversalNavbarProps {
  /** Current active section ID (for homepage scroll tracking) */
  activeSection?: string;
  /** Callback when a section link is clicked (for smooth scroll on homepage) */
  onSectionClick?: (sectionId: string) => void;
  /** Force solid dark background regardless of scroll position */
  forceSolidBackground?: boolean;
}

export function UniversalNavbar({ activeSection, onSectionClick, forceSolidBackground = false }: UniversalNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

  // Determine active page based on pathname
  const getActivePage = () => {
    if (pathname === "/roadmap") return "roadmap";
    if (pathname === "/timeline") return "timeline";
    if (pathname === "/thank-you") return "thank-you";
    if (pathname === "/today") return "today";
    return "home";
  };

  const activePage = getActivePage();
  const isHomepage = pathname === "/";

  // Scroll detection for navbar background, shrink, and progress
  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 40);
        
        // Calculate scroll progress (0 to 1)
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
        setScrollProgress(Math.min(Math.max(progress, 0), 1));
      });
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Navbar height based on scroll state
  const navHeight = isScrolled ? "h-16" : "h-20";

  // Handle link click
  const handleLinkClick = (link: typeof primaryNavLinks[0]) => {
    if (isHomepage && link.type === "section" && onSectionClick) {
      // On homepage, smooth scroll to section
      onSectionClick(link.id);
      setMobileMenuOpen(false);
      return;
    }
    // For page links or when not on homepage, let the Link handle navigation
    setMobileMenuOpen(false);
  };

  // Check if a link is active
  const isLinkActive = (link: typeof primaryNavLinks[0]) => {
    if (link.type === "page") {
      // For page links, check if current path matches or starts with the link href
      if (link.id === "today") {
        return pathname === "/today" || pathname.startsWith("/today/");
      }
      return link.id === activePage;
    }
    if (isHomepage && activeSection) {
      return link.id === activeSection;
    }
    return false;
  };

  // Handle logo click
  const handleLogoClick = () => {
    if (isHomepage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Fixed Navigation Bar - HIGHEST z-index (1000) to stay above ALL page content */}
      <nav
        className={`fixed left-0 right-0 top-0 flex items-center px-6 ${navHeight}`}
  style={{
  zIndex: 1000,
  background: forceSolidBackground ? "rgba(10,14,23,0.95)" : (isScrolled ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.15)"),
  backdropFilter: forceSolidBackground ? "none" : (isScrolled ? "blur(12px)" : "blur(0px)"),
  WebkitBackdropFilter: forceSolidBackground ? "none" : (isScrolled ? "blur(12px)" : "blur(0px)"),
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  transition: "background 220ms ease, backdrop-filter 220ms ease, -webkit-backdrop-filter 220ms ease, height 220ms ease-out",
  }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          {/* Logo / Site Title */}
          <Link
            href="/"
            onClick={(e) => {
              if (isHomepage) {
                e.preventDefault();
                handleLogoClick();
              }
            }}
            className="group mr-14 flex items-center gap-2"
          >
            {/* Teal dot */}
            <div
              className="h-[6px] w-[6px] rounded-full transition-all duration-300"
              style={{
                background: "#14b8a6",
                boxShadow: "0 0 6px rgba(20,184,166,0.5)",
              }}
            />
            {/* Site title with hover underline */}
            <span className="relative cursor-pointer font-serif text-[22px] font-bold text-white transition-colors duration-200 group-hover:text-[#f8fafc]">
              EarthNow
              <span
                className="absolute -bottom-[3px] left-1/2 h-[2px] w-0 -translate-x-1/2 transition-all duration-[240ms] ease-out group-hover:w-full"
                style={{ background: "rgba(255,255,255,0.6)" }}
              />
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center lg:flex" style={{ gap: "24px" }}>
            {/* Primary nav links */}
            {primaryNavLinks.map((link) => {
              const isActive = isLinkActive(link);

              // For section links on homepage, use button to enable smooth scroll
              if (isHomepage && link.type === "section") {
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link)}
                    className="nav-link group relative text-[14px] font-medium tracking-wide transition-all duration-200"
                    style={{ 
                      color: isActive ? "white" : "#94a3b8",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.textShadow = "0 0 12px rgba(255,255,255,0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "#94a3b8";
                        e.currentTarget.style.textShadow = "none";
                      }
                    }}
                  >
                    {link.label}
                    {/* Underline - active state is teal, hover grows from center */}
                    <span
                      className="absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 transition-all duration-[240ms] ease-out"
                      style={{ 
                        background: isActive ? "#14b8a6" : "currentColor",
                        width: isActive ? "20px" : "0px",
                      }}
                    />
                    {/* Hover underline (only when not active) */}
                    {!isActive && (
                      <span
                        className="absolute -bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 transition-all duration-[240ms] ease-out group-hover:w-full"
                        style={{ background: "rgba(255,255,255,0.5)" }}
                      />
                    )}
                  </button>
                );
              }

              // For non-homepage or page links, use Link component with active state support
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className="nav-link group relative text-[14px] font-medium tracking-wide transition-all duration-200"
                  style={{ 
                    color: isActive ? "white" : "#94a3b8",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.textShadow = "0 0 12px rgba(255,255,255,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.textShadow = "none";
                    }
                  }}
                >
                  {link.label}
                  {/* Underline - active state is teal, hover grows from center */}
                  <span
                    className="absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 transition-all duration-[240ms] ease-out"
                    style={{ 
                      background: isActive ? "#14b8a6" : "currentColor",
                      width: isActive ? "20px" : "0px",
                    }}
                  />
                  {/* Hover underline (only when not active) */}
                  {!isActive && (
                    <span
                      className="absolute -bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 transition-all duration-[240ms] ease-out group-hover:w-full"
                      style={{ background: "rgba(255,255,255,0.5)" }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Terra Pill Button */}
            <Link
              href="/terra"
              className="rounded-full font-sans text-[13px] text-white transition-all duration-200"
              style={{
                padding: "6px 16px",
                border: "1px solid rgba(20,184,166,0.6)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(20,184,166,0.15)";
                e.currentTarget.style.borderColor = "rgba(20,184,166,1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)";
              }}
            >
              Terra
            </Link>

            {/* Scroll Progress Orbit Indicator - shows on all pages */}
            <div 
              className="relative ml-4 flex items-center justify-center"
              style={{ width: "26px", height: "26px" }}
              title={isHomepage ? `${Math.round(scrollProgress * 100)}% explored` : "EarthNow"}
            >
              {/* Orbit ring */}
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                className="absolute inset-0"
              >
                {/* Orbit path */}
                <circle
                  cx="13"
                  cy="13"
                  r="11"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                {/* Progress arc - only animates on homepage, static full circle on other pages */}
                <circle
                  cx="13"
                  cy="13"
                  r="11"
                  fill="none"
                  stroke="rgba(20,184,166,0.5)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray={isHomepage ? `${scrollProgress * 69.115} 69.115` : "69.115 69.115"}
                  transform="rotate(-90 13 13)"
                  style={{ transition: "stroke-dasharray 50ms linear" }}
                />
              </svg>
              
              {/* Center Earth dot */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "6px",
                  height: "6px",
                  background: "linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)",
                  boxShadow: "0 0 4px rgba(20,184,166,0.4)",
                }}
              />
              
              {/* Orbiting dot - scroll-reactive on homepage, slow continuous rotation on other pages */}
              <div
                className={isHomepage ? "" : "navbar-orbit-spin"}
                style={{
                  position: "absolute",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "white",
                  boxShadow: "0 0 8px rgba(255,255,255,0.6)",
                  // Position on the orbit (radius 11px from center)
                  // Homepage: scroll-reactive rotation, Other pages: starts at top, CSS animation handles rotation
                  transform: isHomepage 
                    ? `rotate(${scrollProgress * 360 - 90}deg) translateX(11px)`
                    : `rotate(-90deg) translateX(11px)`,
                  transformOrigin: "center center",
                  left: "calc(50% - 2.5px)",
                  top: "calc(50% - 2.5px)",
                }}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="relative z-[60] text-white lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center lg:hidden"
            style={{
              background: "rgba(10,14,23,0.98)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Mobile Nav Links */}
            <div className="flex flex-col items-center gap-6">
              {/* Primary nav links */}
              {primaryNavLinks.map((link, index) => {
                const isActive = isLinkActive(link);

                if (isHomepage && link.type === "section") {
                  return (
                    <motion.button
                      key={link.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleLinkClick(link)}
                      className="font-serif text-[22px] transition-colors duration-200 hover:text-[#14b8a6]"
                      style={{ color: isActive ? "#14b8a6" : "white" }}
                    >
                      {link.label}
                    </motion.button>
                  );
                }

                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-serif text-[22px] text-white transition-colors duration-200 hover:text-[#14b8a6]"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Terra Pill Button - Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: primaryNavLinks.length * 0.05 }}
              >
                <Link
                  href="/terra"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-[22px] transition-colors duration-200 inline-flex items-center gap-2"
                  style={{ color: '#14b8a6' }}
                >
                  Terra
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#14b8a6',
                    opacity: 0.7,
                    border: '1px solid rgba(20,184,166,0.4)',
                    borderRadius: '4px',
                    padding: '2px 5px',
                    lineHeight: 1,
                  }}>
                    Display
                  </span>
                </Link>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
