"use client";

import { type ReactNode } from "react";

interface InteractiveLinkProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

/**
 * Standardized interactive link component that always renders as <a>
 * with proper hover styles and cursor pointer.
 * 
 * Use this for all clickable text links that trigger actions (not navigation).
 */
export function InteractiveLink({ children, onClick, className = "" }: InteractiveLinkProps) {
  return (
    <a
      href="#"
      role="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`cursor-pointer text-[#64748b] no-underline transition-colors duration-200 hover:text-white hover:underline ${className}`}
      style={{
        pointerEvents: "auto",
        position: "relative",
        zIndex: 20,
      }}
    >
      {children}
    </a>
  );
}

/**
 * Standardized button link component for "Show More" style expandable actions.
 * Renders as <a> with full-width styling.
 */
export function ExpandToggleLink({ 
  isExpanded, 
  onToggle,
  expandedLabel = "Show Fewer",
  collapsedLabel = "Show More",
}: { 
  isExpanded: boolean; 
  onToggle: () => void;
  expandedLabel?: string;
  collapsedLabel?: string;
}) {
  return (
    <a
      href="#"
      role="button"
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
      className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-3 text-[13px] font-medium text-white/70 no-underline transition-all duration-200 hover:bg-white/10 hover:text-white"
      style={{
        pointerEvents: "auto",
        position: "relative",
        zIndex: 20,
      }}
    >
      <span>{isExpanded ? expandedLabel : collapsedLabel}</span>
      <svg 
        className="h-4 w-4 transition-transform duration-300"
        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </a>
  );
}
