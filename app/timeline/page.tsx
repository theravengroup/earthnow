"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  Telescope, FlaskConical, Globe2, Network, Factory, Satellite,
  Filter, X
} from "lucide-react";
import { UniversalNavbar } from "@/components/universal-navbar";
import { EventSharePopover } from "@/components/event-share-popover";

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ============================================
// TYPE DEFINITIONS
// ============================================
interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  era: string;
  category: string;
  type: "event" | "moment";
  location?: { lat: number; lng: number };
}

// Refined world map paths - accurate simplified silhouettes (equirectangular projection on 360x180 viewport)
// Coordinates: x = (longitude + 180), y = (90 - latitude)
const WORLD_MAP_PATHS = {
  // North America - recognizable Alaska, Canada, USA, Mexico shape
  northAmerica: "M 30 28 L 35 25 L 50 24 L 65 26 L 72 30 L 80 28 L 90 26 L 100 28 L 108 32 L 115 38 L 120 42 L 125 48 L 127 55 L 125 62 L 120 68 L 115 72 L 108 75 L 100 78 L 95 82 L 88 85 L 82 82 L 75 78 L 70 72 L 65 68 L 60 72 L 55 78 L 52 85 L 48 88 L 42 85 L 38 78 L 35 70 L 32 62 L 28 55 L 25 48 L 22 42 L 25 35 L 28 30 Z",
  // Central America and Caribbean connection
  centralAmerica: "M 82 82 L 88 85 L 92 90 L 95 95 L 92 100 L 88 102 L 82 100 L 78 95 L 80 90 Z",
  // South America - distinctive shape with Brazil bulge, Patagonia taper
  southAmerica: "M 92 100 L 98 98 L 105 100 L 112 105 L 118 112 L 120 120 L 118 130 L 115 140 L 110 150 L 105 158 L 98 165 L 92 170 L 88 175 L 85 168 L 82 158 L 80 148 L 78 138 L 80 128 L 82 118 L 85 110 L 88 105 Z",
  // Europe - detailed coastline including Iberia, Italy, Scandinavia hints
  europe: "M 168 32 L 175 30 L 182 32 L 188 30 L 195 32 L 200 35 L 205 38 L 208 42 L 205 48 L 200 52 L 195 55 L 190 58 L 185 56 L 180 58 L 175 62 L 170 60 L 168 55 L 165 50 L 162 45 L 165 40 L 168 35 Z",
  // British Isles
  britishIsles: "M 172 38 L 176 36 L 180 38 L 178 42 L 174 44 L 170 42 Z",
  // Scandinavia
  scandinavia: "M 185 22 L 192 20 L 198 22 L 202 28 L 200 35 L 195 38 L 190 35 L 186 30 L 184 26 Z",
  // Africa - accurate shape with horn, bulge, southern tip
  africa: "M 168 58 L 175 55 L 182 55 L 190 58 L 198 62 L 205 68 L 210 75 L 212 85 L 210 95 L 205 105 L 200 115 L 195 125 L 188 132 L 180 138 L 172 140 L 165 138 L 160 132 L 158 122 L 160 112 L 162 102 L 165 92 L 168 82 L 170 72 L 168 65 Z",
  // Madagascar
  madagascar: "M 218 120 L 222 118 L 225 122 L 224 130 L 220 135 L 216 132 L 215 125 Z",
  // Middle East / Arabian Peninsula
  middleEast: "M 210 55 L 218 52 L 225 55 L 230 60 L 232 68 L 228 75 L 222 78 L 215 75 L 210 70 L 208 62 Z",
  // Asia - massive landmass with India subcontinent, Southeast Asia, Siberia
  asia: "M 205 38 L 215 32 L 230 28 L 250 25 L 270 22 L 290 24 L 305 28 L 315 32 L 322 38 L 325 45 L 322 52 L 315 58 L 308 62 L 300 58 L 292 55 L 285 58 L 278 62 L 270 58 L 262 55 L 255 58 L 248 62 L 240 58 L 232 55 L 225 52 L 218 48 L 212 45 L 208 42 Z",
  // India subcontinent
  india: "M 245 62 L 255 60 L 262 65 L 265 75 L 262 85 L 255 92 L 248 88 L 245 80 L 242 72 L 244 66 Z",
  // Southeast Asia / Indochina
  southeastAsia: "M 275 68 L 285 65 L 292 70 L 295 78 L 292 85 L 285 88 L 278 85 L 275 78 L 276 72 Z",
  // Japan
  japan: "M 312 42 L 318 40 L 322 45 L 320 52 L 315 55 L 310 52 L 312 46 Z",
  // Indonesia / Maritime Southeast Asia
  indonesia: "M 280 92 L 288 90 L 298 92 L 308 95 L 315 100 L 310 105 L 300 102 L 290 100 L 282 98 L 278 95 Z",
  // Australia - distinctive shape with proper proportions
  australia: "M 292 115 L 305 112 L 318 115 L 328 122 L 332 132 L 328 142 L 320 150 L 308 155 L 295 152 L 285 145 L 282 135 L 285 125 L 290 118 Z",
  // New Zealand
  newZealand: "M 342 142 L 346 140 L 350 145 L 348 152 L 344 155 L 340 150 L 342 145 Z",
  // Greenland
  greenland: "M 118 15 L 128 12 L 140 15 L 148 20 L 150 28 L 145 35 L 138 38 L 128 38 L 120 35 L 115 28 L 116 20 Z",
};

// Convert lat/lng to x/y on 360x180 viewport (16:9 aspect uses this range)
function latLngToXY(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 360;
  const y = ((90 - lat) / 180) * 180;
  return { x, y };
}

