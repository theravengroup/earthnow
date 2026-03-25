export interface HeroTickerItem {
  label: string;
  dailyTotal: number;
  color: string;
  icon: string;
  isStatic?: boolean;
}

export interface HeroTickerPairing {
  left: HeroTickerItem;
  right: HeroTickerItem;
}

// Hero ticker pairings - 25 contrasting pairs randomly selected on page load
export const heroTickerPairings: HeroTickerPairing[] = [
  { left: { label: "MEALS WASTED TODAY", dailyTotal: 3300000, color: "#f43f5e", icon: "Utensils" }, right: { label: "HUNGER DEATHS TODAY", dailyTotal: 25000, color: "#f97316", icon: "Heart" } },
  { left: { label: "MILITARY SPENDING TODAY ($)", dailyTotal: 6300000000, color: "#ef4444", icon: "Shield" }, right: { label: "HUNGER DEATHS TODAY", dailyTotal: 25000, color: "#f97316", icon: "Heart" } },
  { left: { label: "EMAILS SENT TODAY", dailyTotal: 300000000000, color: "#3b82f6", icon: "Mail" }, right: { label: "BOOKS READ TODAY", dailyTotal: 8200000, color: "#22c55e", icon: "BookOpen" } },
  { left: { label: "CIGARETTES SMOKED TODAY", dailyTotal: 15000000000, color: "#a855f7", icon: "Flame" }, right: { label: "CANCER DEATHS TODAY", dailyTotal: 27000, color: "#ef4444", icon: "Heart" } },
  { left: { label: "TONS OF FOOD WASTED TODAY", dailyTotal: 3300000, color: "#f43f5e", icon: "Utensils" }, right: { label: "PEOPLE IN EXTREME POVERTY TODAY", dailyTotal: 700000000, color: "#f97316", icon: "Users", isStatic: true } },
  { left: { label: "GOOGLE SEARCHES TODAY", dailyTotal: 8500000000, color: "#3b82f6", icon: "Search" }, right: { label: "HOURS SPENT IN NATURE TODAY", dailyTotal: 1400000000, color: "#22c55e", icon: "Trees" } },
  { left: { label: "PLASTIC PRODUCED TODAY (TONNES)", dailyTotal: 1000000, color: "#64748b", icon: "Package" }, right: { label: "OCEAN FISH CAUGHT TODAY (TONNES)", dailyTotal: 260000, color: "#06b6d4", icon: "Fish" } },
  { left: { label: "CO₂ EMITTED TODAY (TONNES)", dailyTotal: 115000000, color: "#eab308", icon: "Cloud" }, right: { label: "TREES PLANTED TODAY", dailyTotal: 500000, color: "#22c55e", icon: "TreePine" } },
  { left: { label: "BIRTHS TODAY", dailyTotal: 385000, color: "#22c55e", icon: "Baby" }, right: { label: "SPECIES MOVED TOWARD EXTINCTION TODAY", dailyTotal: 150, color: "#ef4444", icon: "Skull" } },
  { left: { label: "PHOTOS TAKEN TODAY", dailyTotal: 4700000000, color: "#f59e0b", icon: "Camera" }, right: { label: "FOREST LOST TODAY (HECTARES)", dailyTotal: 20000, color: "#ef4444", icon: "TreePine" } },
  { left: { label: "AI QUERIES TODAY", dailyTotal: 10000000000, color: "#8b5cf6", icon: "Cpu" }, right: { label: "SUICIDES TODAY", dailyTotal: 2200, color: "#6366f1", icon: "Heart" } },
  { left: { label: "HOURS OF VIDEO WATCHED TODAY", dailyTotal: 5000000000, color: "#ef4444", icon: "Play" }, right: { label: "HOURS OF SLEEP LOST TODAY", dailyTotal: 2500000000, color: "#a855f7", icon: "Moon" } },
  { left: { label: "MILITARY SPENDING TODAY ($)", dailyTotal: 6300000000, color: "#ef4444", icon: "Shield" }, right: { label: "EDUCATION SPENDING TODAY ($)", dailyTotal: 18000000000, color: "#22c55e", icon: "GraduationCap" } },
  { left: { label: "SMARTPHONES SOLD TODAY", dailyTotal: 3800000, color: "#8b5cf6", icon: "Smartphone" }, right: { label: "TONS OF E-WASTE CREATED TODAY", dailyTotal: 180000, color: "#64748b", icon: "Trash2" } },
  { left: { label: "GLOBAL GDP TODAY ($)", dailyTotal: 275000000000, color: "#22c55e", icon: "DollarSign" }, right: { label: "PEOPLE WITHOUT CLEAN WATER", dailyTotal: 2200000000, color: "#06b6d4", icon: "Droplets", isStatic: true } },
  { left: { label: "TWEETS POSTED TODAY", dailyTotal: 500000000, color: "#06b6d4", icon: "MessageCircle" }, right: { label: "ROAD FATALITIES TODAY", dailyTotal: 3700, color: "#ef4444", icon: "AlertTriangle" } },
  { left: { label: "AD SPENDING TODAY ($)", dailyTotal: 2700000000, color: "#f59e0b", icon: "Megaphone" }, right: { label: "MENTAL HEALTH CRISIS CALLS TODAY", dailyTotal: 1500000, color: "#a855f7", icon: "Phone" } },
  { left: { label: "OIL PUMPED TODAY (BARRELS)", dailyTotal: 100000000, color: "#eab308", icon: "Fuel" }, right: { label: "RENEWABLE ENERGY TODAY (MWH)", dailyTotal: 470000000, color: "#22c55e", icon: "Zap" } },
  { left: { label: "ALCOHOL CONSUMED TODAY (LITERS)", dailyTotal: 17500000, color: "#d946ef", icon: "Wine" }, right: { label: "HOURS SPENT EXERCISING TODAY", dailyTotal: 500000000, color: "#22c55e", icon: "Dumbbell" } },
  { left: { label: "BABIES BORN TODAY", dailyTotal: 385000, color: "#22c55e", icon: "Baby" }, right: { label: "HEART DISEASE DEATHS TODAY", dailyTotal: 49000, color: "#f43f5e", icon: "HeartPulse" } },
  { left: { label: "DATA CREATED TODAY (TB)", dailyTotal: 400000, color: "#3b82f6", icon: "Database" }, right: { label: "SOIL LOST TO EROSION TODAY (TONNES)", dailyTotal: 205000000, color: "#f97316", icon: "Mountain" } },
  { left: { label: "GOVERNMENT DEBT ADDED TODAY ($)", dailyTotal: 23300000000, color: "#ef4444", icon: "Landmark" }, right: { label: "CHILDREN BORN INTO POVERTY TODAY", dailyTotal: 150000, color: "#f97316", icon: "Baby" } },
  { left: { label: "ICE MASS LOST TODAY (TONNES)", dailyTotal: 3600000000, color: "#06b6d4", icon: "Snowflake" }, right: { label: "AIR POLLUTION DEATHS TODAY", dailyTotal: 19000, color: "#ef4444", icon: "Wind" } },
  { left: { label: "CORPORATE PROFITS TODAY ($)", dailyTotal: 137000000000, color: "#22c55e", icon: "TrendingUp" }, right: { label: "HUNGER DEATHS TODAY", dailyTotal: 25000, color: "#f97316", icon: "Heart" } },
  { left: { label: "HUMAN YEARS LIVED TODAY", dailyTotal: 8100000000, color: "#14b8a6", icon: "Clock" }, right: { label: "WILDLIFE ANIMALS KILLED TODAY", dailyTotal: 3000000000, color: "#ef4444", icon: "Rabbit" } },
];
