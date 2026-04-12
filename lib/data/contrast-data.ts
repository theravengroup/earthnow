export type ContrastPool = "A" | "B" | "C" | "D" | "E" | "F";

export interface ContrastEntry {
  pool: ContrastPool;
  stat1: string;
  stat2: string;
  voice: string;
}

export const CONTRAST_DATA: ContrastEntry[] = [
  // Pool A - Food & Population
  { pool: "A", stat1: "24,000 people will die of hunger today.", stat2: "2.3 million kg of food will be thrown away.", voice: "Both numbers are still climbing." },
  { pool: "A", stat1: "Every 5 seconds, a child dies of hunger.", stat2: "Every 1 second, a restaurant throws away a meal.", voice: "We know about both." },
  { pool: "A", stat1: "105 babies are born into poverty every minute.", stat2: "The global food industry earns $18.8 million in that same minute.", voice: "The money is there. The distribution isn't." },
  { pool: "A", stat1: "Today, humanity will produce enough food to feed 10 billion people.", stat2: "Today, 24,000 will starve.", voice: "This isn't a production problem." },
  { pool: "A", stat1: "The average household throws away 30% of the food it buys.", stat2: "Somewhere else, a family is eating once a day.", voice: "Same planet. Same Tuesday." },
  { pool: "A", stat1: "264 people will be born this minute.", stat2: "108 will die.", voice: "The math looks like growth. The details are harder." },
  { pool: "A", stat1: "385,000 people will turn 18 today.", stat2: "210,000 will turn 65.", voice: "The planet is getting younger and older at the same time." },
  // Pool B - Environment
  { pool: "B", stat1: "20,000 hectares of forest were lost today.", stat2: "14,000 hectares were planted.", voice: "We're not keeping up." },
  { pool: "B", stat1: "80,000 tonnes of CO₂ entered the atmosphere this hour.", stat2: "It will take 4,000 years to leave.", voice: "We add in minutes what takes millennia to remove." },
  { pool: "B", stat1: "10,400 tonnes of fish were pulled from the ocean this hour.", stat2: "1,256 tonnes of plastic went in.", voice: "The ocean remembers both." },
  { pool: "B", stat1: "3.6 billion tonnes of ice will melt today.", stat2: "That ice took thousands of years to form.", voice: "We're spending what we can't earn back." },
  { pool: "B", stat1: "205 million tonnes of topsoil eroded today.", stat2: "It takes nature 500 years to generate one inch.", voice: "We're farming on borrowed time." },
  { pool: "B", stat1: "13 people will die from air pollution this minute. They didn't choose it.", stat2: "10.4 million cigarettes will be smoked today.", voice: "Both deaths are preventable." },
  // Pool C - Money & Systems
  { pool: "C", stat1: "The world will spend $4.4 million on military in the next minute.", stat2: "And $972,000 on illegal drugs.", voice: "We fund what we fear and what we escape into." },
  { pool: "C", stat1: "$191 million in GDP will be generated this minute.", stat2: "17 people will die of hunger in that same minute.", voice: "Productivity is not the problem." },
  { pool: "C", stat1: "Corporations will earn $95 million in profit this minute.", stat2: "Teachers, nurses, and aid workers will share a fraction of that.", voice: "The market values what it values." },
  { pool: "C", stat1: "$1.9 million will be spent on advertising in the next minute. Its only job is to make you want more.", stat2: "On a planet that's asking for less.", voice: "" },
  { pool: "C", stat1: "Global government debt grows by $16.2 million every minute.", stat2: "We're borrowing from a future we're also making harder to live in.", voice: "That's not a policy. It's a contradiction." },
  { pool: "C", stat1: "34 people will die of heart disease this minute.", stat2: "10.4 million cigarettes will be smoked today.", voice: "We know exactly what we're doing." },
  // Pool D - Technology & Disconnection
  { pool: "D", stat1: "350 billion emails will be sent today.", stat2: "100,000 people will call a mental health crisis line.", voice: "We're more connected and more alone than ever." },
  { pool: "D", stat1: "500 million AI queries will run today.", stat2: "25,000 people will die of hunger today.", voice: "The intelligence is artificial. The suffering isn't." },
  { pool: "D", stat1: "3.3 million photos will be taken in the next minute.", stat2: "14 hectares of forest will be lost.", voice: "We're documenting a world we're dismantling." },
  { pool: "D", stat1: "Humanity will spend 8.3 billion hours online today.", stat2: "And 1.7 billion hours of sleep will be lost.", voice: "We traded rest for the scroll." },
  { pool: "D", stat1: "34,700 AI images will be generated in the next hour.", stat2: "0.10 species will move closer to extinction.", voice: "We're creating everything except what we need." },
  { pool: "D", stat1: "1 person will die by suicide in the next minute.", stat2: "100,000 will call a crisis line today.", voice: "Some of them won't." },
  // Pool E - Scale & Paradox
  { pool: "E", stat1: "Humanity will live 5.6 million years of life today.", stat2: "24,000 of those lives will end from hunger.", voice: "The length of life isn't the problem. The distribution is." },
  { pool: "E", stat1: "$191 million in GDP will be generated this minute.", stat2: "264 people will be born into a world that wasn't designed for them.", voice: "We measure progress in dollars. We should measure it in lives." },
  { pool: "E", stat1: "85 billion AI tokens will be processed today.", stat2: "264 babies will be born this minute who will never use a computer.", voice: "Two civilizations are running on the same planet." },
  { pool: "E", stat1: "Humanity will work 26 billion hours today.", stat2: "And spend 8.3 billion hours scrolling.", voice: "We know which one we'll remember." },
  { pool: "E", stat1: "12,952 satellites orbit above us right now.", stat2: "Most people on Earth have never seen a satellite image of their own home.", voice: "We built the view. We forgot to share it." },
  // Pool F - Health & Industry
  { pool: "F", stat1: "$16.7 million will be spent on healthcare this minute.", stat2: "18 people will die of cancer in that same minute.", voice: "The spending is massive. The gap is bigger." },
  { pool: "F", stat1: "10.4 million cigarettes will be smoked today.", stat2: "The tobacco industry will earn more today than most hospitals spend in a month.", voice: "The product that kills you outearns the system that saves you." },
  { pool: "F", stat1: "1.7 billion hours of sleep will be lost tonight.", stat2: "Productivity culture will call that dedication.", voice: "Your body calls it something else." },
  { pool: "F", stat1: "7 new diabetes cases will be diagnosed this minute.", stat2: "The food industry will earn $18.8 million in that same minute.", voice: "One industry creates the patients. Another charges to treat them." },
  { pool: "F", stat1: "100,000 people will call a mental health crisis line today.", stat2: "Mental health funding is less than 2% of global health spending.", voice: "We built a world that breaks people, then underfunded the repair shop." },
];
