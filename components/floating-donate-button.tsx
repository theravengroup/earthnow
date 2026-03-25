"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { DonateModal } from "./donate-modal";

export function FloatingDonateButton() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  // Don't render on embed route or terra thank-you page
  const isHiddenRoute = pathname === "/embed" || pathname === "/terra/thank-you";

  // Show button after scrolling past 100vh (one full viewport height)
  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      setIsVisible(window.scrollY > viewportHeight);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't render on hidden routes
  if (isHiddenRoute) {
    return null;
  }

  return (
    <div className="hidden md:block">
      {/* Floating Support Button - fixed to bottom right */}
      <button
        onClick={() => setDonateModalOpen(true)}
        className="fixed flex items-center gap-2 rounded-full px-5 py-3 font-medium"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: "linear-gradient(135deg, #0f766e, #14b8a6)",
          border: "1px solid rgba(20,184,166,0.4)",
          boxShadow: "0 4px 20px rgba(20,184,166,0.35), 0 2px 8px rgba(0,0,0,0.3)",
          color: "white",
          fontSize: 15,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 300ms ease, transform 300ms ease",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        aria-label="Support EarthNow"
      >
        <Heart className="h-[18px] w-[18px]" fill="currentColor" />
        <span>Support</span>
      </button>

      {/* Donate Modal */}
      <DonateModal 
        isOpen={donateModalOpen} 
        onClose={() => setDonateModalOpen(false)} 
      />
    </div>
  );
}