// ============================================
// TIMELINE EVENTS DATASET (~300 milestones)
// ============================================
const timelineEvents: TimelineEvent[] = [
  // ============================================
  // ANCIENT WORLD (~40 milestones)
  // ============================================
  { year: "~10000 BCE", title: "Agricultural Revolution Begins", description: "Humans begin cultivating crops in the Fertile Crescent, fundamentally changing our relationship with the land.", era: "Ancient World", category: "Science", type: "event", location: { lat: 33.5, lng: 44.0 } },
  { year: "~9000 BCE", title: "Domestication of Sheep and Goats", description: "Early herding practices establish humanity's management of animal populations.", era: "Ancient World", category: "Science", type: "event", location: { lat: 37.0, lng: 43.0 } },
  { year: "~8000 BCE", title: "Rice Cultivation in China", description: "Independent agricultural development in Asia demonstrates parallel human innovation.", era: "Ancient World", category: "Science", type: "event", location: { lat: 30.0, lng: 120.0 } },
  { year: "~7000 BCE", title: "First Permanent Settlements", description: "Çatalhöyük and other proto-cities emerge as humans settle into agricultural communities.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 37.67, lng: 32.83 } },
  { year: "~6000 BCE", title: "Early Irrigation Systems", description: "Mesopotamian farmers develop irrigation canals, demonstrating early understanding of water systems.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 32.0, lng: 44.5 } },
  { year: "~5500 BCE", title: "Copper Smelting Begins", description: "First metal extraction from ore marks beginning of metallurgical transformation of landscapes.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 37.0, lng: 35.0 } },
  { year: "~5000 BCE", title: "Maize Domestication in Mesoamerica", description: "Independent agricultural development shapes civilizations of the Americas.", era: "Ancient World", category: "Science", type: "event", location: { lat: 17.0, lng: -96.0 } },
  { year: "~4500 BCE", title: "Wheel Invented", description: "Fundamental technology enables transportation and mechanical systems.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 33.0, lng: 44.0 } },
  { year: "~4000 BCE", title: "Bronze Age Begins", description: "Metallurgy advances human capability to shape the environment through tools and construction.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 32.0, lng: 44.0 } },
  { year: "~3500 BCE", title: "Writing Systems Emerge", description: "Cuneiform and hieroglyphics enable recording of observations about the natural world.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 31.0, lng: 46.0 } },
  { year: "~3100 BCE", title: "First Systematic Astronomical Records", description: "Egyptian astronomers begin tracking celestial cycles to predict Nile flooding.", era: "Ancient World", category: "Science", type: "event", location: { lat: 30.0, lng: 31.2 } },
  { year: "~3000 BCE", title: "Egyptian Calendar Developed", description: "Ancient Egyptians create a 365-day calendar based on astronomical observations of the Nile flooding cycle.", era: "Ancient World", category: "Science", type: "event", location: { lat: 30.0, lng: 31.2 } },
  { year: "~2700 BCE", title: "Great Pyramid Construction", description: "Massive engineering project demonstrates sophisticated understanding of mathematics and geology.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 29.98, lng: 31.13 } },
  { year: "~2500 BCE", title: "Indus Valley Sanitation Systems", description: "Harappan cities feature advanced water management and sewage systems.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 27.3, lng: 68.0 } },
  { year: "~2000 BCE", title: "Babylonian Astronomy", description: "Babylonians systematically record celestial movements, laying foundations for understanding Earth's place in the cosmos.", era: "Ancient World", category: "Science", type: "event", location: { lat: 32.5, lng: 44.4 } },
  { year: "~1500 BCE", title: "Iron Smelting Developed", description: "Iron Age technology further transforms human impact on landscapes and resources.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 40.0, lng: 35.0 } },
  { year: "~1200 BCE", title: "Phoenician Navigation", description: "Maritime expertise enables exploration and trade across Mediterranean, spreading knowledge.", era: "Ancient World", category: "Exploration", type: "event", location: { lat: 33.9, lng: 35.5 } },
  { year: "~800 BCE", title: "Vedic Astronomy in India", description: "Indian scholars develop sophisticated astronomical and mathematical knowledge.", era: "Ancient World", category: "Science", type: "event", location: { lat: 28.6, lng: 77.2 } },
  { year: "~600 BCE", title: "Thales Proposes Natural Explanations", description: "Greek philosopher Thales suggests natural rather than supernatural causes for phenomena, birth of natural philosophy.", era: "Ancient World", category: "Science", type: "event", location: { lat: 37.85, lng: 27.25 } },
  { year: "~550 BCE", title: "Anaximander's World Map", description: "First attempt to map the known world establishes geographic thinking.", era: "Ancient World", category: "Exploration", type: "event", location: { lat: 37.85, lng: 27.25 } },
  { year: "~500 BCE", title: "Pythagoras Proposes Spherical Earth", description: "Greek mathematicians argue Earth is spherical based on observations of ships disappearing over the horizon.", era: "Ancient World", category: "Science", type: "event", location: { lat: 37.7, lng: 26.9 } },
  { year: "~450 BCE", title: "Herodotus Documents Natural Wonders", description: "Father of history records geographic and environmental observations across known world.", era: "Ancient World", category: "Exploration", type: "event", location: { lat: 37.9, lng: 27.3 } },
  { year: "~400 BCE", title: "Hippocrates Links Health to Environment", description: "Greek physician connects human health to climate, water, and place.", era: "Ancient World", category: "Science", type: "event", location: { lat: 36.9, lng: 27.0 } },
  { year: "~350 BCE", title: "Aristotle's Natural Philosophy", description: "Aristotle systematically categorizes the natural world, influencing scientific thought for two millennia.", era: "Ancient World", category: "Science", type: "event", location: { lat: 38.0, lng: 23.7 } },
  { year: "~300 BCE", title: "Theophrastus Studies Plants", description: "First systematic botany establishes study of plant biology and ecology.", era: "Ancient World", category: "Science", type: "event", location: { lat: 38.0, lng: 23.7 } },
  { year: "~240 BCE", title: "Eratosthenes Measures Earth", description: "Greek scholar calculates Earth's circumference with remarkable accuracy using shadows and geometry.", era: "Ancient World", category: "Science", type: "moment", location: { lat: 31.2, lng: 29.9 } },
  { year: "~200 BCE", title: "Chinese Record Sunspots", description: "Earliest known systematic observations of solar activity.", era: "Ancient World", category: "Science", type: "event", location: { lat: 34.0, lng: 109.0 } },
  { year: "~150 BCE", title: "Hipparchus Star Catalog", description: "Greek astronomer creates detailed catalog of 850 stars, advancing understanding of the night sky.", era: "Ancient World", category: "Science", type: "event", location: { lat: 36.4, lng: 28.2 } },
  { year: "~100 BCE", title: "Antikythera Mechanism", description: "Ancient Greek analog computer tracks astronomical positions, demonstrating advanced technical knowledge.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 35.9, lng: 23.3 } },
  { year: "~50 BCE", title: "Roman Aqueduct Engineering", description: "Massive water infrastructure demonstrates understanding of hydraulics and terrain.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 41.9, lng: 12.5 } },
  { year: "~100 CE", title: "Hero of Alexandria's Steam Engine", description: "Early steam device demonstrates potential of harnessing heat energy, though not yet applied practically.", era: "Ancient World", category: "Technology", type: "event", location: { lat: 31.2, lng: 29.9 } },
  { year: "~150 CE", title: "Ptolemy's Almagest", description: "Comprehensive astronomical treatise models planetary motion, shaping cosmology for 1400 years.", era: "Ancient World", category: "Science", type: "event", location: { lat: 31.2, lng: 29.9 } },
  { year: "~300 CE", title: "Mayan Astronomical Observations", description: "Advanced calendar systems track Venus cycles and predict eclipses.", era: "Ancient World", category: "Science", type: "event", location: { lat: 20.7, lng: -88.6 } },
  { year: "~500 CE", title: "Aryabhata's Earth Rotation Theory", description: "Indian mathematician proposes that Earth rotates on its axis.", era: "Ancient World", category: "Science", type: "event", location: { lat: 25.3, lng: 83.0 } },
  { year: "~800", title: "Islamic Golden Age Science", description: "Baghdad's House of Wisdom preserves and advances Greek, Persian, and Indian scientific knowledge.", era: "Ancient World", category: "Science", type: "event", location: { lat: 33.3, lng: 44.4 } },
  { year: "~850", title: "Al-Khwarizmi's Algebra", description: "Mathematical foundations enable future scientific calculations and modeling.", era: "Ancient World", category: "Science", type: "event", location: { lat: 33.3, lng: 44.4 } },
  { year: "~1000", title: "Chinese Astronomical Records", description: "Song Dynasty astronomers document supernovae and comets with unprecedented precision.", era: "Ancient World", category: "Science", type: "event", location: { lat: 34.8, lng: 114.3 } },
  { year: "~1020", title: "Ibn al-Haytham's Optics", description: "Scientific method and experimental approach established centuries before European Renaissance.", era: "Ancient World", category: "Science", type: "event", location: { lat: 30.0, lng: 31.2 } },
  { year: "~1100", title: "Al-Idrisi World Map", description: "Arab geographer creates most accurate world map of the medieval period, synthesizing global knowledge.", era: "Ancient World", category: "Exploration", type: "event", location: { lat: 38.1, lng: 13.4 } },
  { year: "~1200", title: "Polynesian Navigation of Pacific", description: "Wayfinding expertise enables exploration and settlement across vast ocean distances.", era: "Ancient World", category: "Exploration", type: "event", location: { lat: -17.5, lng: -149.8 } },

  // ============================================
  // SCIENTIFIC REVOLUTION (~60 milestones)
  // ============================================
  { year: "1405", title: "Zheng He's Voyages Begin", description: "Chinese treasure fleets explore Indian Ocean, demonstrating global maritime capability.", era: "Scientific Revolution", category: "Exploration", type: "event", location: { lat: 32.0, lng: 118.8 } },
  { year: "1450", title: "Gutenberg Printing Press", description: "Movable type enables rapid spread of scientific knowledge across Europe.", era: "Scientific Revolution", category: "Technology", type: "event", location: { lat: 50.0, lng: 8.3 } },
  { year: "1473", title: "Copernicus Born", description: "Birth of astronomer who would revolutionize understanding of Earth's place in cosmos.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 53.0, lng: 18.6 } },
  { year: "1488", title: "Dias Rounds Cape of Good Hope", description: "European navigation reaches southern tip of Africa, opening route to Indian Ocean.", era: "Scientific Revolution", category: "Exploration", type: "event", location: { lat: -34.4, lng: 18.5 } },
  { year: "1492", title: "Columbus Reaches Americas", description: "European contact with the Americas begins unprecedented exchange of species, diseases, and knowledge.", era: "Scientific Revolution", category: "Exploration", type: "event", location: { lat: 24.0, lng: -74.5 } },
  { year: "1497", title: "Vasco da Gama Reaches India", description: "Sea route to Asia established, globalizing trade and knowledge exchange.", era: "Scientific Revolution", category: "Exploration", type: "event", location: { lat: 11.3, lng: 75.8 } },
  { year: "1507", title: "Waldseemüller World Map", description: "First map to name America, reflecting new global geographic knowledge.", era: "Scientific Revolution", category: "Exploration", type: "event", location: { lat: 48.2, lng: 7.0 } },
  { year: "1519", title: "Magellan Expedition Begins", description: "First circumnavigation of Earth proves global geography and ocean connectivity.", era: "Scientific Revolution", category: "Exploration", type: "event", location: { lat: 37.4, lng: -6.0 } },
  { year: "1530", title: "Paracelsus Advances Chemistry", description: "Foundation of modern chemistry and toxicology through systematic experimentation.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 47.8, lng: 13.0 } },
  { year: "1543", title: "Copernicus Heliocentric Model", description: "De Revolutionibus places the Sun at center of solar system, revolutionizing humanity's cosmic perspective.", era: "Scientific Revolution", category: "Science", type: "moment", location: { lat: 54.1, lng: 19.4 } },
  { year: "1543", title: "Vesalius Human Anatomy", description: "Detailed anatomical studies establish empirical approach to understanding living systems.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 51.2, lng: 4.4 } },
  { year: "1569", title: "Mercator Map Projection", description: "Navigation-friendly map projection transforms maritime exploration and global trade.", era: "Scientific Revolution", category: "Technology", type: "event", location: { lat: 51.2, lng: 4.4 } },
  { year: "1572", title: "Tycho's Supernova", description: "Observation of new star challenges notion of unchanging heavens.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 55.9, lng: 12.6 } },
  { year: "1582", title: "Gregorian Calendar Reform", description: "Improved calendar reflects refined understanding of Earth's orbital period.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 41.9, lng: 12.5 } },
  { year: "1590", title: "Compound Microscope Invented", description: "Opens window to microscopic world of cells and microorganisms.", era: "Scientific Revolution", category: "Technology", type: "event", location: { lat: 51.4, lng: 5.5 } },
  { year: "1600", title: "Gilbert's Magnetism Studies", description: "Earth described as giant magnet, advancing geophysical understanding.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1608", title: "Telescope Invented", description: "Dutch invention that would transform astronomical observation.", era: "Scientific Revolution", category: "Technology", type: "event", location: { lat: 51.4, lng: 5.5 } },
  { year: "1609", title: "Galileo's Telescope Observations", description: "First telescopic observations reveal moons of Jupiter and phases of Venus, confirming heliocentric model.", era: "Scientific Revolution", category: "Science", type: "moment", location: { lat: 43.8, lng: 11.3 } },
  { year: "1610", title: "Kepler's Laws of Planetary Motion", description: "Mathematical laws describe elliptical orbits, enabling precise prediction of planetary positions.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 49.0, lng: 14.5 } },
  { year: "1614", title: "Logarithms Invented", description: "Mathematical tool enables complex astronomical calculations.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 56.0, lng: -3.2 } },
  { year: "1620", title: "Bacon's Scientific Method", description: "Francis Bacon formalizes empirical approach to knowledge, foundation of modern scientific inquiry.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1628", title: "Harvey Describes Blood Circulation", description: "William Harvey demonstrates the circulatory system, advancing understanding of biological systems.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1637", title: "Descartes' Discourse on Method", description: "Philosophical framework for systematic scientific inquiry established.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 52.1, lng: 4.3 } },
  { year: "1643", title: "Torricelli Invents Barometer", description: "Instrument enables measurement of atmospheric pressure, foundation of meteorology.", era: "Scientific Revolution", category: "Technology", type: "event", location: { lat: 43.8, lng: 11.3 } },
  { year: "1654", title: "Pascal's Probability Theory", description: "Mathematics of chance enables future statistical analysis of climate data.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 48.9, lng: 2.3 } },
  { year: "1660", title: "Royal Society Founded", description: "Institutional support for systematic scientific inquiry established in England.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1661", title: "Boyle's Skeptical Chymist", description: "Foundation of modern chemistry through systematic experimentation.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 51.75, lng: -1.25 } },
  { year: "1665", title: "Hooke's Micrographia", description: "Robert Hooke's microscopy reveals cellular structure, opening window to life at smallest scales.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1668", title: "Reflecting Telescope Invented", description: "Newton's design improves astronomical observation capabilities.", era: "Scientific Revolution", category: "Technology", type: "event", location: { lat: 52.2, lng: 0.1 } },
  { year: "1669", title: "Steno's Geological Principles", description: "Foundations of stratigraphy establish reading Earth's history in rock layers.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 55.7, lng: 12.6 } },
  { year: "1675", title: "Greenwich Observatory Founded", description: "Institutional commitment to precise astronomical observation.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 51.48, lng: 0.0 } },
  { year: "1676", title: "Speed of Light Measured", description: "Rømer calculates finite speed of light from Jupiter moon observations.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 55.7, lng: 12.6 } },
  { year: "1683", title: "Van Leeuwenhoek Discovers Bacteria", description: "Microscopic life revealed, expanding understanding of biological world.", era: "Scientific Revolution", category: "Science", type: "event", location: { lat: 52.0, lng: 4.4 } },
  { year: "1687", title: "Newton's Principia Published", description: "Laws of motion and universal gravitation unify terrestrial and celestial mechanics.", era: "Scientific Revolution", category: "Science", type: "moment", location: { lat: 52.2, lng: 0.1 } },
  { year: "1698", title: "Savery's Steam Pump", description: "Early steam engine for mining demonstrates potential of heat engines.", era: "Scientific Revolution", category: "Technology", type: "event" },
  { year: "1700", title: "Leibniz Founds Berlin Academy", description: "German scientific institution advances systematic research.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1712", title: "Newcomen Steam Engine", description: "Practical steam engine begins transformation of energy use in mining.", era: "Scientific Revolution", category: "Technology", type: "event" },
  { year: "1714", title: "Fahrenheit Thermometer", description: "Standardized temperature measurement enables systematic climate observation.", era: "Scientific Revolution", category: "Technology", type: "event" },
  { year: "1735", title: "Linnaeus Classification System", description: "Systema Naturae establishes binomial nomenclature, organizing all known life forms.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1742", title: "Celsius Temperature Scale", description: "Alternative temperature scale adopted for scientific work.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1747", title: "Franklin's Electricity Experiments", description: "Systematic study of electrical phenomena begins.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1752", title: "Franklin's Lightning Experiment", description: "Benjamin Franklin proves lightning is electrical, demonstrating atmospheric electricity.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1755", title: "Lisbon Earthquake Studied", description: "Scientific analysis of natural disaster advances seismological understanding.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1761", title: "Transit of Venus Observed", description: "International scientific cooperation to measure solar system distances.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1766", title: "Hydrogen Discovered", description: "Cavendish isolates lightest element, advancing chemistry.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1770", title: "Cook Charts Pacific", description: "Captain Cook's voyages map vast Pacific regions, completing European knowledge of global geography.", era: "Scientific Revolution", category: "Exploration", type: "event" },
  { year: "1774", title: "Oxygen Discovered", description: "Priestley and Scheele isolate oxygen, enabling understanding of combustion and respiration.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1779", title: "Photosynthesis Discovered", description: "Ingenhousz demonstrates plants produce oxygen in sunlight.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1783", title: "First Hot Air Balloon Flight", description: "Human flight achieved, demonstrating atmospheric buoyancy.", era: "Scientific Revolution", category: "Technology", type: "event" },
  { year: "1785", title: "Hutton's Theory of Earth", description: "James Hutton proposes deep geological time, Earth shaped by gradual processes over millions of years.", era: "Scientific Revolution", category: "Science", type: "moment" },
  { year: "1787", title: "Lavoisier's Chemical Nomenclature", description: "Systematic naming of chemical elements transforms chemistry.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1789", title: "Lavoisier's Conservation of Mass", description: "Fundamental principle that matter is neither created nor destroyed.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1791", title: "Metric System Proposed", description: "Standardized measurement system enables global scientific collaboration.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1796", title: "Jenner's Smallpox Vaccine", description: "First vaccine demonstrates systematic approach to disease prevention.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1798", title: "Malthus Population Theory", description: "Essay on population growth and resource limits introduces key concepts of environmental carrying capacity.", era: "Scientific Revolution", category: "Science", type: "event" },
  { year: "1799", title: "Humboldt's Scientific Exploration", description: "Alexander von Humboldt begins systematic study of South American ecosystems.", era: "Scientific Revolution", category: "Exploration", type: "event" },

  // ============================================
  // INDUSTRIAL ERA (~70 milestones)
  // ============================================
  { year: "1769", title: "Watt's Steam Engine", description: "James Watt's improved steam engine launches the Industrial Revolution, beginning fossil fuel dependence.", era: "Industrial Era", category: "Technology", type: "moment", location: { lat: 55.9, lng: -4.3 } },
  { year: "1800", title: "Volta Invents Battery", description: "First electric battery enables study of electricity and eventual electrification of society.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 45.8, lng: 9.1 } },
  { year: "1801", title: "First Asteroid Discovered", description: "Ceres discovered, expanding knowledge of solar system.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 38.1, lng: 13.4 } },
  { year: "1802", title: "Dalton's Atomic Theory", description: "Modern atomic theory established, foundation for chemistry.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 53.5, lng: -2.2 } },
  { year: "1804", title: "First Steam Locomotive", description: "Richard Trevithick's locomotive begins transformation of land transportation and coal consumption.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 51.8, lng: -3.4 } },
  { year: "1807", title: "First Steamboat Service", description: "Fulton's Clermont begins commercial steam navigation.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 40.7, lng: -74.0 } },
  { year: "1811", title: "Avogadro's Molecular Hypothesis", description: "Foundation for understanding gas behavior and atmospheric composition.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 45.1, lng: 7.7 } },
  { year: "1815", title: "Tambora Eruption", description: "Massive volcanic eruption causes global climate effects, demonstrating atmospheric connectivity.", era: "Industrial Era", category: "Environment", type: "event", location: { lat: -8.2, lng: 118.0 } },
  { year: "1820", title: "Electromagnetism Discovered", description: "Ørsted links electricity and magnetism, foundation for electrical technology.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 55.7, lng: 12.6 } },
  { year: "1824", title: "Fourier Describes Greenhouse Effect", description: "Joseph Fourier first describes how atmosphere traps heat, foundational to climate science.", era: "Industrial Era", category: "Science", type: "moment", location: { lat: 48.9, lng: 2.3 } },
  { year: "1825", title: "First Public Railway", description: "Stockton and Darlington Railway begins passenger rail era.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 54.6, lng: -1.3 } },
  { year: "1827", title: "Ohm's Law", description: "Mathematical relationship for electrical circuits enables electrical engineering.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 48.1, lng: 11.6 } },
  { year: "1830", title: "Lyell's Principles of Geology", description: "Uniformitarianism establishes Earth's long history shaped by ongoing processes.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1831", title: "Faraday's Electromagnetic Induction", description: "Discovery enables electric generators and motors, foundation of electrical power systems.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1833", title: "First Factory Act", description: "Early environmental and labor regulation in response to industrialization.", era: "Industrial Era", category: "Global Cooperation", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1835", title: "Coriolis Effect Described", description: "Rotation's effect on atmospheric and oceanic circulation explained.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 48.9, lng: 2.3 } },
  { year: "1837", title: "Electric Telegraph", description: "Morse's telegraph enables instant long-distance communication.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 40.7, lng: -74.0 } },
  { year: "1838", title: "First Transatlantic Steamship", description: "SS Great Western crosses Atlantic under steam power, shrinking global distances.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 51.5, lng: -2.6 } },
  { year: "1840", title: "Agassiz Proposes Ice Ages", description: "Evidence for past glaciations demonstrates major climate changes in Earth's history.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 46.9, lng: 6.9 } },
  { year: "1842", title: "First Fertilizer Factory", description: "Industrial production of fertilizers begins transformation of agricultural productivity.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1845", title: "Irish Potato Famine", description: "Crop failure demonstrates vulnerability of agricultural systems.", era: "Industrial Era", category: "Environment", type: "event", location: { lat: 53.3, lng: -6.3 } },
  { year: "1846", title: "Neptune Discovered", description: "Mathematical prediction of planet demonstrates power of physical laws.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 52.5, lng: 13.4 } },
  { year: "1848", title: "First Law of Thermodynamics", description: "Conservation of energy established, fundamental to understanding Earth systems.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 48.1, lng: 11.6 } },
  { year: "1850", title: "Clausius Formulates Second Law", description: "Entropy and heat flow principles established.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 52.5, lng: 13.4 } },
  { year: "1854", title: "Snow Maps Cholera Outbreak", description: "Epidemiological mapping demonstrates environmental health connections.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1856", title: "Eunice Foote's CO₂ Discovery", description: "American scientist demonstrates that CO₂ absorbs heat, first experimental proof of greenhouse gases.", era: "Industrial Era", category: "Science", type: "moment", location: { lat: 40.7, lng: -74.0 } },
  { year: "1858", title: "First Transatlantic Cable", description: "Submarine telegraph connects continents electronically.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 51.9, lng: -10.3 } },
  { year: "1859", title: "Darwin's Origin of Species", description: "Theory of evolution reveals interconnectedness of all life and deep time of biological change.", era: "Industrial Era", category: "Science", type: "moment", location: { lat: 51.5, lng: -0.1 } },
  { year: "1859", title: "First Commercial Oil Well", description: "Drake's well in Pennsylvania begins the petroleum era and fossil fuel economy.", era: "Industrial Era", category: "Energy", type: "event", location: { lat: 41.6, lng: -79.7 } },
  { year: "1861", title: "Tyndall Measures Greenhouse Gases", description: "John Tyndall quantifies heat absorption by CO₂ and water vapor, advancing climate physics.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1863", title: "First Underground Railway", description: "London's Metropolitan Railway begins underground mass transit.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 51.5, lng: -0.1 } },
  { year: "1865", title: "Mendel's Genetic Laws", description: "Foundation of genetics established through systematic plant experiments.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 49.2, lng: 16.6 } },
  { year: "1866", title: "Transatlantic Cable Successful", description: "Permanent communication link between continents established.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 51.9, lng: -10.3 } },
  { year: "1869", title: "Periodic Table Published", description: "Mendeleev organizes elements, enabling prediction of new materials.", era: "Industrial Era", category: "Science", type: "event", location: { lat: 59.9, lng: 30.3 } },
  { year: "1869", title: "Transcontinental Railroad Completed", description: "Rail networks connect continents, accelerating resource extraction and habitat fragmentation.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 41.0, lng: -112.0 } },
  { year: "1869", title: "Suez Canal Opens", description: "Massive engineering project transforms global shipping and ecosystems.", era: "Industrial Era", category: "Technology", type: "event", location: { lat: 30.5, lng: 32.3 } },
  { year: "1872", title: "Yellowstone National Park", description: "First national park establishes conservation of natural areas.", era: "Industrial Era", category: "Environment", type: "event", location: { lat: 44.4, lng: -110.6 } },
  { year: "1872", title: "Challenger Expedition Begins", description: "First systematic oceanographic research voyage.", era: "Industrial Era", category: "Exploration", type: "event", location: { lat: 50.9, lng: -1.4 } },
  { year: "1876", title: "Bell Invents Telephone", description: "Instant long-distance communication begins shrinking the world.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1879", title: "Edison's Light Bulb", description: "Practical electric lighting drives demand for power generation infrastructure.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1882", title: "First Electric Power Station", description: "Edison's Pearl Street Station begins electrification of cities.", era: "Industrial Era", category: "Energy", type: "event" },
  { year: "1883", title: "Krakatoa Eruption Studied", description: "Global effects of volcanic eruption demonstrate interconnected atmospheric systems.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1884", title: "Prime Meridian Established", description: "International agreement on global time zones and coordinates.", era: "Industrial Era", category: "Global Cooperation", type: "event" },
  { year: "1885", title: "First Automobile", description: "Benz Patent-Motorwagen begins personal transportation revolution and petroleum demand.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1887", title: "Hertz Discovers Radio Waves", description: "Foundation for wireless communication and remote sensing.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1888", title: "Nikola Tesla's AC Motor", description: "Alternating current enables long-distance power transmission.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1892", title: "Sierra Club Founded", description: "Environmental advocacy organization established in United States.", era: "Industrial Era", category: "Environment", type: "event" },
  { year: "1895", title: "X-rays Discovered", description: "Röntgen's discovery enables seeing inside materials and bodies.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1896", title: "Arrhenius Climate Calculations", description: "Svante Arrhenius calculates that doubling CO₂ would raise global temperature by 5-6°C.", era: "Industrial Era", category: "Science", type: "moment" },
  { year: "1896", title: "Radioactivity Discovered", description: "Becquerel discovers radioactive decay, opening new understanding of Earth's heat.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1898", title: "Radium Discovered", description: "Marie Curie's discovery opens atomic age and understanding of radioactive Earth processes.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1901", title: "First Transatlantic Radio Signal", description: "Marconi demonstrates wireless communication across ocean.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1903", title: "Wright Brothers Flight", description: "Powered flight achieved, eventually enabling global transportation and satellite deployment.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1905", title: "Einstein's Special Relativity", description: "New understanding of space, time, and energy.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1906", title: "San Francisco Earthquake Studied", description: "Scientific analysis advances seismology and understanding of plate tectonics.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1908", title: "Haber-Bosch Process", description: "Industrial nitrogen fixation enables synthetic fertilizers, transforming agriculture and nitrogen cycle.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1909", title: "Mohorovičić Discovers Earth's Crust", description: "Seismic studies reveal Earth's layered structure.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1911", title: "Rutherford's Atomic Model", description: "Nuclear structure of atoms discovered.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1912", title: "Wegener's Continental Drift", description: "Proposal that continents move, later confirmed as plate tectonics.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1913", title: "Ford Assembly Line", description: "Mass production techniques accelerate industrialization and resource consumption.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1914", title: "Panama Canal Opens", description: "Engineering feat connects oceans, transforming global shipping.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1920", title: "First Commercial Radio", description: "Mass media begins connecting global populations with shared information.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1922", title: "BBC Founded", description: "Broadcasting enables mass communication of information including weather.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1926", title: "First Liquid-Fuel Rocket", description: "Goddard's rocket demonstrates technology for future space exploration.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1928", title: "Penicillin Discovered", description: "Antibiotics transform human health and population dynamics.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1930", title: "Pluto Discovered", description: "Extent of solar system expanded (later reclassified as dwarf planet).", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1935", title: "Richter Scale Developed", description: "Standardized measurement of earthquake magnitude.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1938", title: "Callendar Links CO₂ to Warming", description: "Guy Callendar demonstrates correlation between rising CO₂ and temperature records.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1938", title: "Nuclear Fission Discovered", description: "Energy release from splitting atoms opens nuclear age.", era: "Industrial Era", category: "Science", type: "event" },
  { year: "1939", title: "DDT's Insecticidal Properties", description: "Synthetic pesticide development begins era of chemical pest control.", era: "Industrial Era", category: "Technology", type: "event" },
  { year: "1942", title: "First Nuclear Reactor", description: "Chicago Pile-1 achieves sustained nuclear chain reaction.", era: "Industrial Era", category: "Energy", type: "event" },

  // ============================================
  // SPACE AGE (~60 milestones)
  // ============================================
  { year: "1945", title: "Atomic Age Begins", description: "Nuclear weapons demonstrate humanity's power to alter the planet at geological scales.", era: "Space Age", category: "Technology", type: "moment", location: { lat: 33.7, lng: -106.5 } },
  { year: "1946", title: "First Electronic Computer", description: "ENIAC enables complex calculations, foundation for climate modeling and data analysis.", era: "Space Age", category: "Technology", type: "event", location: { lat: 39.9, lng: -75.2 } },
  { year: "1946", title: "First Rocket Photo of Earth", description: "V-2 rocket captures image of Earth from 65 miles altitude.", era: "Space Age", category: "Exploration", type: "event", location: { lat: 32.4, lng: -106.5 } },
  { year: "1947", title: "Radiocarbon Dating Developed", description: "Libby's technique enables precise dating of organic materials and climate records.", era: "Space Age", category: "Science", type: "event", location: { lat: 41.9, lng: -87.6 } },
  { year: "1948", title: "Transistor Invented", description: "Semiconductor device enables modern electronics and computing.", era: "Space Age", category: "Technology", type: "event", location: { lat: 40.7, lng: -74.4 } },
  { year: "1950", title: "World Population Reaches 2.5 Billion", description: "Post-war population boom accelerates resource consumption.", era: "Space Age", category: "Environment", type: "event" },
  { year: "1952", title: "First Hydrogen Bomb", description: "Thermonuclear weapons increase human capacity for planetary-scale destruction.", era: "Space Age", category: "Technology", type: "event", location: { lat: 11.5, lng: 162.3 } },
  { year: "1953", title: "DNA Structure Discovered", description: "Watson and Crick reveal molecular basis of heredity.", era: "Space Age", category: "Science", type: "event", location: { lat: 52.2, lng: 0.1 } },
  { year: "1954", title: "First Nuclear Power Plant", description: "Obninsk reactor begins civilian nuclear energy era.", era: "Space Age", category: "Energy", type: "event", location: { lat: 55.1, lng: 36.6 } },
  { year: "1956", title: "First Transatlantic Telephone Cable", description: "TAT-1 enables reliable intercontinental voice communication.", era: "Space Age", category: "Technology", type: "event", location: { lat: 51.9, lng: -10.3 } },
  { year: "1957", title: "Sputnik Launched", description: "First artificial satellite begins space age and enables Earth observation from orbit.", era: "Space Age", category: "Exploration", type: "moment", location: { lat: 45.6, lng: 63.3 } },
  { year: "1957", title: "International Geophysical Year", description: "Global scientific cooperation studies Earth systems from poles to space.", era: "Space Age", category: "Global Cooperation", type: "event" },
  { year: "1958", title: "Keeling Curve Begins", description: "Charles Keeling begins continuous CO₂ measurements at Mauna Loa, creating iconic climate record.", era: "Space Age", category: "Science", type: "moment", location: { lat: 19.5, lng: -155.6 } },
  { year: "1958", title: "NASA Established", description: "U.S. space agency created, accelerating Earth observation capabilities.", era: "Space Age", category: "Exploration", type: "event", location: { lat: 38.9, lng: -77.0 } },
  { year: "1959", title: "Antarctic Treaty Signed", description: "International agreement protects Antarctica for science and peace.", era: "Space Age", category: "Global Cooperation", type: "event", location: { lat: 38.9, lng: -77.0 } },
  { year: "1960", title: "First Weather Satellite", description: "TIROS-1 provides first satellite weather images, revolutionizing meteorology.", era: "Space Age", category: "Technology", type: "event", location: { lat: 28.5, lng: -80.6 } },
  { year: "1960", title: "Deepest Ocean Dive", description: "Trieste reaches Mariana Trench floor, exploring deepest point on Earth.", era: "Space Age", category: "Exploration", type: "event", location: { lat: 11.3, lng: 142.2 } },
  { year: "1961", title: "Gagarin Orbits Earth", description: "First human in space sees Earth from above, beginning era of human spaceflight.", era: "Space Age", category: "Exploration", type: "event", location: { lat: 45.6, lng: 63.3 } },
  { year: "1962", title: "Silent Spring Published", description: "Rachel Carson's book awakens public consciousness to environmental impacts of human activity.", era: "Space Age", category: "Environment", type: "moment", location: { lat: 38.9, lng: -77.0 } },
  { year: "1963", title: "Nuclear Test Ban Treaty", description: "International agreement limits atmospheric nuclear testing.", era: "Space Age", category: "Global Cooperation", type: "event", location: { lat: 55.75, lng: 37.6 } },
  { year: "1964", title: "Cosmic Microwave Background Detected", description: "Evidence of Big Bang expands understanding of cosmic context.", era: "Space Age", category: "Science", type: "event", location: { lat: 40.7, lng: -74.4 } },
  { year: "1965", title: "First Climate Warning to President", description: "Scientific advisory committee warns President Johnson about CO₂ and climate change.", era: "Space Age", category: "Science", type: "event", location: { lat: 38.9, lng: -77.0 } },
  { year: "1966", title: "First Lunar Soft Landing", description: "Luna 9 transmits images from Moon's surface.", era: "Space Age", category: "Exploration", type: "event", location: { lat: 45.6, lng: 63.3 } },
  { year: "1967", title: "Outer Space Treaty", description: "International agreement establishes space as global commons, model for environmental cooperation.", era: "Space Age", category: "Global Cooperation", type: "event", location: { lat: 40.8, lng: -74.0 } },
  { year: "1967", title: "Plate Tectonics Theory Confirmed", description: "Continental drift mechanism explained through seafloor spreading.", era: "Space Age", category: "Science", type: "event", location: { lat: 52.2, lng: 0.1 } },
  { year: "1968", title: "Earthrise Photograph", description: "Apollo 8 astronauts capture Earth rising over Moon's horizon, transforming humanity's self-perception.", era: "Space Age", category: "Exploration", type: "moment", location: { lat: 29.6, lng: -95.1 } },
  { year: "1969", title: "Moon Landing", description: "Apollo 11 achieves human presence on another world, demonstrating technological capability.", era: "Space Age", category: "Exploration", type: "event", location: { lat: 29.6, lng: -95.1 } },
  { year: "1969", title: "ARPANET Created", description: "Precursor to internet enables networked computing and data sharing.", era: "Space Age", category: "Technology", type: "event", location: { lat: 34.1, lng: -118.2 } },
  { year: "1970", title: "First Earth Day", description: "20 million Americans participate in environmental demonstrations, launching modern environmental movement.", era: "Space Age", category: "Environment", type: "moment", location: { lat: 38.9, lng: -77.0 } },
  { year: "1970", title: "EPA Established", description: "United States creates Environmental Protection Agency, institutionalizing environmental governance.", era: "Space Age", category: "Global Cooperation", type: "event", location: { lat: 38.9, lng: -77.0 } },
  { year: "1970", title: "Clean Air Act Extended", description: "Major air pollution regulation in United States.", era: "Space Age", category: "Environment", type: "event", location: { lat: 38.9, lng: -77.0 } },
  { year: "1971", title: "First Microprocessor", description: "Intel 4004 begins computing revolution enabling real-time data processing.", era: "Space Age", category: "Technology", type: "event", location: { lat: 37.4, lng: -122.1 } },
  { year: "1971", title: "Greenpeace Founded", description: "Environmental activism organization established.", era: "Space Age", category: "Environment", type: "event", location: { lat: 49.3, lng: -123.1 } },
  { year: "1972", title: "Blue Marble Photograph", description: "Apollo 17 captures first full-Earth image, iconic symbol of planetary fragility.", era: "Space Age", category: "Exploration", type: "moment", location: { lat: 29.6, lng: -95.1 } },
  { year: "1972", title: "Limits to Growth Published", description: "Club of Rome report models resource depletion and population growth scenarios.", era: "Space Age", category: "Science", type: "event", location: { lat: 41.9, lng: 12.5 } },
  { year: "1972", title: "UN Environment Programme Created", description: "UNEP established as first UN body focused on global environmental coordination.", era: "Space Age", category: "Global Cooperation", type: "event", location: { lat: 46.2, lng: 6.1 } },
  { year: "1972", title: "First Landsat Satellite", description: "Begins continuous satellite imaging of Earth's surface.", era: "Space Age", category: "Technology", type: "event", location: { lat: 28.5, lng: -80.6 } },
  { year: "1973", title: "Oil Crisis", description: "OPEC embargo reveals vulnerability of fossil fuel-dependent economies.", era: "Space Age", category: "Energy", type: "event", location: { lat: 25.3, lng: 51.5 } },
  { year: "1973", title: "Endangered Species Act", description: "U.S. law protects threatened wildlife and habitats.", era: "Space Age", category: "Environment", type: "event", location: { lat: 38.9, lng: -77.0 } },
  { year: "1974", title: "Ozone Depletion Discovery", description: "Rowland and Molina identify CFCs destroying ozone layer, demonstrating global atmospheric impacts.", era: "Space Age", category: "Science", type: "event", location: { lat: 33.6, lng: -117.8 } },
  { year: "1975", title: "First Personal Computer", description: "Altair 8800 launches personal computing era, democratizing information technology.", era: "Space Age", category: "Technology", type: "event", location: { lat: 35.1, lng: -106.6 } },
  { year: "1975", title: "CITES Treaty", description: "International agreement to protect endangered species from trade.", era: "Space Age", category: "Global Cooperation", type: "event", location: { lat: 38.9, lng: -77.0 } },
  { year: "1976", title: "Viking Lands on Mars", description: "First successful Mars landing searches for life on another planet.", era: "Space Age", category: "Exploration", type: "event", location: { lat: 34.2, lng: -118.2 } },
  { year: "1977", title: "Deep Sea Vents Discovered", description: "Hydrothermal vents reveal life independent of sunlight.", era: "Space Age", category: "Exploration", type: "event", location: { lat: 0.8, lng: -86.1 } },
  { year: "1978", title: "First GPS Satellite", description: "NAVSTAR GPS begins global positioning system enabling precise Earth monitoring.", era: "Space Age", category: "Technology", type: "event", location: { lat: 28.5, lng: -80.6 } },
  { year: "1979", title: "First World Climate Conference", description: "Scientists gather to assess climate change, calling for international action.", era: "Space Age", category: "Global Cooperation", type: "event", location: { lat: 46.2, lng: 6.1 } },
  { year: "1979", title: "Three Mile Island Accident", description: "Nuclear incident raises questions about energy choices.", era: "Space Age", category: "Energy", type: "event", location: { lat: 40.2, lng: -76.7 } },
  { year: "1980", title: "Mount St. Helens Eruption", description: "Studied volcanic event advances understanding of eruption impacts.", era: "Space Age", category: "Science", type: "event", location: { lat: 46.2, lng: -122.2 } },
  { year: "1980", title: "World Conservation Strategy", description: "IUCN establishes framework for sustainable development.", era: "Space Age", category: "Global Cooperation", type: "event" },
  { year: "1981", title: "First Space Shuttle", description: "Reusable spacecraft begins new era of space access.", era: "Space Age", category: "Technology", type: "event" },
  { year: "1982", title: "UN Convention on Law of the Sea", description: "International framework for ocean governance.", era: "Space Age", category: "Global Cooperation", type: "event" },
  { year: "1983", title: "Internet Protocol Standardized", description: "TCP/IP enables global computer networking, foundation for real-time data sharing.", era: "Space Age", category: "Technology", type: "event" },
  { year: "1984", title: "Bhopal Industrial Disaster", description: "Chemical accident kills thousands, highlighting industrial hazards.", era: "Space Age", category: "Environment", type: "event" },
  { year: "1985", title: "Antarctic Ozone Hole Discovered", description: "British scientists detect massive ozone depletion over Antarctica, galvanizing global action.", era: "Space Age", category: "Science", type: "moment" },
  { year: "1986", title: "Chernobyl Nuclear Disaster", description: "Worst nuclear accident spreads contamination across Europe.", era: "Space Age", category: "Environment", type: "event" },
  { year: "1987", title: "Montreal Protocol Signed", description: "Global agreement to phase out ozone-depleting substances, first successful planetary-scale environmental treaty.", era: "Space Age", category: "Global Cooperation", type: "moment" },
  { year: "1987", title: "Brundtland Report", description: "UN commission defines sustainable development as meeting present needs without compromising future generations.", era: "Space Age", category: "Global Cooperation", type: "event" },
  { year: "1988", title: "IPCC Established", description: "Intergovernmental Panel on Climate Change created to synthesize climate science for policymakers.", era: "Space Age", category: "Global Cooperation", type: "moment" },
  { year: "1988", title: "Hansen Testifies to Congress", description: "NASA scientist James Hansen declares human-caused global warming has begun.", era: "Space Age", category: "Science", type: "event" },
  { year: "1989", title: "Exxon Valdez Oil Spill", description: "Major oil spill in Alaska highlights environmental risks of fossil fuel transport.", era: "Space Age", category: "Environment", type: "event" },

  // ============================================
  // PLANETARY AWARENESS (~40 milestones)
  // ============================================
  { year: "1990", title: "Hubble Space Telescope", description: "Space telescope reveals universe's scale, deepening perspective on Earth's cosmic context.", era: "Planetary Awareness", category: "Exploration", type: "event" },
  { year: "1990", title: "First IPCC Report", description: "Scientific consensus establishes that human activities are increasing greenhouse gases.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "1990", title: "World Wide Web Invented", description: "Tim Berners-Lee creates WWW, enabling global information sharing.", era: "Planetary Awareness", category: "Technology", type: "event" },
  { year: "1990", title: "Pale Blue Dot Photograph", description: "Voyager 1 captures Earth from 6 billion kilometers, showing our planet as a tiny speck.", era: "Planetary Awareness", category: "Exploration", type: "event" },
  { year: "1991", title: "Mount Pinatubo Eruption", description: "Volcanic aerosols temporarily cool global climate, demonstrating atmospheric sensitivity.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "1992", title: "Rio Earth Summit", description: "UN Conference on Environment and Development produces Framework Convention on Climate Change.", era: "Planetary Awareness", category: "Global Cooperation", type: "moment" },
  { year: "1992", title: "CBD Convention on Biodiversity", description: "International agreement for conservation and sustainable use of biodiversity.", era: "Planetary Awareness", category: "Global Cooperation", type: "event" },
  { year: "1994", title: "Deep Ocean Exploration", description: "ALVIN and other submersibles reveal deep sea ecosystems.", era: "Planetary Awareness", category: "Exploration", type: "event" },
  { year: "1995", title: "First Exoplanet Confirmed", description: "51 Pegasi b discovery opens search for Earth-like worlds.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "1995", title: "Second IPCC Report", description: "Discernible human influence on global climate confirmed.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "1997", title: "Kyoto Protocol", description: "First binding international agreement to reduce greenhouse gas emissions.", era: "Planetary Awareness", category: "Global Cooperation", type: "event" },
  { year: "1998", title: "Google Founded", description: "Search engine democratizes access to global information and environmental data.", era: "Planetary Awareness", category: "Technology", type: "event" },
  { year: "1998", title: "Hottest Year to Date", description: "1998 sets temperature record influenced by strong El Niño.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "1999", title: "First Climate Prediction Models", description: "Coupled atmosphere-ocean models enable regional climate projections.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "2000", title: "Millennium Ecosystem Assessment Begins", description: "Comprehensive assessment of Earth's ecosystems and services they provide to humanity.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "2001", title: "Third IPCC Report", description: "New and stronger evidence that most warming is due to human activities.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "2001", title: "Wikipedia Launched", description: "Collaborative knowledge platform demonstrates power of global information sharing.", era: "Planetary Awareness", category: "Technology", type: "event" },
  { year: "2002", title: "Larsen B Ice Shelf Collapses", description: "Massive Antarctic ice shelf breaks apart, demonstrating warming impacts.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2003", title: "European Heat Wave", description: "Tens of thousands die in unprecedented heat, showing climate risks.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2004", title: "Indian Ocean Tsunami", description: "Devastating tsunami reveals need for global early warning systems and disaster preparedness.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2004", title: "Spirit and Opportunity on Mars", description: "Mars rovers begin extended exploration of another world.", era: "Planetary Awareness", category: "Exploration", type: "event" },
  { year: "2005", title: "Hurricane Katrina", description: "Catastrophic hurricane demonstrates vulnerability of coastal populations to extreme weather.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2005", title: "Kyoto Protocol Enters Force", description: "International climate treaty becomes legally binding.", era: "Planetary Awareness", category: "Global Cooperation", type: "event" },
  { year: "2006", title: "An Inconvenient Truth", description: "Documentary brings climate science to mass audience, shifting public discourse.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2006", title: "Stern Review Published", description: "Economic analysis shows costs of inaction on climate change.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "2007", title: "IPCC Shares Nobel Peace Prize", description: "Climate scientists recognized for establishing scientific consensus on human-caused warming.", era: "Planetary Awareness", category: "Global Cooperation", type: "event" },
  { year: "2007", title: "Fourth IPCC Report", description: "Warming is unequivocal, human contribution very likely.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "2007", title: "iPhone Launched", description: "Smartphones begin putting real-time global data in billions of pockets.", era: "Planetary Awareness", category: "Technology", type: "event" },
  { year: "2008", title: "Global Financial Crisis", description: "Economic disruption temporarily reduces emissions, showing economic-climate links.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2009", title: "Planetary Boundaries Framework", description: "Scientists define nine boundaries for safe operating space of human civilization.", era: "Planetary Awareness", category: "Science", type: "moment" },
  { year: "2009", title: "Copenhagen Climate Summit", description: "World leaders attempt comprehensive climate agreement, highlighting global cooperation challenges.", era: "Planetary Awareness", category: "Global Cooperation", type: "event" },
  { year: "2010", title: "Deepwater Horizon Spill", description: "Largest marine oil spill in history highlights fossil fuel risks.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2011", title: "World Population Reaches 7 Billion", description: "Human population continues rapid growth, increasing resource demands.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2011", title: "Fukushima Nuclear Disaster", description: "Tsunami causes nuclear meltdowns in Japan.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2012", title: "Arctic Sea Ice Record Low", description: "Summer sea ice reaches smallest extent in satellite record, visible sign of warming.", era: "Planetary Awareness", category: "Environment", type: "event" },
  { year: "2013", title: "CO₂ Passes 400 ppm", description: "Atmospheric CO₂ exceeds 400 parts per million for first time in human history.", era: "Planetary Awareness", category: "Environment", type: "moment" },
  { year: "2013", title: "Fifth IPCC Report", description: "Human influence on climate system extremely likely.", era: "Planetary Awareness", category: "Science", type: "event" },
  { year: "2014", title: "Rosetta Comet Mission", description: "ESA lands on comet, demonstrating precision monitoring capabilities in space.", era: "Planetary Awareness", category: "Exploration", type: "event" },

  // ============================================
  // DIGITAL PLANET (~30 milestones)
  // ============================================
  { year: "2015", title: "Paris Climate Agreement", description: "195 nations commit to limiting warming to 1.5-2°C, most comprehensive climate accord.", era: "Digital Planet", category: "Global Cooperation", type: "moment" },
  { year: "2015", title: "UN Sustainable Development Goals", description: "17 goals establish framework for global development balancing people, planet, prosperity.", era: "Digital Planet", category: "Global Cooperation", type: "event" },
  { year: "2015", title: "New Horizons Reaches Pluto", description: "First close-up images of distant dwarf planet.", era: "Digital Planet", category: "Exploration", type: "event" },
  { year: "2016", title: "Hottest Year on Record", description: "Global temperature sets new record, part of accelerating warming trend.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2016", title: "Paris Agreement Enters Force", description: "Climate treaty becomes legally binding in record time.", era: "Digital Planet", category: "Global Cooperation", type: "event" },
  { year: "2016", title: "Great Barrier Reef Bleaching", description: "Widespread coral bleaching demonstrates marine ecosystem stress.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2017", title: "AI Climate Modeling Advances", description: "Machine learning begins improving climate predictions and pattern recognition.", era: "Digital Planet", category: "Technology", type: "event" },
  { year: "2017", title: "Global Coral Bleaching Event", description: "Third global bleaching event in 20 years affects reefs worldwide.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2018", title: "IPCC 1.5°C Report", description: "Special report details stark differences between 1.5°C and 2°C warming scenarios.", era: "Digital Planet", category: "Science", type: "event" },
  { year: "2018", title: "Global Climate Strikes Begin", description: "Youth-led movement demands urgent climate action, millions participate worldwide.", era: "Digital Planet", category: "Environment", type: "moment" },
  { year: "2018", title: "Plastic Pollution Awareness Peak", description: "Global attention focuses on ocean plastic crisis.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2019", title: "Amazon Fires Global Attention", description: "Satellite imagery reveals widespread deforestation fires, demonstrating real-time global monitoring.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2019", title: "European Green Deal", description: "EU commits to climate neutrality by 2050, largest coordinated climate policy.", era: "Digital Planet", category: "Global Cooperation", type: "event" },
  { year: "2019", title: "First Black Hole Image", description: "Event Horizon Telescope captures direct image of black hole.", era: "Digital Planet", category: "Science", type: "event" },
  { year: "2020", title: "COVID Reveals Emission Impacts", description: "Pandemic lockdowns demonstrate rapid atmospheric response to emission changes.", era: "Digital Planet", category: "Science", type: "event" },
  { year: "2020", title: "Record Wildfires Globally", description: "Australia, California, Siberia experience unprecedented fire seasons.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2020", title: "Antarctica Exceeds 20°C", description: "First temperature above 20°C recorded on Antarctic continent.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2021", title: "IPCC Sixth Assessment", description: "Report confirms human influence on climate unequivocal, every region affected.", era: "Digital Planet", category: "Science", type: "event" },
  { year: "2021", title: "COP26 Glasgow", description: "Nations strengthen commitments, though gap remains to 1.5°C pathway.", era: "Digital Planet", category: "Global Cooperation", type: "event" },
  { year: "2021", title: "Mars Helicopter Flight", description: "Ingenuity achieves first powered flight on another planet.", era: "Digital Planet", category: "Exploration", type: "event" },
  { year: "2022", title: "James Webb Telescope", description: "Most powerful space telescope reveals universe in unprecedented detail.", era: "Digital Planet", category: "Exploration", type: "event" },
  { year: "2022", title: "EU Carbon Border Tax", description: "First major carbon border adjustment mechanism, reshaping global trade.", era: "Digital Planet", category: "Global Cooperation", type: "event" },
  { year: "2022", title: "Pakistan Floods", description: "Catastrophic flooding displaces millions, demonstrating climate vulnerability.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2022", title: "World Population Reaches 8 Billion", description: "Human population continues growth amid resource constraints.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2023", title: "Hottest Year in 125,000 Years", description: "Global temperature exceeds anything in human civilization's existence.", era: "Digital Planet", category: "Environment", type: "moment" },
  { year: "2023", title: "AI Environmental Monitoring", description: "Machine learning enables real-time tracking of deforestation, emissions, biodiversity.", era: "Digital Planet", category: "Technology", type: "event" },
  { year: "2023", title: "COP28 Dubai", description: "First global stocktake assesses progress toward Paris Agreement goals.", era: "Digital Planet", category: "Global Cooperation", type: "event" },
  { year: "2023", title: "Global Boiling Declaration", description: "UN declares era of global boiling has arrived as records shattered.", era: "Digital Planet", category: "Environment", type: "event" },
  { year: "2024", title: "Real-Time Planetary Data Platforms", description: "Multiple systems now track Earth's vital signs continuously, enabling global awareness.", era: "Digital Planet", category: "Technology", type: "moment" },
  { year: "2024", title: "Record Ocean Temperatures", description: "Global ocean heat content reaches highest levels ever recorded.", era: "Digital Planet", category: "Environment", type: "event" },
];

// ============================================
// ERA DEFINITIONS
// ============================================
const eras = [
  { id: "Ancient World", label: "Ancient World", color: "#f59e0b", icon: Telescope },
  { id: "Scientific Revolution", label: "Scientific Revolution", color: "#8b5cf6", icon: FlaskConical },
  { id: "Industrial Era", label: "Industrial Era", color: "#ef4444", icon: Factory },
  { id: "Space Age", label: "Space Age", color: "#3b82f6", icon: Globe2 },
  { id: "Planetary Awareness", label: "Planetary Awareness", color: "#14b8a6", icon: Network },
  { id: "Digital Planet", label: "Digital Planet", color: "#22c55e", icon: Satellite },
];

// ============================================
// CATEGORY DEFINITIONS
// ============================================
const categories = [
  { id: "Science", label: "Science", color: "#8b5cf6" },
  { id: "Technology", label: "Technology", color: "#3b82f6" },
  { id: "Exploration", label: "Exploration", color: "#f59e0b" },
  { id: "Environment", label: "Environment", color: "#22c55e" },
  { id: "Energy", label: "Energy", color: "#ef4444" },
  { id: "Global Cooperation", label: "Global Cooperation", color: "#14b8a6" },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
function parseYear(yearStr: string): number {
  const bceMatch = yearStr.match(/~?(\d+)\s*BCE/i);
  if (bceMatch) return -parseInt(bceMatch[1], 10);
  const approxMatch = yearStr.match(/~?(\d+)/);
  if (approxMatch) return parseInt(approxMatch[1], 10);
  return 0;
}

function getEraColor(eraId: string): string {
  return eras.find(e => e.id === eraId)?.color || "#768a9e";
}

function getCategoryColor(categoryId: string): string {
  return categories.find(c => c.id === categoryId)?.color || "#768a9e";
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function TimelinePage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [spineProgress, setSpineProgress] = useState(0);
  
  const [currentYear, setCurrentYear] = useState<string>("");
  const [activeLocation, setActiveLocation] = useState<{ lat: number; lng: number; title: string; year: string } | null>(null);
  const [markerTrail, setMarkerTrail] = useState<Array<{ lat: number; lng: number; title: string; year: string }>>([]);
  const [spineGlowTop, setSpineGlowTop] = useState<number | null>(null);
  const [spineGlowAnimating, setSpineGlowAnimating] = useState(false);
  const lastFocusedEventRef = useRef<string | null>(null);
  const timelineColumnRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Register event element ref
  const setEventRef = useCallback((slug: string, el: HTMLDivElement | null) => {
    if (el) {
      eventRefs.current.set(slug, el);
    } else {
      eventRefs.current.delete(slug);
    }
  }, []);



  // Scroll listener for animated spine progress
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far through the timeline we've scrolled
      const progress = Math.min(
        Math.max((windowHeight - rect.top) / rect.height, 0),
        1
      );
      setSpineProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Timeline density fade + year indicator - focus detection based on scroll position
  useEffect(() => {
    const updateFocus = () => {
      const center = window.innerHeight / 2;
      const events = document.querySelectorAll('.timeline-event');
      
      let closestEvent: Element | null = null;
      let closestDistance = Infinity;
      
      events.forEach((event) => {
        const rect = event.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - center);
        
        if (distance < 250) {
          event.classList.add('focused');
        } else {
          event.classList.remove('focused');
        }
        
        // Track closest event for year indicator
        if (distance < closestDistance) {
          closestDistance = distance;
          closestEvent = event;
        }
      });
      
      // Update year indicator and map location
      if (closestEvent) {
        const el = closestEvent as HTMLElement;
        const year = el.dataset.year;
        const lat = el.dataset.lat;
        const lng = el.dataset.lng;
        const title = el.dataset.title;
        
        if (year) setCurrentYear(year);
        
        // Trigger spine glow animation when active event changes
        const eventKey = `${year}-${title}`;
        if (eventKey !== lastFocusedEventRef.current && timelineColumnRef.current) {
          lastFocusedEventRef.current = eventKey;
          
          // Calculate position relative to timeline column
          const columnRect = timelineColumnRef.current.getBoundingClientRect();
          const eventRect = el.getBoundingClientRect();
          const relativeTop = eventRect.top - columnRect.top + el.offsetHeight / 2;
          
          // Trigger glow animation
          setSpineGlowAnimating(false);
          setSpineGlowTop(relativeTop);
          // Small delay to ensure state update triggers re-render
          requestAnimationFrame(() => {
            setSpineGlowAnimating(true);
          });
        }
        
        if (lat && lng && title && year) {
          const newLocation = { lat: parseFloat(lat), lng: parseFloat(lng), title, year };
          setActiveLocation(prev => {
            if (prev?.title !== title) {
              // Add previous location to trail (keep last 15)
              if (prev) {
                setMarkerTrail(trail => {
                  const exists = trail.some(m => m.title === prev.title);
                  if (exists) return trail;
                  return [...trail.slice(-14), prev];
                });
              }
              return newLocation;
            }
            return prev;
          });
        }
      }
    };

    window.addEventListener('scroll', updateFocus, { passive: true });
    window.addEventListener('load', updateFocus);
    // Initial call
    setTimeout(updateFocus, 100);
    
    return () => {
      window.removeEventListener('scroll', updateFocus);
      window.removeEventListener('load', updateFocus);
    };
  }, []);

  // Auto-scroll to hash on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('timeline-active');
        }
      }, 400);
    }
  }, []);

  // Sort events chronologically
  const allEvents = useMemo(() => {
    return [...timelineEvents].sort((a, b) => parseYear(a.year) - parseYear(b.year));
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (activeFilters.length === 0) return allEvents;
    return allEvents.filter(event => activeFilters.includes(event.category));
  }, [allEvents, activeFilters]);

  // Group by era
  const eventsByEra = useMemo(() => {
    const grouped: Record<string, TimelineEvent[]> = {};
    for (const era of eras) {
      grouped[era.id] = filteredEvents.filter(e => e.era === era.id);
    }
    return grouped;
  }, [filteredEvents]);

  const toggleFilter = (categoryId: string) => {
    setActiveFilters(prev => 
      prev.includes(categoryId) 
        ? prev.filter(f => f !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => setActiveFilters([]);

  // Navbar height constant - used for sticky positioning
  const NAVBAR_HEIGHT = 64; // h-16 = 4rem = 64px

  return (
    <>
      {/* ============================================
          LAYER 1: GLOBAL NAVBAR (z-1000, fixed)
          - MUST be OUTSIDE any wrapper that might have overflow/transform
          - Fixed to viewport top, always visible
          - Same component used on homepage
          ============================================ */}
      <UniversalNavbar />

      {/* Site shell - main page wrapper 
          isolation:isolate creates a stacking context for content 
          WITHOUT affecting fixed navbar (which is outside this wrapper) */}
      <div 
        className="site-shell relative min-h-screen bg-[#0a0e17]" 
        style={{ 
          paddingTop: `${NAVBAR_HEIGHT}px`,
          isolation: 'isolate',
        }}
      >
        {/* ============================================
            HOW WE GOT HERE SECTION
            - Contains: sticky header, viewport mask, scroll body
            - Uses viewport scroll (not internal scroll)
            ============================================ */}
        <section className="how-we-got-here-section relative">
          {/* ----------------------------------------
              LAYER 2: STICKY TIMELINE HEADER (z-[900])
              - Sticks at top: NAVBAR_HEIGHT (directly below navbar)
              - FULLY OPAQUE background - no transparency
              - Must visually occlude ALL content scrolling beneath
              ---------------------------------------- */}
          <div 
            className="sticky border-b border-white/10 px-6 py-6"
            style={{
              top: `${NAVBAR_HEIGHT}px`,
              zIndex: 900,
              background: '#0a0e17',
              boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
            }}
          >
            <div className="mx-auto max-w-7xl">
          {/* Two-column layout: Left (60%) = Controls, Right (40%) = Map */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
            
            {/* LEFT COLUMN - Title + Filters */}
            <div className="flex flex-col justify-between">
{/* Title Block with Metadata */}
                <div className="mb-4">
                  <h1 className="font-serif text-[28px] font-semibold leading-tight text-white md:text-[36px]">
                    How We Got Here
                  </h1>
                  <p className="mt-1 text-[16px] text-[#14b8a6] md:text-[18px]">
                    12,000 Years of Discovery
                  </p>
                  {/* Supporting metadata - milestone count and current filter state */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#94a3b8]">
                    <span>{filteredEvents.length} milestones</span>
                    <span className="hidden sm:inline">·</span>
                    <span>
                      Currently viewing:{' '}
                      <span className="text-white/70">
                        {activeFilters.length === 0 
                          ? 'All Milestones'
                          : activeFilters.length === 1
                            ? categories.find(c => c.id === activeFilters[0])?.label || 'Filtered'
                            : `${activeFilters.length} Categories`
                        }
                      </span>
                    </span>
                  </div>
                </div>

              {/* Filters Row */}
              <div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-x-visible md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {/* All Button */}
                  <button
                    onClick={clearFilters}
                    className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150"
                    style={{
                      background: activeFilters.length === 0 ? 'rgba(20,184,166,0.15)' : 'transparent',
                      border: activeFilters.length === 0 ? '1px solid rgba(20,184,166,0.5)' : '1px solid rgba(255,255,255,0.12)',
                      color: activeFilters.length === 0 ? '#14b8a6' : '#94a3b8',
                      boxShadow: activeFilters.length === 0 ? '0 0 12px rgba(20,184,166,0.2)' : 'none',
                    }}
                  >
                    All
                  </button>
                  {categories.map(cat => {
                    const isActive = activeFilters.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleFilter(cat.id)}
                        className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150"
                        style={{
                          background: isActive ? `${cat.color}15` : 'transparent',
                          border: `1px solid ${isActive ? cat.color : 'rgba(255,255,255,0.12)'}`,
                          color: isActive ? cat.color : '#94a3b8',
                          boxShadow: isActive ? `0 0 12px ${cat.color}25` : 'none',
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Mini Map */}
            <div className="hidden lg:block">
              {/* Map Title */}
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/40">
                Discovery Locations
              </div>
              <div 
                className="w-full overflow-hidden rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* SVG World Map - compact 16:9 aspect */}
                <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
                  <svg 
                    viewBox="0 0 360 180" 
                    className="h-full w-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* World map continents - refined accurate silhouettes */}
                    <g>
                      {Object.entries(WORLD_MAP_PATHS).map(([key, path]) => (
                        <path
                          key={key}
                          d={path}
                          fill="rgba(255,255,255,0.03)"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="0.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      ))}
                    </g>
                    
                    {/* Trail markers (past discoveries - faint) */}
                    {markerTrail.map((marker, idx) => {
                      const { x, y } = latLngToXY(marker.lat, marker.lng);
                      return (
                        <circle
                          key={`trail-${marker.title}-${idx}`}
                          cx={x}
                          cy={y}
                          r="2"
                          fill="rgba(255,255,255,0.2)"
                          className="transition-opacity duration-500"
                        />
                      );
                    })}
                    
                    {/* Active marker with pulse */}
                    {activeLocation && (() => {
                      const { x, y } = latLngToXY(activeLocation.lat, activeLocation.lng);
                      return (
                        <g>
                          {/* Expanding pulse ring */}
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="none"
                            stroke="rgba(20,184,166,0.8)"
                            strokeWidth="1"
                            className="animate-ping"
                            style={{ transformOrigin: `${x}px ${y}px` }}
                          />
                          {/* Glow */}
                          <circle
                            cx={x}
                            cy={y}
                            r="6"
                            fill="rgba(20,184,166,0.15)"
                          />
                          {/* Center dot */}
                          <circle
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#14b8a6"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(20,184,166,0.8))' }}
                          />
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile: Map appears below filters */}
          <div className="mt-5 lg:hidden">
            {/* Mobile Map Title */}
            <div className="mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                Discovery Locations
              </span>
            </div>
            <div 
              className="w-full overflow-hidden rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="relative w-full" style={{ aspectRatio: '2 / 1', maxHeight: '140px' }}>
                <svg 
                  viewBox="0 0 360 180" 
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <g>
                    {Object.entries(WORLD_MAP_PATHS).map(([key, path]) => (
                      <path
                        key={key}
                        d={path}
                        fill="rgba(255,255,255,0.03)"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="0.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    ))}
                  </g>
                  {activeLocation && (() => {
                    const { x, y } = latLngToXY(activeLocation.lat, activeLocation.lng);
                    return (
                      <g>
                        <circle cx={x} cy={y} r="4" fill="none" stroke="rgba(20,184,166,0.8)" strokeWidth="1" className="animate-ping" />
                        <circle cx={x} cy={y} r="3" fill="#14b8a6" style={{ filter: 'drop-shadow(0 0 4px rgba(20,184,166,0.8))' }} />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
            </div>
          </div>
          </div>
          {/* End of sticky header */}

          {/* ----------------------------------------
              LAYER 2.5: VIEWPORT MASK (z-[850])
              - Dedicated masking layer below sticky header
              - FULLY OPAQUE - blocks all timeline content
              - Prevents spine, nodes, pills, cards from showing through
              ---------------------------------------- */}
          <div 
            className="pointer-events-none sticky left-0 right-0 h-4"
            style={{
              top: `${NAVBAR_HEIGHT}px`,
              zIndex: 850,
              background: 'linear-gradient(to bottom, #0a0e17 0%, #0a0e17 50%, transparent 100%)',
              marginTop: '-1rem',
            }}
            aria-hidden="true"
          />

          {/* ----------------------------------------
              LAYER 3: TIMELINE SCROLL BODY (z-[100])
              - Contains ALL scrolling timeline content
              - Nothing from here may render above z-[100]
              - Spine, nodes, pills, cards all live here
              - Content scrolls under sticky header + mask
              ---------------------------------------- */}
          <div 
            className="timeline-scroll-body relative"
            style={{ 
              zIndex: 100,
              background: '#0a0e17',
            }}
          >
            {/* Floating Year Indicator - z-[200] above scroll body, below sticky header */}
            {currentYear && (
              <div 
                className="pointer-events-none fixed left-4 top-1/2 hidden -translate-y-1/2 md:left-8 lg:left-12 lg:block"
                style={{ zIndex: 200 }}
              >
                <span 
                  className="timeline-year-indicator block font-mono text-[28px] font-semibold tracking-wide text-white/60 md:text-[32px] lg:text-[36px]"
                  style={{
                    textShadow: '0 0 30px rgba(0,0,0,0.5)',
                  }}
                >
                  {currentYear}
                </span>
              </div>
            )}

            {/* Timeline Events Section */}
            <section className="relative px-6 py-16" ref={timelineRef}>
              <div className="mx-auto max-w-5xl">
                {/* Timeline Column */}
                <div className="relative" ref={timelineColumnRef}>
                  {/* Vertical spine - z-[10] behind cards but within scroll body */}
                  <div 
                    className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 md:block"
                    style={{ zIndex: 10 }}
                    aria-hidden="true"
                  >
                    {/* Continuous background track - subtle structural line */}
                    <div 
                      className="absolute inset-0"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                    {/* Animated scroll progress overlay */}
                    <div 
                    className="absolute left-0 top-0 w-full"
                    style={{ 
                      height: `${spineProgress * 100}%`,
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
                      transition: 'height 0.1s linear',
                    }}
                  />
                </div>

                {eras.map((era) => {
            const eraEvents = eventsByEra[era.id];
            if (eraEvents.length === 0) return null;
            const EraIcon = era.icon;

            return (
              <div key={era.id} className="mb-20">
                {/* Era Header - fully opaque pill to mask spine */}
                <div className="relative z-10 mb-12 flex items-center justify-center">
                  <div 
                    className="relative flex items-center gap-3 rounded-full px-6 py-3"
                    style={{ 
                      background: '#0a0e17',
                      border: `1px solid ${era.color}40`,
                      boxShadow: `inset 0 0 20px ${era.color}15`,
                    }}
                  >
                    <EraIcon className="h-5 w-5" style={{ color: era.color }} />
                    <span className="font-serif text-[20px] font-semibold md:text-[22px]" style={{ color: era.color }}>
                      {era.label}
                    </span>
                  </div>
                </div>

                {/* Events */}
                <div className="relative space-y-6 md:space-y-8">
                  {eraEvents.map((event, index) => {
                    const isMoment = event.type === "moment";
                    const isLeft = index % 2 === 0;
                    const slug = generateSlug(event.title);

                    if (isMoment) {
                      return (
                        <div
                          key={`${event.year}-${event.title}`}
                          id={slug}
                          data-year={event.year}
                          data-lat={event.location?.lat}
                          data-lng={event.location?.lng}
                          data-title={event.title}
                          ref={(el) => setEventRef(slug, el)}
                          className="timeline-event animate-fade-up group relative z-10 mx-auto max-w-2xl"
                          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                        >
                          <div
                            className="relative rounded-2xl p-8 text-center transition-shadow duration-300"
                            style={{
                              background: '#0a0e17',
                              border: `1px solid ${era.color}40`,
                              boxShadow: `0 0 60px ${era.color}10, inset 0 0 40px ${era.color}08`,
                            }}
                          >
                            {/* Share popover */}
                            <div className="absolute right-4 top-4">
                              <EventSharePopover
                                event={event}
                                slug={slug}
                                eraColor={era.color}
                                categoryColor={getCategoryColor(event.category)}
                                position="right"
                                buttonSize="md"
                              />
                            </div>
                            <div 
                              className="mb-4 inline-block rounded-full px-3 py-1 text-[13px] font-medium uppercase tracking-wider"
                              style={{ background: `${era.color}20`, color: era.color }}
                            >
                              Planet Awareness Moment
                            </div>
                            <div className="mb-2 font-mono text-[15px]" style={{ color: era.color }}>
                              {event.year}
                            </div>
                            <h3 className="mb-4 font-serif text-[32px] font-semibold leading-tight text-white md:text-[36px]">
                              {event.title}
                            </h3>
                            <p className="text-[16px] leading-relaxed text-[#94a3b8] md:text-[17px]">
                              {event.description}
                            </p>
                            <div className="mt-6">
                              <span 
                                className="rounded-full px-3 py-1 text-[13px]"
                                style={{ 
                                  background: `${getCategoryColor(event.category)}15`,
                                  color: getCategoryColor(event.category),
                                  border: `1px solid ${getCategoryColor(event.category)}30`,
                                }}
                              >
                                {event.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`${event.year}-${event.title}`}
                        id={slug}
                        data-year={event.year}
                        data-lat={event.location?.lat}
                        data-lng={event.location?.lng}
                        data-title={event.title}
                        ref={(el) => setEventRef(slug, el)}
                        className={`timeline-event animate-fade-up group relative z-10 flex items-start gap-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                      >
                        {/* Timeline node with tooltip and energy ring - z-20 to stay above spine but part of milestone */}
                        <div 
                          className="timeline-node absolute left-1/2 top-4 z-20 hidden h-3 w-3 -translate-x-1/2 rounded-full transition-shadow duration-300 md:block" 
                          style={{ background: era.color, boxShadow: `0 0 8px ${era.color}60` }}
                        >
                          {/* Energy ring (animated when focused) */}
                          <div 
                            className="timeline-node-ring pointer-events-none absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{ 
                              border: '1px solid rgba(80,200,255,0.25)',
                              opacity: 0,
                            }}
                          />
                          {/* Hover tooltip */}
                          <div className="timeline-node-tooltip">
                            <div className="timeline-node-tooltip-year">{event.year}</div>
                            <div className="timeline-node-tooltip-title">{event.title}</div>
                          </div>
                        </div>
                        <div className={`flex-1 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                          <div
                            className="relative rounded-xl p-5 transition-shadow duration-300"
                            style={{
                              background: '#0a0e17',
                              border: '1px solid rgba(255,255,255,0.08)',
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                            }}
                          >
                            {/* Share popover */}
                            <div className={`absolute top-3 ${isLeft ? 'left-3' : 'right-3'}`}>
                              <EventSharePopover
                                event={event}
                                slug={slug}
                                eraColor={era.color}
                                categoryColor={getCategoryColor(event.category)}
                                position={isLeft ? "left" : "right"}
                                buttonSize="sm"
                              />
                            </div>
                            <div className="mb-1.5 font-mono text-[14px]" style={{ color: era.color }}>
                              {event.year}
                            </div>
                            <h4 className="mb-2 font-serif text-[18px] font-medium leading-snug text-white md:text-[19px]">
                              {event.title}
                            </h4>
                            <p className="mb-3 text-[14px] leading-relaxed text-[#94a3b8]">
                              {event.description}
                            </p>
                            <span 
                              className="inline-block rounded-full px-2.5 py-0.5 text-[12px]"
                              style={{ background: `${getCategoryColor(event.category)}15`, color: getCategoryColor(event.category) }}
                            >
                              {event.category}
                            </span>
                          </div>
                        </div>
                        <div className="hidden flex-1 md:block" />
                      </div>
                    );
                    })}
                  </div>
                </div>
              );
            })}
                </div>
                {/* End of timelineColumnRef div (Timeline Column) */}
              </div>
              {/* End of max-w-5xl div */}
            </section>
            {/* End of Timeline Events Section (timelineRef) */}

            {/* Closing Section - "From Discovery to Systems" */}
            <section 
              className="relative px-6 py-28 text-center md:py-36"
              style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(20,184,166,0.06) 0%, transparent 70%)' }}
            >
              <div className="mx-auto max-w-3xl">
                <h2 
                  className="animate-fade-up mb-8 font-serif text-[32px] font-semibold leading-tight text-white md:text-[40px]"
                  style={{ animationDelay: '0ms', animationFillMode: 'both' }}
                >
                  From Discovery to Systems
                </h2>
                
                <div 
                  className="animate-fade-up mb-16 space-y-4 text-[15px] leading-relaxed text-[#94a3b8] md:text-[16px]"
                  style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                >
                  <p>For centuries humanity discovered pieces of how the planet works.</p>
                  <p>Today we understand that Earth operates through interconnected systems — population, food, energy, technology, and the planet itself.</p>
                  <p>EarthNow visualizes these systems as they change in real time.</p>
                </div>
                
                {/* Systems Visualization */}
                <div className="relative mx-auto mb-16" style={{ width: '320px', height: '280px' }}>
                  <svg className="absolute inset-0" width="320" height="280" style={{ overflow: 'visible' }}>
              {[
                { x1: 160, y1: 50, x2: 60, y2: 140 },
                { x1: 160, y1: 50, x2: 160, y2: 140 },
                { x1: 160, y1: 50, x2: 260, y2: 140 },
                { x1: 60, y1: 140, x2: 160, y2: 140 },
                { x1: 160, y1: 140, x2: 260, y2: 140 },
                { x1: 60, y1: 140, x2: 160, y2: 230 },
                { x1: 260, y1: 140, x2: 160, y2: 230 },
                { x1: 160, y1: 140, x2: 160, y2: 230 },
              ].map((line, i) => (
                <line
                  key={i}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                  stroke="rgba(20,184,166,0.2)"
                  strokeWidth="1"
                  className="animate-fade-up"
                  style={{ animationDelay: `${600 + i * 50}ms`, animationFillMode: 'both' }}
                  />
                ))}
                  </svg>
                  
                  {[
                    { id: 'people', label: 'People', x: 160, y: 50, color: '#f59e0b', delay: 200 },
                    { id: 'food', label: 'Food', x: 60, y: 140, color: '#22c55e', delay: 280 },
                    { id: 'planet', label: 'Planet', x: 160, y: 140, color: '#14b8a6', delay: 360 },
                    { id: 'energy', label: 'Energy', x: 260, y: 140, color: '#eab308', delay: 440 },
                    { id: 'technology', label: 'Technology', x: 160, y: 230, color: '#8b5cf6', delay: 520 },
                  ].map((system) => (
                    <div
                      key={system.id}
                      className="animate-fade-up absolute flex flex-col items-center"
                      style={{
                        left: system.x,
                        top: system.y,
                        transform: 'translate(-50%, -50%)',
                        animationDelay: `${system.delay}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <div
                        className="absolute rounded-full"
                        style={{ width: '60px', height: '60px', background: `radial-gradient(circle, ${system.color}20 0%, transparent 70%)` }}
                      />
                      <div
                        className="relative flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ background: `${system.color}20`, border: `1px solid ${system.color}50`, boxShadow: `0 0 12px ${system.color}30` }}
                      >
                        <div className="h-3 w-3 rounded-full" style={{ background: system.color }} />
                      </div>
                      <span className="mt-2 text-[12px] font-medium" style={{ color: system.color }}>
                        {system.label}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="animate-fade-up" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-medium transition-all duration-[220ms]"
                    style={{
                      background: 'rgba(20,184,166,0.15)',
                      border: '1px solid rgba(20,184,166,0.5)',
                      color: '#14b8a6',
                      boxShadow: '0 0 20px rgba(20,184,166,0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#14b8a6';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(20,184,166,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(20,184,166,0.15)';
                      e.currentTarget.style.color = '#14b8a6';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(20,184,166,0.1)';
                    }}
                  >
                    Explore the Living Planet
                  </Link>
                </div>
              </div>
            </section>
            {/* End of Closing Section */}
          </div>
          {/* End of timeline-scroll-body */}
        </section>
        {/* End of how-we-got-here-section */}
      </div>
      {/* End of site-shell */}
    </>
  );
}
