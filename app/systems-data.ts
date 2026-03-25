export const SYSTEMS_DEEP_DIVE = {
  people: {
    tabs: [
      {
        label: "Births",
        narrative: "Every second, 4.4 people are born somewhere on Earth. That's a new classroom every minute. A new city every week.",
        stats: [
          { label: "Births today", rate: 264, color: "#22c55e" },
          { label: "Babies born into poverty today", rate: 105, color: "#f97316" },
          { label: "Twins born today", rate: 4.4, color: "#a855f7" },
          { label: "First-time mothers today", rate: 76, color: "#22d3ee" }
        ]
      },
      {
        label: "Population",
        narrative: "8.1 billion people share one planet. Growth is slowing, but the total keeps climbing. Every new person needs food, water, energy, and space.",
        stats: [
          { label: "Net population growth today", rate: 156, color: "#22c55e" },
          { label: "People turning 18 today", rate: 250, color: "#3b82f6" },
          { label: "People turning 65 today", rate: 145, color: "#f59e0b" },
          { label: "Urban population growth today", rate: 107, color: "#8b5cf6" }
        ]
      },
      {
        label: "Deaths",
        narrative: "1.8 people die every second. Some from old age. Some from hunger. Some from diseases we already know how to cure.",
        stats: [
          { label: "Deaths today", rate: 108, color: "#ef4444" },
          { label: "Hunger deaths today", rate: 17, color: "#f97316" },
          { label: "Child deaths (under 5) today", rate: 10, color: "#f43f5e" },
          { label: "Preventable deaths today", rate: 42, color: "#fbbf24" }
        ]
      }
    ],
    contrast: {
      stat1: "264 people will be born this minute.",
      stat2: "108 will die.",
      voice: "The math looks like growth. The details are harder."
    },
    action: {
      title: "Have the Conversation",
      stat: "Only 35% of Americans discuss global issues even occasionally.",
      voice: "Everyone's waiting for someone else to bring it up. Be the someone."
    },
    connections: [
      { system: "Food", description: "Feeding 8.1 billion requires 6 billion tonnes of food per year" },
      { system: "Energy", description: "Each person consumes an average of 58 kWh per day" },
      { system: "Planet", description: "Every new person adds roughly 4 tonnes of CO₂ per year" }
    ]
  },
  energy: {
    tabs: [
      {
        label: "Sources",
        narrative: "80% of the world's energy still comes from fossil fuels. Renewables are growing fast — but not fast enough to match rising demand.",
        stats: [
          { label: "Oil pumped today (barrels)", rate: 69444, color: "#f97316" },
          { label: "Renewable energy generated (MWh)", rate: 15972, color: "#22c55e" },
          { label: "Coal burned today (tonnes)", rate: 17361, color: "#ef4444" },
          { label: "Solar panels installed today", rate: 1042, color: "#fbbf24" }
        ]
      },
      {
        label: "Grid",
        narrative: "770 million people still have no electricity. Meanwhile, data centers consume more power than most countries.",
        stats: [
          { label: "Global electricity generated (MWh)", rate: 53472, color: "#22d3ee" },
          { label: "Energy lost in transmission (MWh)", rate: 4514, color: "#f43f5e" },
          { label: "People without electricity", rate: 0, color: "#94a3b8", static: 770000000 },
          { label: "Data center energy use (MWh)", rate: 5208, color: "#a855f7" }
        ]
      },
      {
        label: "Demand",
        narrative: "Global energy demand grows 2% every year. Efficiency gains exist — but consumption keeps outpacing them.",
        stats: [
          { label: "Total energy consumed today (MWh)", rate: 53472, color: "#f59e0b" },
          { label: "Transport energy use (MWh)", rate: 14583, color: "#3b82f6" },
          { label: "Industrial energy use (MWh)", rate: 18750, color: "#ef4444" },
          { label: "Residential energy use (MWh)", rate: 11806, color: "#22c55e" }
        ]
      }
    ],
    contrast: {
      stat1: "$11.5 million in fossil fuel subsidies are paid every minute.",
      stat2: "Renewable energy gets a fraction of that.",
      voice: "We're paying to keep the problem alive."
    },
    action: {
      title: "Switch Your Electricity",
      stat: "Switching to a renewable energy provider cuts your home's carbon footprint by up to 80%.",
      voice: "It takes one phone call. Most people never make it."
    },
    connections: [
      { system: "Planet", description: "Energy production causes 73% of global greenhouse gas emissions" },
      { system: "Technology", description: "The internet alone uses 10% of global electricity" },
      { system: "People", description: "Energy poverty affects 770 million people worldwide" }
    ]
  },
  planet: {
    tabs: [
      {
        label: "Emissions",
        narrative: "Humanity pumps 80,000 tonnes of CO₂ into the atmosphere every minute. It will take 4,000 years for it to leave.",
        stats: [
          { label: "CO₂ emitted today (tonnes)", rate: 80208, color: "#f59e0b" },
          { label: "Methane emitted today (tonnes)", rate: 694, color: "#a855f7" },
          { label: "Nitrous oxide emitted (tonnes)", rate: 21, color: "#f43f5e" },
          { label: "Black carbon emitted (tonnes)", rate: 17, color: "#94a3b8" }
        ]
      },
      {
        label: "Atmosphere",
        narrative: "CO₂ levels haven't been this high in 4 million years. The last time they were, sea levels were 20 meters higher.",
        stats: [
          { label: "Current CO₂ (ppm)", rate: 0, color: "#ef4444", static: 425 },
          { label: "Pre-industrial CO₂ (ppm)", rate: 0, color: "#22c55e", static: 280 },
          { label: "Temperature rise since 1850 (°C)", rate: 0, color: "#f97316", static: 1.2 },
          { label: "Ocean heat added (Hiroshima equiv.)", rate: 347, color: "#3b82f6" }
        ]
      },
      {
        label: "Sinks",
        narrative: "Forests and oceans absorb half of what we emit. But we're destroying forests and heating oceans — weakening the only systems that can save us.",
        stats: [
          { label: "Forest lost today (hectares)", rate: 13, color: "#ef4444" },
          { label: "Trees planted today", rate: 348, color: "#22c55e" },
          { label: "Ice mass lost today (tonnes)", rate: 2500000, color: "#22d3ee" },
          { label: "Soil lost to erosion (tonnes)", rate: 142700, color: "#f59e0b" }
        ]
      }
    ],
    contrast: {
      stat1: "2.5 million tonnes of ice will melt today.",
      stat2: "That ice took thousands of years to form.",
      voice: "We're spending what we can't earn back."
    },
    action: {
      title: "Change What You Eat",
      stat: "Shifting one meal a day from beef to plant-based saves 1,590 kg of CO₂ per year.",
      voice: "That's more than giving up your car for six months. And it starts at dinner tonight."
    },
    connections: [
      { system: "Energy", description: "73% of emissions come from energy production" },
      { system: "Food", description: "Agriculture drives 80% of global deforestation" },
      { system: "People", description: "Climate change could displace 1.2 billion people by 2050" }
    ]
  },
  food: {
    tabs: [
      {
        label: "Production",
        narrative: "The world produces enough food to feed 10 billion people. 8.1 billion live on this planet. The math should work. It doesn't.",
        stats: [
          { label: "Food produced today (tonnes)", rate: 15278, color: "#22c55e" },
          { label: "Grain harvested today (tonnes)", rate: 5208, color: "#f59e0b" },
          { label: "Meat produced today (tonnes)", rate: 694, color: "#ef4444" },
          { label: "Fish caught today (tonnes)", rate: 180, color: "#3b82f6" }
        ]
      },
      {
        label: "Distribution",
        narrative: "40% of food never reaches a human mouth. It rots in fields, spoils in transit, or sits in refrigerators until it's thrown away.",
        stats: [
          { label: "Food wasted today (tonnes)", rate: 2315, color: "#f97316" },
          { label: "Food lost in supply chain (tonnes)", rate: 1157, color: "#f43f5e" },
          { label: "Retail food waste (tonnes)", rate: 694, color: "#a855f7" },
          { label: "Household food waste (tonnes)", rate: 463, color: "#fbbf24" }
        ]
      },
      {
        label: "Consumption",
        narrative: "The average American consumes 3,600 calories per day. The average person in Sub-Saharan Africa gets 1,600. Same species. Different planet.",
        stats: [
          { label: "Meals consumed today", rate: 15625000, color: "#22d3ee" },
          { label: "People who went hungry today", rate: 17, color: "#ef4444" },
          { label: "Calories wasted per person today", rate: 1, color: "#f97316", static: 720 },
          { label: "Children stunted by malnutrition", rate: 0, color: "#f43f5e", static: 149000000 }
        ]
      }
    ],
    contrast: {
      stat1: "Today, humanity will produce enough food to feed 10 billion people.",
      stat2: "Today, 24,000 will starve.",
      voice: "This isn't a production problem."
    },
    action: {
      title: "Stop Wasting Food",
      stat: "The average household throws away 30% of the food it buys — roughly $1,800 per year.",
      voice: "The easiest environmental action is buying less of what you already throw away."
    },
    connections: [
      { system: "Planet", description: "Agriculture drives 80% of deforestation and 26% of emissions" },
      { system: "Energy", description: "Food production uses 30% of global energy" },
      { system: "People", description: "800 million people face chronic hunger" }
    ]
  },
  technology: {
    tabs: [
      {
        label: "Devices",
        narrative: "5 billion people carry a computer in their pocket. 3 billion don't. The digital divide is one of the largest inequalities on Earth.",
        stats: [
          { label: "Smartphones sold today", rate: 2604, color: "#22d3ee" },
          { label: "E-waste generated today (tonnes)", rate: 104, color: "#f43f5e" },
          { label: "Devices connected to internet", rate: 0, color: "#a855f7", static: 15000000000 },
          { label: "Satellites in orbit", rate: 0, color: "#fbbf24", static: 12952 }
        ]
      },
      {
        label: "Data",
        narrative: "Humanity creates 2.5 quintillion bytes of data every day. Most of it will never be looked at again. All of it uses energy.",
        stats: [
          { label: "Google searches today", rate: 5902778, color: "#3b82f6" },
          { label: "Emails sent today", rate: 231250000, color: "#22c55e" },
          { label: "Data created today (TB)", rate: 277, color: "#f59e0b" },
          { label: "Internet traffic today (PB)", rate: 347, color: "#8b5cf6" }
        ]
      },
      {
        label: "AI",
        narrative: "AI processes 85 billion tokens every day. It writes code, generates images, and answers questions. It also uses 10x the energy of a Google search.",
        stats: [
          { label: "AI queries today", rate: 6944444, color: "#22d3ee" },
          { label: "AI tokens processed today", rate: 85000000000 / 86400, color: "#a855f7" },
          { label: "AI images generated today", rate: 34722, color: "#f97316" },
          { label: "Lines of code written today", rate: 4166667, color: "#22c55e" }
        ]
      }
    ],
    contrast: {
      stat1: "6.9 million AI queries will run today.",
      stat2: "17 people will die of hunger today.",
      voice: "The intelligence is artificial. The suffering isn't."
    },
    action: {
      title: "Reclaim One Hour",
      stat: "The average person spends 2.5 hours per day on social media — that's 38 full days per year.",
      voice: "Imagine what you'd build with 38 days back."
    },
    connections: [
      { system: "Energy", description: "Data centers consume 2% of global electricity — more than many countries" },
      { system: "People", description: "3 billion people still have no internet access" },
      { system: "Planet", description: "Tech industry e-waste is the fastest growing waste stream on Earth" }
    ]
  }
};
