"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

// Full action pool - 20 items
const ACTION_POOL = [
  { title: "Change What You Eat", stat: "Shifting one meal a day from beef to plant-based saves 1,590 kg of CO₂ per year.", voice: "That's more than giving up your car for six months. And it starts at dinner tonight." },
  { title: "Stop Wasting Food", stat: "The average household throws away 30% of the food it buys — roughly $1,800 per year.", voice: "The easiest environmental action is buying less of what you already throw away." },
  { title: "Rethink How You Move", stat: "One transatlantic flight produces 1.6 tonnes of CO₂ — more than the average person in 56 countries produces in an entire year.", voice: "You don't have to stop flying. But you should know what it costs." },
  { title: "Choose Where Your Money Goes", stat: "Moving $10,000 from a standard fund to a fossil-fuel-free fund avoids roughly 1.5 tonnes of CO₂ per year.", voice: "Your money works 24/7. Make sure it's not working against you." },
  { title: "Talk About It", stat: "Research shows social influence is the single strongest driver of behavior change — stronger than facts, fear, or policy.", voice: "The most powerful thing you can do right now is send this page to someone." },
  { title: "Switch Your Electricity", stat: "Switching to a renewable energy provider cuts your home's carbon footprint by up to 80%.", voice: "It takes one phone call. Most people never make it." },
  { title: "Fix the Leaks", stat: "A single dripping faucet wastes 11,000 liters of water per year.", voice: "Multiply that by 100 million households and you've got a crisis made of laziness." },
  { title: "Unplug the Vampires", stat: "Standby electronics consume 5-10% of your home's energy — roughly $100 per year doing nothing.", voice: "Your TV is costing you money right now. It's not even on." },
  { title: "Check Your Bank", stat: "The world's 60 largest banks have pumped $5.5 trillion into fossil fuels since the Paris Agreement.", voice: "Your savings account might be funding what you marched against." },
  { title: "Buy Less, But Better", stat: "The fashion industry produces 10% of global carbon emissions — more than aviation and shipping combined.", voice: "The most sustainable shirt is the one you already own." },
  { title: "Tip the Balance", stat: "Donating $50 to a high-impact climate charity offsets roughly 5 tonnes of CO₂.", voice: "That's what most people produce in two months. For the price of dinner." },
  { title: "Reclaim One Hour", stat: "The average person spends 2.5 hours per day on social media — that's 38 full days per year.", voice: "Imagine what you'd build with 38 days back." },
  { title: "Delete What You Don't Need", stat: "Stored data consumes energy 24/7. The average person's cloud storage generates 200 kg of CO₂ per year.", voice: "Your old photos are warming the planet. Slowly, but constantly." },
  { title: "Search Smarter", stat: "A single AI query uses 10x the energy of a Google search.", voice: "Ask better questions. Ask fewer of them." },
  { title: "Vote Like the Planet Depends on It", stat: "Environmental policy is decided by the people who show up. In most elections, 40% don't.", voice: "Skipping one election does more damage than a year of plastic straws." },
  { title: "Feed One More Person", stat: "Volunteering 2 hours per month at a food bank rescues roughly 200 kg of food per year from landfill.", voice: "That's 400 meals. For 24 hours of your year." },
  { title: "Teach a Kid", stat: "Children who learn about climate science before age 12 are 3x more likely to adopt sustainable behaviors as adults.", voice: "The most important climate technology is a curious 8-year-old." },
  { title: "Walk the Short Ones", stat: "Replacing car trips under 2 miles with walking eliminates roughly 0.5 tonnes of CO₂ per year.", voice: "It's also the easiest way to add 7 years to your life. The data on that is settled." },
  { title: "Sleep Like It Matters", stat: "Sleep deprivation costs the global economy $411 billion per year and increases personal carbon footprint through impaired decision-making.", voice: "Tired people buy more, waste more, and drive more. Rest is an environmental act." },
  { title: "Grow One Thing", stat: "A single home garden can offset 10 kg of CO₂ per year and reduce household food waste by 25%.", voice: "It doesn't have to be much. One tomato plant changes how you see food." },
];

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

export function NowWhatSection() {
  // Randomly select 5 actions from the pool using Date.now() for entropy
  const selectedActions = useMemo(() => {
    const seed = Date.now();
    const shuffled = [...ACTION_POOL]
      .map(item => ({ item, sort: Math.random() * seed }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
    return shuffled.slice(0, 5);
  }, []);

  return (
    <section
      style={{
        padding: "100px 24px",
        background: "#0a0e17",
      }}
    >
      {/* Section header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 48,
        }}
      >
        {/* Small label */}
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

        {/* Headline */}
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

        {/* Subhead */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 0,
          }}
        >
          Five actions, ranked by actual impact. No guilt. Just math.
        </p>
      </div>

      {/* Action cards */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {selectedActions.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.6,
              delay: index * 0.15,
              ease: "easeOut",
            }}
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
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
              {card.title}
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
              {formatStatWithNumbers(card.stat)}
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
              {card.voice}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
