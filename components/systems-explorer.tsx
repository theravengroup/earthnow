"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Zap, Globe, Utensils, Cpu, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SYSTEMS_DEEP_DIVE } from "@/app/systems-data";

// CSS keyframes for animations - GPU-optimized, slow and cinematic
const animationStyles = `
  @keyframes flowParticle {
    0% { offset-distance: 0%; opacity: 0; }
    5% { opacity: 0.7; }
    95% { opacity: 0.7; }
    100% { offset-distance: 100%; opacity: 0; }
  }
  @keyframes linePulse {
    0%, 100% { opacity: 0.25; }
    50% { opacity: 0.45; }
  }
  @keyframes planetaryHeartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
  @keyframes bgFlow {
    0% { transform: translateX(0) translateY(0); }
    100% { transform: translateX(-50%) translateY(-25%); }
  }
  @keyframes planetBreathing {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.85; }
  }
  @keyframes flowDot {
    0% { transform: translate(var(--start-x), var(--start-y)); opacity: 0; }
    10% { opacity: 0.5; }
    90% { opacity: 0.5; }
    100% { transform: translate(var(--end-x), var(--end-y)); opacity: 0; }
  }
  @keyframes connectorDotBounce {
    0%, 100% { top: 0; }
    50% { top: calc(100% - 6px); }
  }
`;

// Helper function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return Math.floor(num).toLocaleString();
}

// Get seconds since local midnight
function getSecondsSinceLocalMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - midnight.getTime()) / 1000);
}

// System data configuration
const systemsConfig = [
  {
    id: "people",
    title: "People",
    description: "8.1 billion humans sharing one planet. Every second, 4 are born and 2 depart.",
    icon: Users,
    accentColor: "#22c55e",
    nodes: ["Births", "Population", "Deaths"],
    metrics: [
      { label: "Births today", dailyTotal: 380000, color: "#22c55e" },
      { label: "Deaths today", dailyTotal: 155000, color: "#ef4444" },
      { label: "Net growth", dailyTotal: 225000, color: "#10b981" },
    ],
  },
  {
    id: "energy",
    title: "Energy",
    description: "600 exajoules flow through civilization each year. The lifeblood of the modern world.",
    icon: Zap,
    accentColor: "#eab308",
    nodes: ["Sources", "Grid", "Demand"],
    metrics: [
      { label: "Energy today (MWh)", dailyTotal: 1580000000, color: "#eab308" },
      { label: "Renewables (MWh)", dailyTotal: 470000000, color: "#22c55e" },
      { label: "Oil pumped (bbl)", dailyTotal: 100000000, color: "#f97316" },
    ],
  },
  {
    id: "planet",
    title: "Planet",
    description: "Atmosphere, forests, and oceans under pressure. The systems that sustain all life.",
    icon: Globe,
    accentColor: "#06b6d4",
    nodes: ["Emissions", "Atmosphere", "Sinks"],
    metrics: [
      { label: "CO₂ today (tonnes)", dailyTotal: 140000000, color: "#94a3b8" },
      { label: "Forest lost (acres)", dailyTotal: 80000, color: "#ef4444" },
      { label: "Plastic (tonnes)", dailyTotal: 1100000, color: "#a855f7" },
    ],
  },
  {
    id: "food",
    title: "Food",
    description: "Feeding 8 billion while 800 million go hungry. A system of abundance and scarcity.",
    icon: Utensils,
    accentColor: "#f97316",
    nodes: ["Production", "Distribution", "Consumption"],
    metrics: [
      { label: "Food produced (t)", dailyTotal: 17000000, color: "#22c55e" },
      { label: "Food wasted (t)", dailyTotal: 2500000, color: "#f97316" },
      { label: "Hunger deaths", dailyTotal: 25000, color: "#ef4444" },
    ],
  },
  {
    id: "technology",
    title: "Technology",
    description: "5 billion connected minds. Data flows at planetary scale, reshaping everything.",
    icon: Cpu,
    accentColor: "#8b5cf6",
    nodes: ["Devices", "Data", "Humans"],
    metrics: [
      { label: "Google searches", dailyTotal: 8500000000, color: "#4285f4" },
      { label: "Emails sent", dailyTotal: 300000000000, color: "#8b5cf6" },
      { label: "Smartphones sold", dailyTotal: 4100000, color: "#06b6d4" },
    ],
  },
];

