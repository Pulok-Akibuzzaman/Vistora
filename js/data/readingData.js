// js/data/readingData.js

const TFNG = ['TRUE', 'FALSE', 'NOT GIVEN'];

export const READING_TEST_1_PASSAGES = [
  {
    part: 1,
    title: 'Passage 1: Urban farming in Paris',
    subtitle: 'Soil-free rooftop agriculture aiming to protect future food supplies.',
    paragraphs: [
      "On top of a striking new exhibition hall in southern Paris, the world's largest urban rooftop farm has started to bear fruit. Strawberries that are small, intensely flavoured and resplendently red sprout abundantly from large plastic tubes. Peer inside and you see the tubes are completely hollow, the roots of dozens of strawberry plants dangling down inside them. From identical vertical tubes nearby burst row upon row of lettuces; near those are aromatic herbs, such as basil, sage and peppermint. Opposite, in narrow, horizontal trays packed not with soil but with coconut fibre, grow cherry tomatoes, shiny aubergines and brightly coloured chards.",
      "Pascal Hardy, an engineer and sustainable development consultant, began experimenting with vertical farming and aeroponic growing towers on his Paris apartment block roof five years ago. The urban rooftop space above the exhibition hall is 14,000 square metres. When in full production, 20 staff will harvest up to 1,000 kg of perhaps 35 different varieties of fruit and vegetables every day. Hardy cautions that urban farming cannot feed the whole city, but if enough unused space is developed, it could target between 5% and 10% of consumption.",
      "Produce grown using this aeroponic method relies solely on a small quantity of water enriched with organic nutrients, pumped around a closed circuit of pipes. The produce travels barely at all from rooftop to local plate. Crops can be chosen for flavour rather than transit resistance, and the water showered over roots every 12 minutes is recycled, using 90% less water than intensive farming.",
      "Equipment weighs little, can be installed on almost any flat surface, and is cheap to buy (€100-€150 per sq metre) and run. Prices are lower than soil-based organic growers, although root vegetables like carrots and potatoes cannot yet be grown this way."
    ],
    questions: [
      { id: 1, prompt: 'Vertical tubes are used to grow strawberries, ______ and herbs.', instruction: 'NO MORE THAN TWO WORDS', type: 'text' },
      { id: 2, prompt: 'There will eventually be a daily harvest of as much as ______ in weight.', instruction: 'NO MORE THAN TWO WORDS', type: 'text' },
      { id: 3, prompt: "The farm's produce could eventually target up to 10% of the city's ______.", instruction: 'NO MORE THAN TWO WORDS', type: 'text' },
      { id: 4, prompt: 'Intensive farming: wide range of ______ used on traditional crops.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 5, prompt: 'Traditional varieties chosen for their ability to withstand long ______.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 6, prompt: 'Because of wholesalers and transit, original ______ receive little income.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 7, prompt: 'Aeroponic crops can be selected specifically for their superior ______.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 8, prompt: 'Urban farming can take place above or below ground.', options: TFNG, type: 'choice' },
      { id: 9, prompt: 'Some of the equipment used in aeroponic farming can be made by hand.', options: TFNG, type: 'choice' },
      { id: 10, prompt: 'Urban farming relies more on electricity than some other types of farming.', options: TFNG, type: 'choice' },
      { id: 11, prompt: 'Produce grown aeroponically is cheaper than traditional soil-based organic produce.', options: TFNG, type: 'choice' },
      { id: 12, prompt: 'Most produce can be grown aeroponically at any time of the year.', options: TFNG, type: 'choice' },
      { id: 13, prompt: 'Beans take longer to grow on an urban farm than other vegetables.', options: TFNG, type: 'choice' }
    ]
  },
  {
    part: 2,
    title: 'Passage 2: Forest Management in Pennsylvania',
    subtitle: 'Managing low-quality wood for bioenergy to encourage sustainable forestry.',
    paragraphs: [
      "A tree's value depends on species, form, condition, and management goals. In the past, Pennsylvania landowners practised 'high-grading', harvesting only the finest timber and leaving behind poorly formed 'junk trees'. These compete for resources and leave stands vulnerable to disease.",
      "Bioenergy markets accept low-use wood for combustion in school boilers, hospitals, and homes, or for conversion to liquid biofuels. Cutting techniques such as Timber Stand Improvement (TSI) remove poor-quality trees to free light and soil nutrients for high-value stems.",
      "Salvage Cuts remove trees afflicted with pests such as emerald ash borer and gypsy moth to halt contagion. Shelterwood Cuts leave mature trees until seedlings are established, generating staggered revenue across decades.",
      "However, some low-use wood should be retained. Tree tops return essential nutrients to soil, and trees with natural cavities provide shelter for insect-eating birds and bats that protect overall forest health."
    ],
    questions: [
      { id: 14, prompt: 'Bad outcomes for a forest when people focus only on financial reward:', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], type: 'choice' },
      { id: 15, prompt: 'Reference to the aspects of any tree that contribute to its worth:', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], type: 'choice' },
      { id: 16, prompt: 'Mention of the potential use of wood to help run vehicles:', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], type: 'choice' },
      { id: 17, prompt: 'Examples of insects that attack trees:', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], type: 'choice' },
      { id: 18, prompt: 'An alternative name for trees that produce low-use wood:', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], type: 'choice' },
      { id: 19, prompt: 'To remove trees that are diseased: (Choose A, B, or C)', options: ['A · TSI Cut', 'B · Salvage Cut', 'C · Shelterwood Cut'], type: 'choice' },
      { id: 20, prompt: 'To generate income across a number of years:', options: ['A · TSI Cut', 'B · Salvage Cut', 'C · Shelterwood Cut'], type: 'choice' },
      { id: 21, prompt: 'To create a forest whose trees are close in age:', options: ['A · TSI Cut', 'B · Salvage Cut', 'C · Shelterwood Cut'], type: 'choice' },
      { id: 22, prompt: 'Some dead wood is removed to avoid the danger of ______.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 23, prompt: 'Nutrients from the tops of cut trees help improve ______ quality.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 24, prompt: 'Damaged trees with ______ provide habitats for animals and insects.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 25, prompt: 'Small trees like ______ serve as food sources for wildlife.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 26, prompt: 'Trees that are ______ should be preserved to maintain species diversity.', instruction: 'ONE WORD ONLY', type: 'text' }
    ]
  },
  {
    part: 3,
    title: "Passage 3: Conquering Earth's Space Junk Problem",
    subtitle: 'Tracking satellites, orbital debris and preventing catastrophic runaway collisions.',
    paragraphs: [
      "Over 400 satellites were placed in orbit last year alone. In low Earth orbit (up to 2,000 km altitude), roughly 20,000 artificial objects circle the planet at extreme velocities. Ten years ago, an inactive Cosmos-2251 smashed into a commercial Iridium craft, scattering thousands of lethal shrapnel fragments.",
      "Just a few uncontrolled collisions could ignite a cascade of debris known as Kessler syndrome, making near-Earth space impassable. The Inter-Agency Space Debris Coordination Committee advises de-orbiting dead satellites within 25 years and expelling pressurised residual propellant to avoid post-mission explosions.",
      "Astrodynamicist Moriba Jah advocates space traffic management analogous to aviation air traffic control. Using cross-correlated tracking catalogues, operators can predict close passes down to high precision and avoid unnecessary fuel-wasting burns."
    ],
    questions: [
      { id: 27, prompt: 'Cooperation that takes place to minimise shared space risks:', options: ['A', 'B', 'C', 'D', 'E', 'F'], type: 'choice' },
      { id: 28, prompt: "An explanation of a researcher's environmental aims in space:", options: ['A', 'B', 'C', 'D', 'E', 'F'], type: 'choice' },
      { id: 29, prompt: 'A description of a major historical collision that occurred in orbit:', options: ['A', 'B', 'C', 'D', 'E', 'F'], type: 'choice' },
      { id: 30, prompt: 'Comparison between tracking orbital objects and airport air-traffic control:', options: ['A', 'B', 'C', 'D', 'E', 'F'], type: 'choice' },
      { id: 31, prompt: 'Efforts to classify space junk by size and geometry:', options: ['A', 'B', 'C', 'D', 'E', 'F'], type: 'choice' },
      { id: 32, prompt: 'Guidelines advise measures to achieve orbital ______.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 33, prompt: 'Venting leftover pressurised ______ prevents secondary blast hazards.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 34, prompt: 'Venting residual materials prevents accidental ______ in retired craft.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 35, prompt: 'Firms that go ______ are unlikely to pay for de-orbiting retired equipment.', instruction: 'ONE WORD ONLY', type: 'text' },
      { id: 36, prompt: 'Knowing precise object locations eliminates unnecessary maneuvers:', options: ['A · Carolin Frueh', 'B · Holger Krag', 'C · Marlon Sorge', 'D · Moriba Jah'], type: 'choice' },
      { id: 37, prompt: 'Space should be safe, free, and useful for generations to come:', options: ['A · Carolin Frueh', 'B · Holger Krag', 'C · Marlon Sorge', 'D · Moriba Jah'], type: 'choice' },
      { id: 38, prompt: 'A 25-year de-orbit recommendation is widely ignored by satellite operators:', options: ['A · Carolin Frueh', 'B · Holger Krag', 'C · Marlon Sorge', 'D · Moriba Jah'], type: 'choice' },
      { id: 39, prompt: 'Conflicting database sources plot contradictory orbits for identical space debris:', options: ['A · Carolin Frueh', 'B · Holger Krag', 'C · Marlon Sorge', 'D · Moriba Jah'], type: 'choice' },
      { id: 40, prompt: 'Without regulation, orbital crashes could reach an irreversible point of no return:', options: ['A · Carolin Frueh', 'B · Holger Krag', 'C · Marlon Sorge', 'D · Moriba Jah'], type: 'choice' }
    ]
  }
];

export const READING_ANSWERS_TEST_1 = {
  1: ['lettuces'],
  2: ['1,000 kg', '1000 kg'],
  3: ['consumption'],
  4: ['pesticides'],
  5: ['journeys'],
  6: ['producers'],
  7: ['flavour', 'flavor'],
  8: ['TRUE'],
  9: ['NOT GIVEN'],
  10: ['FALSE'],
  11: ['TRUE'],
  12: ['FALSE'],
  13: ['NOT GIVEN'],
  14: ['B'],
  15: ['A'],
  16: ['C'],
  17: ['E'],
  18: ['B'],
  19: ['B'],
  20: ['C'],
  21: ['C'],
  22: ['fire'],
  23: ['soil', 'nutrients'],
  24: ['cavities'],
  25: ['hawthorn'],
  26: ['rare'],
  27: ['C'],
  28: ['F'],
  29: ['A'],
  30: ['E'],
  31: ['B'],
  32: ['sustainability'],
  33: ['fuel'],
  34: ['explosions'],
  35: ['bankrupt'],
  36: ['C'],
  37: ['D'],
  38: ['B'],
  39: ['D'],
  40: ['A']
};
