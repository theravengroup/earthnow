"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Smartphone, 
  Trash2, 
  Zap, 
  Users, 
  Sparkles,
  Moon,
  Briefcase,
  Monitor,
  Camera,
  MessageSquare,
  Search,
  Database,
  Recycle,
  Leaf,
  Droplets,
  Sun,
  Home,
  Heart,
  MessageCircle,
  Share2,
  Network
} from "lucide-react";
import {
  TIME_CONSTANTS,
  DIGITAL_CONSTANTS,
  WASTE_CONSTANTS,
  ENERGY_CONSTANTS,
  SOCIAL_CONSTANTS,
  INFLUENCE_CONSTANTS,
  calculateYearsLived,
  calculateDaysLived,
  calculateWorkingYears,
  SECTION_COLORS,
} from "@/lib/impact-constants";

// Format large numbers with abbreviations
function formatNumber(num: number): string {
  const absNum = Math.floor(Math.abs(num));
  
  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }
  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return Math.floor(num).toLocaleString();
}

// Animated counter hook
function useAnimatedValue(targetValue: number, duration: number = 1500) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const startAnimation = React.useCallback(() => {
    if (hasAnimated || targetValue === 0) return;
    
    setHasAnimated(true);
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = targetValue * easeOut;
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetValue, duration, hasAnimated]);

  return { displayValue, startAnimation, hasAnimated };
}

// Single metric card with animated number
function MetricCard({
  value,
  label,
  microcopy,
  icon: Icon,
  color,
  delay = 0,
}: {
  value: number;
  label: string;
  microcopy: string;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  const { displayValue, startAnimation } = useAnimatedValue(value);
  const formatted = formatNumber(displayValue);
  const accentTint = `linear-gradient(135deg, ${color}14 0%, transparent 60%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      onViewportEnter={() => startAnimation()}
      className="group relative overflow-hidden rounded-2xl p-5"
      style={{
        background: `${accentTint}, linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Icon */}
      <div 
        className="mb-3 inline-flex rounded-lg p-2"
        style={{ background: `${color}20` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      
      {/* Value */}
      <div 
        className="font-mono text-[26px] font-semibold tabular-nums md:text-[30px]"
        style={{ color, textShadow: `0 0 12px ${color}4d` }}
      >
        {value === 0 ? "—" : formatted}
      </div>
      
      {/* Label */}
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[#64748b]">
        {label}
      </div>
      
      {/* Microcopy */}
      <div className="mt-2 text-[12px] leading-relaxed text-[#94a3b8]">
        {microcopy}
      </div>
    </motion.div>
  );
}

// Time allocation bar
function TimeBar({
  label,
  years,
  totalYears,
  color,
  delay = 0,
}: {
  label: string;
  years: number;
  totalYears: number;
  color: string;
  delay?: number;
}) {
  const percentage = totalYears > 0 ? (years / totalYears) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="mb-4"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] text-white">{label}</span>
        <span className="font-mono text-[13px] text-[#94a3b8]">
          {years.toFixed(1)} years
        </span>
      </div>
      <div 
        className="h-2 overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 12px ${color}4d`,
          }}
        />
      </div>
    </motion.div>
  );
}

// Section wrapper component
function ImpactSubSection({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
      className="mb-10 sm:mb-20"
    >
      {/* Section header */}
      <div className="mb-8 text-center">
        <h3 className="mb-2 font-serif text-[28px] font-semibold text-white md:text-[32px]">
          {title}
        </h3>
        <p className="mx-auto max-w-xl text-[15px] text-[#94a3b8]">
          {subtitle}
        </p>
      </div>
      
      {children}
    </motion.div>
  );
}