// Map node positions for the planetary systems diagram
// Layout:       People
//         Food — Planet — Energy
//              Technology
// Spacious layout with ~150px vertical and ~180px horizontal spacing
const mapPositions = {
  people: { x: 260, y: 60 },
  food: { x: 80, y: 195 },
  planet: { x: 260, y: 195 },
  energy: { x: 440, y: 195 },
  technology: { x: 260, y: 330 },
};

// Connections between systems
const connections = [
  { from: "people", to: "food" },
  { from: "food", to: "planet" },
  { from: "energy", to: "planet" },
  { from: "technology", to: "energy" },
  { from: "planet", to: "people" },
];

// Planetary Systems Map Component
function PlanetarySystemsMap({ 
  hoveredSystem, 
  expandedSystem,
  onHoverSystem,
  onClickSystem,
}: { 
  hoveredSystem: string | null;
  expandedSystem: string | null;
  onHoverSystem: (id: string | null) => void;
  onClickSystem: (id: string) => void;
}) {
  const systems = systemsConfig.map(s => ({
    id: s.id,
    title: s.title,
    icon: s.icon,
    color: s.accentColor,
  }));

  const getSystemById = (id: string) => systems.find(s => s.id === id);

  // Check if a connection involves the hovered system
  const isConnectionHighlighted = (conn: typeof connections[0]) => {
    if (!hoveredSystem) return false;
    return conn.from === hoveredSystem || conn.to === hoveredSystem;
  };

  return (
    <svg 
      width="520" 
      height="400" 
      viewBox="0 0 520 400"
      className="mx-auto"
      style={{ maxWidth: '100%', height: 'auto', minHeight: '380px' }}
    >
      {/* Planet node radial glow - breathing animation */}
      <defs>
        <radialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34, 197, 94, 0.18)" />
          <stop offset="30%" stopColor="rgba(34, 197, 94, 0.10)" />
          <stop offset="50%" stopColor="rgba(34, 197, 94, 0.05)" />
          <stop offset="70%" stopColor="rgba(34, 197, 94, 0)" />
        </radialGradient>
      </defs>
      
      {/* Planet glow circle - centered behind Planet node */}
      <circle
        cx={mapPositions.planet.x}
        cy={mapPositions.planet.y}
        r="220"
        fill="url(#planetGlow)"
        style={{
          animation: 'planetBreathing 10s ease-in-out infinite',
          transformOrigin: `${mapPositions.planet.x}px ${mapPositions.planet.y}px`,
        }}
      />
      
      {/* Connection lines with flow particles */}
      {connections.map((conn, i) => {
        const from = mapPositions[conn.from as keyof typeof mapPositions];
        const to = mapPositions[conn.to as keyof typeof mapPositions];
        const isHighlighted = isConnectionHighlighted(conn);
        const pathId = `path-${conn.from}-${conn.to}`;
        
        return (
          <g key={`conn-${i}`}>
            {/* Define path for motion */}
            <defs>
              <path
                id={pathId}
                d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                fill="none"
              />
            </defs>
            
            {/* Connection line with faint glow */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isHighlighted ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)"}
              strokeWidth="1.5"
              style={{
                opacity: isHighlighted ? 1 : 0.4,
                animation: hoveredSystem ? 'none' : 'linePulse 8s ease-in-out infinite',
                transition: 'stroke 150ms ease-out, opacity 150ms ease-out',
              }}
            />
            
            {/* Flow particle - travels along the line, emits every 5 seconds */}
            <circle
              r="3"
              fill="rgba(255,255,255,0.8)"
              style={{
                offsetPath: `path('M ${from.x} ${from.y} L ${to.x} ${to.y}')`,
                animation: `flowParticle 5s linear infinite`,
                animationDelay: `${i * 1}s`,
                opacity: hoveredSystem ? 0 : 0.7,
                transition: 'opacity 150ms ease-out',
              }}
            />
          </g>
        );
      })}

      {/* System nodes - synchronized planetary heartbeat */}
      {systems.map((system) => {
        const pos = mapPositions[system.id as keyof typeof mapPositions];
        const Icon = system.icon;
        const isHovered = hoveredSystem === system.id;
        const isExpanded = expandedSystem === system.id;
        
        return (
          <g 
            key={system.id}
            style={{ 
              cursor: 'pointer',
              transformOrigin: `${pos.x}px ${pos.y}px`,
              animation: hoveredSystem ? 'none' : 'planetaryHeartbeat 9s ease-in-out infinite',
            }}
            onMouseEnter={() => onHoverSystem(system.id)}
            onMouseLeave={() => onHoverSystem(null)}
            onClick={() => {
              const scrollY = window.scrollY;
              onClickSystem(system.id);
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollY);
              });
            }}
          >
            {/* Outer glow ring */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r="52"
              fill="none"
              stroke={system.color}
              strokeWidth={isExpanded ? "2" : "1"}
              style={{
                opacity: isExpanded ? 0.8 : isHovered ? 0.6 : 0.2,
                filter: isExpanded ? `drop-shadow(0 0 8px ${system.color})` : 'none',
                transition: 'opacity 150ms ease-out, stroke-width 150ms ease-out, filter 150ms ease-out',
              }}
            />
            
            {/* Inner node circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r="38"
              fill={isExpanded ? `${system.color}25` : isHovered ? `${system.color}18` : "rgba(255,255,255,0.02)"}
              stroke={isExpanded ? system.color : isHovered ? system.color : "rgba(255,255,255,0.1)"}
              strokeWidth={isExpanded ? "2" : "1.5"}
              style={{ transition: 'fill 150ms ease-out, stroke 150ms ease-out, stroke-width 150ms ease-out' }}
            />
            
            {/* Icon */}
            <foreignObject x={pos.x - 14} y={pos.y - 14} width="28" height="28">
              <div className="flex h-full w-full items-center justify-center">
                <Icon 
                  className="h-6 w-6" 
                  style={{ 
                    color: isExpanded ? system.color : isHovered ? system.color : '#94a3b8',
                    transition: 'color 150ms ease-out',
                  }} 
                />
              </div>
            </foreignObject>
            
            {/* Label - refined typography */}
            <text
              x={pos.x}
              y={pos.y + 60}
              textAnchor="middle"
              fill={isExpanded ? system.color : isHovered ? system.color : "#cbd5e1"}
              fontSize="14"
              fontWeight={isExpanded ? "600" : "500"}
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.06em"
              style={{ 
                opacity: isExpanded ? 1 : isHovered ? 1 : 0.85,
                transition: 'fill 150ms ease-out, opacity 150ms ease-out',
                whiteSpace: 'nowrap',
              }}
            >
              {system.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Simplified System Diagram for cards
function SystemDiagram({ 
  nodes, 
  accentColor, 
  isHovered,
  isMobile = false,
}: { 
  nodes: string[]; 
  accentColor: string; 
  isHovered: boolean;
  isMobile?: boolean;
}) {
  const width = isMobile ? 220 : 240;
  const height = 70;
  const nodeRadius = 4;
  const spacing = width / (nodes.length + 1);
  const y = height / 2;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      {/* Connection lines */}
      {nodes.slice(0, -1).map((_, i) => {
        const x1 = spacing * (i + 1) + nodeRadius + 4;
        const x2 = spacing * (i + 2) - nodeRadius - 4;
        
        return (
          <line
            key={`line-${i}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={accentColor}
            strokeWidth="1"
            style={{ 
              opacity: isHovered ? 0.5 : 0.25,
              transition: 'opacity 150ms ease-out',
            }}
          />
        );
      })}
      
      {/* Flow dots - only on hover, max 2 per segment */}
      {isHovered && !isMobile && nodes.slice(0, -1).map((_, i) => {
        const x1 = spacing * (i + 1) + nodeRadius + 6;
        const x2 = spacing * (i + 2) - nodeRadius - 6;
        
        return (
          <g key={`flow-${i}`}>
            <circle
              cx={x1}
              cy={y}
              r="2"
              fill={accentColor}
              style={{
                opacity: 0.6,
                animation: `flowDot 8s linear infinite`,
                '--start-x': `${x1}px`,
                '--start-y': `${y}px`,
                '--end-x': `${x2}px`,
                '--end-y': `${y}px`,
                animationDelay: `${i * 2}s`,
              } as React.CSSProperties}
            />
          </g>
        );
      })}
      
      {/* Nodes */}
      {nodes.map((node, i) => {
        const x = spacing * (i + 1);
        
        return (
          <g key={node}>
            {/* Node circle */}
            <circle
              cx={x}
              cy={y}
              r={nodeRadius}
              fill={accentColor}
              style={{ 
                opacity: isHovered ? 0.9 : 0.5,
                transition: 'opacity 150ms ease-out',
              }}
            />
            
            {/* Node label */}
            <text
              x={x}
              y={y + 18}
              textAnchor="middle"
              fill={isHovered ? "#94a3b8" : "#64748b"}
              fontSize="8"
              fontFamily="system-ui, sans-serif"
              style={{ transition: 'fill 150ms ease-out' }}
            >
              {node}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// System Card Component
function SystemCard({ 
  system, 
  isHighlighted,
  isExpanded,
  onHover,
  onClick,
  isMobile = false,
}: { 
  system: typeof systemsConfig[0]; 
  isHighlighted: boolean;
  isExpanded: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  isMobile?: boolean;
}) {
  // Initialize with zeros for consistent server/client render
  const [metricValues, setMetricValues] = useState(() => 
    system.metrics.map(() => 0)
  );

  // Delay initial sync until after hydration completes using double rAF
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    // Double requestAnimationFrame ensures hydration is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const seconds = getSecondsSinceLocalMidnight();
        setMetricValues(system.metrics.map(m => (m.dailyTotal / 86400) * seconds));
        
        // Start incrementing after initial sync
        interval = setInterval(() => {
          setMetricValues(prev => 
            prev.map((val, i) => val + (system.metrics[i].dailyTotal / 86400))
          );
        }, 1000);
      });
    });
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [system.metrics]);

  const Icon = system.icon;
  const isHovered = isHighlighted;

  const isActive = isExpanded || isHovered;

  return (
    <div
      id={`system-card-${system.id}`}
      className="relative flex flex-col overflow-hidden rounded-xl cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isExpanded ? system.accentColor + '60' : isHovered ? system.accentColor + '40' : 'rgba(255,255,255,0.05)'}`,
        boxShadow: isExpanded ? `0 0 20px ${system.accentColor}30` : 'none',
        transform: isActive && !isMobile ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 200ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out',
      }}
      onMouseEnter={() => !isMobile && onHover(true)}
      onMouseLeave={() => !isMobile && onHover(false)}
      onClick={() => {
        const scrollY = window.scrollY;
        onClick();
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }}
    >
      {/* Top accent */}
      <div
        style={{
          height: '2px',
          background: `linear-gradient(to right, transparent, ${system.accentColor}, transparent)`,
          opacity: isHovered ? 0.7 : 0.3,
          transition: 'opacity 200ms ease-out',
        }}
      />

      <div className={`flex flex-col ${isMobile ? 'p-4' : 'p-5'}`}>
        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
          <Icon 
            className="h-5 w-5" 
            style={{ 
              color: isHovered ? system.accentColor : '#64748b',
              transition: 'color 200ms ease-out',
            }} 
          />
          <h3 
            className="font-serif text-[17px] font-semibold"
            style={{ 
              color: isHovered ? '#ffffff' : '#e2e8f0',
              transition: 'color 200ms ease-out',
            }}
          >
            {system.title}
          </h3>
        </div>

        {/* Description */}
        <p className="mb-3 text-[14px] leading-relaxed text-[#94a3b8]">
          {system.description}
        </p>

        {/* Diagram */}
        <div className="mb-4 flex justify-center">
          <SystemDiagram 
            nodes={system.nodes} 
            accentColor={system.accentColor} 
            isHovered={isHovered}
            isMobile={isMobile}
          />
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-2.5">
          {system.metrics.map((metric, i) => (
            <div key={metric.label} className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">
                {metric.label}
              </span>
              <span
                className="font-mono text-[14px] font-semibold tabular-nums"
                style={{ color: metric.color }}
                suppressHydrationWarning
              >
                {formatNumber(metricValues[i])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Connector Line Component between selected tile and deep-dive panel
function ConnectorLine({ 
  accentColor,
  systemId,
  containerRef,
}: { 
  accentColor: string;
  systemId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [leftPosition, setLeftPosition] = useState<number | null>(null);
  
  useEffect(() => {
    const calculatePosition = () => {
      const tile = document.getElementById(`system-card-${systemId}`);
      const container = containerRef.current;
      
      if (tile && container) {
        const tileRect = tile.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate the horizontal center of the tile relative to the container
        const tileCenterX = tileRect.left + (tileRect.width / 2);
        const relativeX = tileCenterX - containerRect.left;
        
        setLeftPosition(relativeX);
      }
    };
    
    // Initial calculation
    calculatePosition();
    
    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculatePosition, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [systemId, containerRef]);
  
  // Don't render until we have calculated position
  if (leftPosition === null) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1, left: leftPosition }}
      exit={{ opacity: 0, scaleY: 0 }}
      transition={{ 
        opacity: { duration: 0.3, ease: "easeOut" },
        scaleY: { duration: 0.3, ease: "easeOut" },
        left: { duration: 0.3, ease: "easeOut" },
      }}
      style={{
        position: 'absolute',
        left: leftPosition,
        transform: 'translateX(-50%)',
        width: '2px',
        height: '32px',
        background: accentColor,
        boxShadow: `0 0 8px ${accentColor}80`,
        transformOrigin: 'top center',
      }}
    >
      {/* Animated dot */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: accentColor,
          boxShadow: `0 0 10px ${accentColor}CC`,
          animation: 'connectorDotBounce 2.5s ease-in-out infinite',
        }}
      />
    </motion.div>
  );
}

// Deep Dive Panel Component - Always rendered, visibility controlled via CSS
function SystemDeepDivePanel({ 
  systemId, 
  accentColor,
  isVisible,
}: { 
  systemId: string; 
  accentColor: string;
  isVisible: boolean;
}) {
  const systemData = SYSTEMS_DEEP_DIVE[systemId as keyof typeof SYSTEMS_DEEP_DIVE];
  const [activeTab, setActiveTab] = useState(0);
  const [statValues, setStatValues] = useState<number[]>([]);

  // Get current tab data
  const currentTab = systemData.tabs[activeTab];

  // Initialize stat values and update every second - only when visible
  useEffect(() => {
    if (!isVisible) return;
    
    const seconds = getSecondsSinceLocalMidnight();
    const initialValues = currentTab.stats.map(stat => {
      if ('static' in stat && stat.static !== undefined) {
        return stat.static;
      }
      return (stat.rate / 60) * seconds; // rate is per minute, convert to per second
    });
    setStatValues(initialValues);

    const interval = setInterval(() => {
      setStatValues(prev => 
        prev.map((val, i) => {
          const stat = currentTab.stats[i];
          if ('static' in stat && stat.static !== undefined) {
            return stat.static;
          }
          return val + (stat.rate / 60); // Increment by rate per second
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTab, isVisible]);

  return (
    <div
      id={`deep-dive-panel-${systemId}`}
      style={{
        maxHeight: isVisible ? '1000px' : '0px',
        opacity: isVisible ? 1 : 0,
        overflow: 'hidden',
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: isVisible 
          ? 'max-height 0.5s ease, opacity 0.3s ease 0.1s' 
          : 'max-height 0.3s ease, opacity 0.2s ease',
        marginTop: isVisible ? 16 : 0,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${accentColor}66`,
          boxShadow: `0 0 15px ${accentColor}4D, inset 0 0 15px ${accentColor}0D`,
          borderRadius: 16,
padding: 'clamp(20px, 4vw, 40px)',
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
        >
        {/* Deep Dive Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: `1px solid ${accentColor}30`,
        }}>
          <div style={{
            width: 3,
            height: 28,
            borderRadius: 2,
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}80`,
            flexShrink: 0,
          }} />
          <div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: accentColor,
              opacity: 0.8,
              marginBottom: 2,
            }}>
              Deep Dive
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 20,
              fontWeight: 600,
              color: '#ffffff',
              lineHeight: 1.2,
            }}>
              {systemsConfig.find(s => s.id === systemId)?.title} System
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[55%_22%_23%]">
          {/* Column 1: Tabbed Storytelling */}
          <div>
            {/* Tab buttons */}
            <div className="mb-6 flex gap-6">
              {systemData.tabs.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: activeTab === i ? "#ffffff" : "rgba(255,255,255,0.5)",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === i ? `2px solid ${accentColor}` : "2px solid transparent",
                    paddingBottom: 8,
                    cursor: "pointer",
                    transition: "color 200ms ease, border-color 200ms ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Narrative text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 'clamp(15px, 3.5vw, 20px)',
                    color: "rgba(255,255,255,0.8)",
                    marginBottom: 24,
                    lineHeight: 1.6,
                  }}
                >
                  {currentTab.narrative}
                </p>

                {/* Stats rows */}
                <div className="flex flex-col gap-3">
                  {currentTab.stats.map((stat, i) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between"
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 13,
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {stat.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 16,
                          fontWeight: 600,
                          color: stat.color,
                          fontVariantNumeric: "tabular-nums",
                        }}
                        suppressHydrationWarning
                      >
                        {formatNumber(statValues[i] || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Column 2: Contrast + Action */}
          <div className="hidden md:block">
            {/* Contrast block */}
            <div className="mb-5">
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "#ffffff",
                  marginBottom: 8,
                }}
              >
                {systemData.contrast.stat1}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "#ffffff",
                  marginBottom: 12,
                }}
              >
                {systemData.contrast.stat2}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {systemData.contrast.voice}
              </p>
            </div>

            {/* Separator */}
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.08)",
                margin: "20px 0",
              }}
            />

            {/* Action block */}
            <div>
              <h4
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#ffffff",
                  marginBottom: 8,
                }}
              >
                {systemData.action.title}
              </h4>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 8,
                }}
              >
                {systemData.action.stat}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {systemData.action.voice}
              </p>
            </div>
          </div>

          {/* Column 3: Connections */}
          <div className="hidden md:block">
            <h4
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 16,
              }}
            >
              Connected Systems
            </h4>
            <div className="flex flex-col gap-4">
              {systemData.connections.map((conn) => (
                <div key={conn.system}>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#ffffff",
                      marginBottom: 4,
                    }}
                  >
                    {conn.system}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {conn.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Systems Explorer Component
export function SystemsExplorer() {
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionContainerRef = useRef<HTMLDivElement>(null);

  // Handle system card click with scroll position preservation
  const handleSystemClick = (systemId: string) => {
    const scrollY = window.scrollY;
    setExpandedSystem(prev => prev === systemId ? null : systemId);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  return (
    <div className="relative" ref={sectionContainerRef} style={{ overflowAnchor: 'none' }}>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* Subtle background - global connectivity lines */}
      <div 
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity: 0.06 }}
      >
        <svg 
          width="100%" 
          height="100%" 
          className="absolute inset-0"
          style={{ 
            animation: 'bgFlow 60s linear infinite',
            minWidth: '200%',
            minHeight: '200%',
          }}
        >
          <defs>
            <pattern id="connectivity" width="200" height="200" patternUnits="userSpaceOnUse">
              <path 
                d="M0 100 Q50 50, 100 100 T200 100" 
                fill="none" 
                stroke="rgba(20,184,166,0.3)" 
                strokeWidth="0.5"
              />
              <path 
                d="M0 150 Q75 100, 150 150 T300 150" 
                fill="none" 
                stroke="rgba(20,184,166,0.2)" 
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#connectivity)" />
        </svg>
      </div>

      {/* Planetary Systems Map - only on desktop */}
      {!isMobile && (
        <div className="mb-12">
          <PlanetarySystemsMap 
            hoveredSystem={hoveredSystem}
            expandedSystem={expandedSystem}
            onHoverSystem={setHoveredSystem}
            onClickSystem={handleSystemClick}
          />
        </div>
      )}

      {/* Hint text between diagram and cards */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: isMobile ? 0 : 24,
        marginBottom: 32,
      }}>
        <span style={{ fontSize: 18 }}>
          {isMobile ? '👆' : '🖱️'}
        </span>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          fontWeight: 500,
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.65)',
          margin: 0,
        }}>
          {isMobile ? 'Tap a system to explore it' : 'Click a system to explore it'}
        </p>
      </div>

      {/* System Cards - Mobile: inline panels, Desktop: grid */}
      {isMobile ? (
        <div className="flex flex-col gap-4" style={{ overflowAnchor: 'none' }}>
          {systemsConfig.map((system) => (
            <div key={system.id}>
              <SystemCard 
                system={system}
                isHighlighted={hoveredSystem === system.id}
                isExpanded={expandedSystem === system.id}
                onHover={(hovered) => setHoveredSystem(hovered ? system.id : null)}
                onClick={() => handleSystemClick(system.id)}
                isMobile={isMobile}
              />
              {expandedSystem === system.id && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: -16,
                  marginBottom: -16,
                  zIndex: 10,
                  position: 'relative',
                }}>
                  <div style={{
                    width: 2,
                    height: 20,
                    background: systemsConfig.find(s => s.id === system.id)?.accentColor || '#22c55e',
                    boxShadow: `0 0 6px ${systemsConfig.find(s => s.id === system.id)?.accentColor || '#22c55e'}`,
                  }} />
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: systemsConfig.find(s => s.id === system.id)?.accentColor || '#22c55e',
                    boxShadow: `0 0 8px ${systemsConfig.find(s => s.id === system.id)?.accentColor || '#22c55e'}`,
                  }} />
                </div>
              )}
              {expandedSystem === system.id && (
                <SystemDeepDivePanel
                  systemId={system.id}
                  accentColor={system.accentColor}
                  isVisible={true}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div 
          ref={cardsRef}
          className="grid grid-cols-5 gap-4"
          style={{ overflowAnchor: 'none' }}
        >
          {systemsConfig.map((system) => (
            <SystemCard 
              key={system.id}
              system={system}
              isHighlighted={hoveredSystem === system.id}
              isExpanded={expandedSystem === system.id}
              onHover={(hovered) => setHoveredSystem(hovered ? system.id : null)}
              onClick={() => handleSystemClick(system.id)}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {/* Connector Line - only shown on desktop when a system is expanded */}
      {!isMobile && (
        <div 
          style={{ 
            overflowAnchor: 'none',
            maxHeight: expandedSystem ? '48px' : '0px',
            opacity: expandedSystem ? 1 : 0,
            overflow: 'hidden',
            transition: expandedSystem 
              ? 'max-height 0.3s ease, opacity 0.2s ease 0.1s' 
              : 'max-height 0.2s ease, opacity 0.15s ease',
          }}
        >
          {expandedSystem && (
            <div className="relative py-2" style={{ height: '48px' }}>
              <ConnectorLine
                key={`connector-${expandedSystem}`}
                systemId={expandedSystem}
                containerRef={sectionContainerRef}
                accentColor={systemsConfig.find(s => s.id === expandedSystem)?.accentColor || "#22c55e"}
              />
            </div>
          )}
        </div>
      )}

      {/* Deep Dive Panels - Desktop only, ALL 5 always in DOM, visibility toggled via CSS */}
      {!isMobile && (
        <div style={{ overflowAnchor: 'none' }}>
          {systemsConfig.map((system) => (
            <SystemDeepDivePanel
              key={system.id}
              systemId={system.id}
              accentColor={system.accentColor}
              isVisible={expandedSystem === system.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