// Main expanded sections component
export function ExpandedImpactSections({ birthYear }: { birthYear: number | "" }) {
  if (!birthYear) return null;
  
  const yearsLived = calculateYearsLived(birthYear);
  const daysLived = calculateDaysLived(birthYear);
  const workingYears = calculateWorkingYears(birthYear);
  
  // Time calculations
  const hoursSleeping = daysLived * TIME_CONSTANTS.HOURS_SLEEP_PER_DAY;
  const yearsSleeping = hoursSleeping / 8760; // hours in a year
  const hoursWorking = workingYears * TIME_CONSTANTS.HOURS_WORK_PER_DAY_WORKING_YEARS * 250; // 250 work days/year
  const yearsWorking = hoursWorking / 8760;
  const hoursScreen = daysLived * TIME_CONSTANTS.HOURS_SCREEN_PER_DAY;
  const yearsScreen = hoursScreen / 8760;
  const hoursEating = daysLived * TIME_CONSTANTS.HOURS_EATING_PER_DAY;
  const yearsEating = hoursEating / 8760;
  
  // Digital calculations
  const photosTaken = yearsLived * DIGITAL_CONSTANTS.PHOTOS_PER_YEAR;
  const messagesSent = yearsLived * DIGITAL_CONSTANTS.MESSAGES_PER_YEAR;
  const searchesMade = yearsLived * DIGITAL_CONSTANTS.SEARCHES_PER_YEAR;
  const dataGenerated = yearsLived * DIGITAL_CONSTANTS.DATA_GB_PER_YEAR;
  
  // Waste calculations
  const poundsTrash = yearsLived * WASTE_CONSTANTS.POUNDS_TRASH_PER_YEAR;
  const tonsTrash = poundsTrash / 2000;
  const poundsPlastic = yearsLived * WASTE_CONSTANTS.POUNDS_PLASTIC_PER_YEAR;
  
  // Energy calculations
  const totalKwh = yearsLived * ENERGY_CONSTANTS.KWH_PER_YEAR;
  const barrelsOil = totalKwh / ENERGY_CONSTANTS.KWH_PER_BARREL_OIL;
  const solarPanelsNeeded = totalKwh / (ENERGY_CONSTANTS.KWH_PER_SOLAR_PANEL_YEAR * yearsLived);
  const yearsHomeElectricity = totalKwh / ENERGY_CONSTANTS.HOME_KWH_PER_YEAR;
  
  // Social calculations
  const peopleMet = yearsLived * SOCIAL_CONSTANTS.PEOPLE_MET_PER_YEAR;
  const conversations = daysLived * SOCIAL_CONSTANTS.CONVERSATIONS_PER_DAY;
  const mealsShared = yearsLived * SOCIAL_CONSTANTS.MEALS_SHARED_PER_YEAR;
  
  // Influence calculations
  const peopleInfluenced = yearsLived * INFLUENCE_CONSTANTS.PEOPLE_DIRECTLY_INFLUENCED_PER_YEAR;
  const ideasShared = daysLived * INFLUENCE_CONSTANTS.IDEAS_SHARED_PER_DAY;
  const totalReach = INFLUENCE_CONSTANTS.AVERAGE_SOCIAL_REACH * INFLUENCE_CONSTANTS.SECOND_DEGREE_MULTIPLIER;

  return (
    <div className="mt-8 border-t border-white/10 pt-8 sm:mt-16 sm:pt-16">
      {/* Section Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <span className="inline-block rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-[#94a3b8]">
          The Full Picture
        </span>
      </motion.div>

      {/* 1. TIME SPENT ALIVE */}
      <ImpactSubSection
        title="Where Your Time Has Gone"
        subtitle="A human life is finite. Here's how yours has been allocated so far."
      >
        <div 
          className="mx-auto max-w-2xl rounded-2xl p-6 md:p-8"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="mb-6 text-center">
            <span 
              className="font-mono text-[48px] font-bold md:text-[56px]"
              style={{ color: SECTION_COLORS.time, textShadow: `0 0 30px ${SECTION_COLORS.time}4d` }}
            >
              {daysLived.toLocaleString()}
            </span>
            <p className="text-[14px] text-[#94a3b8]">days lived</p>
          </div>
          
          <TimeBar label="Sleeping" years={yearsSleeping} totalYears={yearsLived} color="#6366f1" delay={0.1} />
          <TimeBar label="Working" years={yearsWorking} totalYears={yearsLived} color="#f59e0b" delay={0.2} />
          <TimeBar label="Screens" years={yearsScreen} totalYears={yearsLived} color="#3b82f6" delay={0.3} />
          <TimeBar label="Eating" years={yearsEating} totalYears={yearsLived} color="#22c55e" delay={0.4} />
          
          <p className="mt-6 text-center text-[13px] italic text-[#64748b]">
            The rest is everything else: relationships, hobbies, wondering, wandering.
          </p>
        </div>
      </ImpactSubSection>

      {/* 2. DIGITAL FOOTPRINT */}
      <ImpactSubSection
        title="Your Digital Shadow"
        subtitle="You exist twice now: once in flesh, once in data."
        delay={0.1}
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            value={photosTaken}
            label="Photos Taken"
            microcopy="Moments frozen in pixels"
            icon={Camera}
            color={SECTION_COLORS.digital}
            delay={0.1}
          />
          <MetricCard
            value={messagesSent}
            label="Messages Sent"
            microcopy="Words into the void"
            icon={MessageSquare}
            color="#8b5cf6"
            delay={0.15}
          />
          <MetricCard
            value={searchesMade}
            label="Internet Searches"
            microcopy="Questions asked of machines"
            icon={Search}
            color="#06b6d4"
            delay={0.2}
          />
          <MetricCard
            value={dataGenerated}
            label="Gigabytes Generated"
            microcopy="Your digital mass, ever-growing"
            icon={Database}
            color="#ec4899"
            delay={0.25}
          />
        </div>
      </ImpactSubSection>

      {/* 3. WASTE GENERATED */}
      <ImpactSubSection
        title="What You've Left Behind"
        subtitle="Every life produces a shadow of material waste."
        delay={0.1}
      >
        <div className="mx-auto max-w-3xl">
          {/* Big shocking number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8 rounded-2xl p-8 text-center"
            style={{
              background: `linear-gradient(135deg, ${SECTION_COLORS.waste}10 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <div 
              className="font-mono text-[56px] font-bold md:text-[72px]"
              style={{ color: SECTION_COLORS.waste, textShadow: `0 0 40px ${SECTION_COLORS.waste}4d` }}
            >
              {tonsTrash.toFixed(1)}
            </div>
            <p className="text-[16px] font-medium text-white">tons of trash</p>
            <p className="mt-2 text-[14px] text-[#94a3b8]">
              That's roughly {Math.round(tonsTrash / 2)} adult elephants in weight
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MetricCard
              value={poundsTrash}
              label="Pounds of Waste"
              microcopy="Packaging, products, everything discarded"
              icon={Trash2}
              color={SECTION_COLORS.waste}
              delay={0.2}
            />
            <MetricCard
              value={poundsPlastic}
              label="Pounds of Plastic"
              microcopy="Will outlast you by centuries"
              icon={Recycle}
              color="#f97316"
              delay={0.25}
            />
          </div>
        </div>
      </ImpactSubSection>

      {/* 4. ENERGY EQUIVALENT */}
      <ImpactSubSection
        title="Your Energy Story"
        subtitle="All that power, translated into meaning."
        delay={0.1}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            value={barrelsOil}
            label="Barrels of Oil"
            microcopy="Ancient sunlight, burned for you"
            icon={Droplets}
            color={SECTION_COLORS.energy}
            delay={0.1}
          />
          <MetricCard
            value={Math.round(solarPanelsNeeded)}
            label="Solar Panels Needed"
            microcopy="To power your life with sunshine"
            icon={Sun}
            color="#fbbf24"
            delay={0.15}
          />
          <MetricCard
            value={yearsHomeElectricity}
            label="Years of Home Power"
            microcopy="If all your energy lit one house"
            icon={Home}
            color="#a855f7"
            delay={0.2}
          />
        </div>
      </ImpactSubSection>

      {/* 5. HUMAN INTERACTIONS */}
      <ImpactSubSection
        title="The People in Your Life"
        subtitle="Connection is the invisible architecture of existence."
        delay={0.1}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            value={peopleMet}
            label="People You've Met"
            microcopy="Each one a universe you briefly touched"
            icon={Users}
            color={SECTION_COLORS.social}
            delay={0.1}
          />
          <MetricCard
            value={conversations}
            label="Conversations Had"
            microcopy="Moments of true presence"
            icon={MessageCircle}
            color="#f472b6"
            delay={0.15}
          />
          <MetricCard
            value={mealsShared}
            label="Meals Shared"
            microcopy="Breaking bread, building bonds"
            icon={Heart}
            color="#fb7185"
            delay={0.2}
          />
        </div>
      </ImpactSubSection>

      {/* 6. INFLUENCE RIPPLE */}
      <ImpactSubSection
        title="Your Ripple Effect"
        subtitle="You are more than what you consume. You are what you leave behind."
        delay={0.1}
      >
        {/* Ripple visualization */}
        <div className="relative mx-auto mb-8 flex h-[280px] w-full max-w-lg items-center justify-center">
          {/* Animated ripple circles */}
          {[1, 2, 3, 4].map((ring, i) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border"
              style={{
                width: `${60 + ring * 50}px`,
                height: `${60 + ring * 50}px`,
                borderColor: `rgba(20,184,166,${0.4 - i * 0.08})`,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: i * 0.15,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Center point */}
          <motion.div
            className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ 
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              boxShadow: '0 0 30px rgba(20,184,166,0.4)',
            }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <Sparkles size={24} className="text-white" />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            value={peopleInfluenced}
            label="Lives Touched"
            microcopy="People you've meaningfully affected"
            icon={Share2}
            color={SECTION_COLORS.influence}
            delay={0.1}
          />
          <MetricCard
            value={ideasShared}
            label="Ideas Shared"
            microcopy="Thoughts that became someone else's"
            icon={Sparkles}
            color="#22d3ee"
            delay={0.15}
          />
          <MetricCard
            value={Math.round(totalReach)}
            label="Extended Reach"
            microcopy="Your second-degree influence network"
            icon={Network}
            color="#818cf8"
            delay={0.2}
          />
        </div>
        
        {/* Philosophical closing */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-10 max-w-xl text-center text-[15px] italic leading-relaxed text-[#94a3b8]"
        >
          "A single life, properly examined, reveals the entire human story: 
          consumption and creation, connection and solitude, impact and legacy."
        </motion.p>
      </ImpactSubSection>
    </div>
  );
}
