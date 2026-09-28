export type ReadingQuestion = {
  id: number
  kind: 'text' | 'choice'
  prompt: string
  options?: string[]
  instruction?: string
}

export type ReadingPassage = {
  part: number
  range: [number, number]
  title: string
  subtitle?: string
  paragraphs: string[]
  questions: ReadingQuestion[]
}

const TFNG = ['TRUE', 'FALSE', 'NOT GIVEN']
const YNNG = ['YES', 'NO', 'NOT GIVEN']

export const READING_PASSAGES: ReadingPassage[] = [
  {
    part: 1,
    range: [1, 13],
    title: 'Urban farming',
    subtitle: 'In Paris, urban farmers are trying a soil-free approach to agriculture that uses less space and fewer resources. Could it help cities face the threats to our food supplies?',
    paragraphs: [
      "On top of a striking new exhibition hall in southern Paris, the world's largest urban rooftop farm has started to bear fruit. Strawberries that are small, intensely flavoured and resplendently red sprout abundantly from large plastic tubes. Peer inside and you see the tubes are completely hollow, the roots of dozens of strawberry plants dangling down inside them. From identical vertical tubes nearby burst row upon row of lettuces; near those are aromatic herbs, such as basil, sage and peppermint. Opposite, in narrow, horizontal trays packed not with soil but with coconut fibre, grow cherry tomatoes, shiny aubergines and brightly coloured chards.",
      "Pascal Hardy, an engineer and sustainable development consultant, began experimenting with vertical farming and aeroponic growing towers – as the soil-free plastic tubes are known – on his Paris apartment block roof five years ago. The urban rooftop space above the exhibition hall is somewhat bigger: 14,000 square metres and almost exactly the size of a couple of football pitches. Already, the team of young urban farmers who tend it have picked, in one day, 3,000 lettuces and 150 punnets of strawberries. When the remaining two thirds of the vast open area are in production, 20 staff will harvest up to 1,000 kg of perhaps 35 different varieties of fruit and vegetables, every day. 'We're not ever, obviously, going to feed the whole city this way,' cautions Hardy. 'In the urban environment you're working with very significant practical constraints, clearly, on what you can do and where. But if enough unused space can be developed like this, there's no reason why you shouldn't eventually target maybe between 5% and 10% of consumption.'",
      "Perhaps most significantly, however, this is a real-life showcase for the work of Hardy's flourishing urban agriculture consultancy, Agripolis, which is currently fielding enquiries from around the world to design, build and equip a new breed of soil-free inner-city farm. 'The method's advantages are many,' he says. 'First, I don't much like the fact that most of the fruit and vegetables we eat have been treated with something like 17 different pesticides, or that the intensive farming techniques that produced them are such huge generators of greenhouse gases. I don't much like the fact, either, that they've travelled an average of 2,000 refrigerated kilometres to my plate, that their quality is so poor, because the varieties are selected for their capacity to withstand such substantial journeys, or that 80% of the price I pay goes to wholesalers and transport companies, not the producers.'",
      "Produce grown using this soil-free method, on the other hand – which relies solely on a small quantity of water, enriched with organic nutrients, pumped around a closed circuit of pipes, towers and trays – is 'produced up here, and sold locally, just down there. It barely travels at all,' Hardy says. 'You can select crop varieties for their flavour, not their resistance to the transport and storage chain, and you can pick them when they're really at their best, and not before.' No soil is exhausted, and the water that gently showers the plants' roots every 12 minutes is recycled, so the method uses 90% less water than a classic intensive farm for the same yield.",
      "Urban farming is not, of course, a new phenomenon. Inner-city agriculture is booming from Shanghai to Detroit and Tokyo to Bangkok. Strawberries are being grown in disused shipping containers, mushrooms in underground carparks. Aeroponic farming, he says, is 'virtuous'. The equipment weighs little, can be installed on almost any flat surface and is cheap to buy: roughly €100 to €150 per square metre. It is cheap to run, too, consuming a tiny fraction of the electricity used by some techniques.",
      "Produce grown this way typically sells at prices that, while generally higher than those of classic intensive agriculture, are lower than soil-based organic growers. There are limits to what farmers can grow this way, of course, and much of the produce is suited to the summer months. 'Root vegetables we cannot do, at least not yet,' he says. 'Radishes are OK, but carrots, potatoes, that kind of thing – the roots are simply too long. Fruit trees are obviously not an option. And beans tend to take up a lot of space for not much return.' Nevertheless, urban farming of the kind being practised in Paris is one part of a bigger and fast-changing picture that is bringing food production closer to our lives.",
    ],
    questions: [
      { id: 1, kind: 'text', prompt: 'Vertical tubes are used to grow strawberries, ______ and herbs.', instruction: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
      { id: 2, kind: 'text', prompt: 'There will eventually be a daily harvest of as much as ______ in weight of fruit and vegetables.', instruction: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
      { id: 3, kind: 'text', prompt: "It may be possible that the farm's produce will account for as much as 10% of the city's ______ overall.", instruction: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' },
      { id: 4, kind: 'text', prompt: 'Intensive farming (Growth): wide range of ______ used', instruction: 'ONE WORD ONLY' },
      { id: 5, kind: 'text', prompt: 'Intensive farming (Selection): varieties of fruit and vegetables chosen that can survive long ______', instruction: 'ONE WORD ONLY' },
      { id: 6, kind: 'text', prompt: 'Intensive farming (Sale): ______ receive very little of overall income', instruction: 'ONE WORD ONLY' },
      { id: 7, kind: 'text', prompt: 'Aeroponic urban farming (Selection): produce chosen because of its ______', instruction: 'ONE WORD ONLY' },
      { id: 8, kind: 'choice', prompt: 'Urban farming can take place above or below ground.', options: TFNG },
      { id: 9, kind: 'choice', prompt: 'Some of the equipment used in aeroponic farming can be made by hand.', options: TFNG },
      { id: 10, kind: 'choice', prompt: 'Urban farming relies more on electricity than some other types of farming.', options: TFNG },
      { id: 11, kind: 'choice', prompt: 'Fruit and vegetables grown on an aeroponic urban farm are cheaper than traditionally grown organic produce.', options: TFNG },
      { id: 12, kind: 'choice', prompt: 'Most produce can be grown on an aeroponic urban farm at any time of the year.', options: TFNG },
      { id: 13, kind: 'choice', prompt: 'Beans take longer to grow on an urban farm than other vegetables.', options: TFNG },
    ],
  },
  {
    part: 2,
    range: [14, 26],
    title: 'Why we need silence',
    paragraphs: [
      'A  Humans are finely attuned to noise. Sounds give us vital information, helping us navigate the world and avoid danger. Loud or unexpected noises alter our internal chemistry: blood pressure rises, muscles tense and glands release hormones for fight or flight. Over the long term, these responses can lead to health issues from sleep disturbance to cardiovascular disease.',
      "B  The World Health Organization has designated excessive noise an underestimated threat to public health. A European report concluded that at least one in five people is consistently exposed to harmful levels. There are no 'earlids' that can protect the brain, says acoustic consultant Nick Antonio.",
      'C  Several cities have worked to turn the volume down. London introduced recommendations for quieter buses and reduced road and aircraft noise. Other cities have used noise-reducing road coatings and greenery. Washington DC banned petrol-powered leaf blowers, while New York approved fines for people who make vehicles noisier. Antonio expects more of this in the future.',
      "D  Researchers are investigating which silent experiences benefit health. A flotation tank is a lightproof, soundproof tank of salt water. Justin Feinstein explains that without external stimuli the brain tries to fill the void, sometimes creating humming sounds or visual effects. Focusing on the breath helps people reach a relaxed or meditative state.",
      "E  Feinstein's team recruited 50 people with stress-related conditions and asked them to complete a questionnaire before and after floating. After one hour, participants reported fewer symptoms, more relaxation and improved wellbeing. In another trial, flotation uniquely decreased activity in brain regions commonly linked with depression.",
      "F  Neurobiologist Tai Dotan Ben-Soussan says outer and inner quiet allow us to become more aware of our surroundings and respond appropriately. However, people must willingly engage in silence; when they do not want it, the experience can be distressing.",
      'G  Psychotherapy researcher Eric Pfeifer says people in heightened stress may need professional guidance to approach silence gradually. Complete silence is not necessary: participants relaxed more in an outdoor garden than in a totally silent room. He also believes frequent periods of only a few minutes can make a big difference.',
    ],
    questions: [
      { id: 14, kind: 'choice', prompt: 'Which section gives examples of strategies to decrease the noise the public are exposed to?', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
      { id: 15, kind: 'choice', prompt: 'Which section gives data indicating the extent of excessive noise?', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
      { id: 16, kind: 'choice', prompt: 'Which section describes physiological changes when we hear sudden noises?', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
      { id: 17, kind: 'choice', prompt: 'Which section shows a relatively quiet environment can be better than a totally silent one?', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
      { id: 18, kind: 'text', prompt: 'Flotation tanks allow people to concentrate on their own ______.', instruction: 'ONE WORD ONLY' },
      { id: 19, kind: 'text', prompt: 'The participants were given a ______ to complete before and after floating.', instruction: 'ONE WORD ONLY' },
      { id: 20, kind: 'text', prompt: 'Participants reported improved general ______.', instruction: 'ONE WORD ONLY' },
      { id: 21, kind: 'text', prompt: 'Brain scans revealed decreased activity in areas associated with ______.', instruction: 'ONE WORD ONLY' },
      { id: 22, kind: 'choice', prompt: 'Who says unwanted silence can be unpleasant and upsetting?', options: ['A · Nick Antonio', 'B · Justin Feinstein', 'C · Tai Dotan Ben-Soussan', 'D · Eric Pfeifer'] },
      { id: 23, kind: 'choice', prompt: 'Who says the trend towards quieter cities is likely to increase?', options: ['A · Nick Antonio', 'B · Justin Feinstein', 'C · Tai Dotan Ben-Soussan', 'D · Eric Pfeifer'] },
      { id: 24, kind: 'choice', prompt: 'Who says the mind creates images and sounds when sensory input is removed?', options: ['A · Nick Antonio', 'B · Justin Feinstein', 'C · Tai Dotan Ben-Soussan', 'D · Eric Pfeifer'] },
      { id: 25, kind: 'choice', prompt: 'Who says even a short period of silence can have a positive impact?', options: ['A · Nick Antonio', 'B · Justin Feinstein', 'C · Tai Dotan Ben-Soussan', 'D · Eric Pfeifer'] },
      { id: 26, kind: 'choice', prompt: 'Who says quietness makes us more conscious of our surroundings?', options: ['A · Nick Antonio', 'B · Justin Feinstein', 'C · Tai Dotan Ben-Soussan', 'D · Eric Pfeifer'] },
    ],
  },
  {
    part: 3,
    range: [27, 40],
    title: 'Book review: The World of Sugar by Ulbe Bosma',
    paragraphs: [
      "Ulbe Bosma's The World of Sugar is a global history covering cane and beet sugar. Beet sugar, grown mainly in Europe and the United States, has been massively subsidised and sold at artificially low prices, threatening cane-sugar producers.",
      'In Britain, cane sugar first came from slavery-dependent colonial plantations. After abolition it was imported from places that retained slavery, including Cuba and Brazil. Britain later imported beet sugar from continental Europe and developed a national beet industry in the twentieth century.',
      'The book investigates labour regimes associated with sugar. Contrary to popular belief, cane production was never restricted to large plantations. In Java, sugar cane was grown alongside rice in a labour-intensive system run by small farmers.',
      'Imported labour supported much large-scale production: German beet fields employed Polish workers, while Mexicans and Sicilians contributed to US production. Cane cutting remains poorly paid and brutal. Traditional methods on small farms continued to dominate in South Asia and Latin America.',
      'Sugar dynasties and corporations have influenced state policy. In the Caribbean, Cuba and the Philippines, a powerful sugar bourgeoisie played a major political role and its interests were protected by trade barriers and subsidies. Poor countries inevitably came off worse.',
      'Sugar production also required the extraction of sucrose, machinery, boiling and refinement. It was an energy-intensive industrial process. Techniques and varieties spread rapidly around the world in response to local needs.',
      'New techniques, fertilisers and irrigation turned sugar into a ubiquitous chemical and consumption increased enormously. Once regarded as a luxury, it was promoted as a valuable energy source. As consumption rose, so did harm to teeth and weight.',
      'High-fructose corn syrup, developed in Japan in the 1960s, has similar calories to table sugar but is cheaper to produce. It is widely used in soft drinks and processed foods and is regarded as a leading cause of obesity.',
      'Bosma shows that society could always have done without sugar and that alternative sources of sweetness exist. Yet many of the poorest people in the world still depend on it for their living.',
    ],
    questions: [
      { id: 27, kind: 'choice', prompt: 'What does the reviewer suggest about sugar in the first paragraph?', options: ['A · It shaped international relations', 'B · Beet sugar became more internationally competitive', 'C · Cane sugar is considered superior', 'D · New growing locations increased production'] },
      { id: 28, kind: 'choice', prompt: 'What is stressed about the British sugar market?', options: ['A · The sources changed over time', 'B · Agriculture affected trade', 'C · Demand increased', 'D · Ethical cultivation gained support'] },
      { id: 29, kind: 'choice', prompt: 'What is the reviewer doing in the third paragraph?', options: ['A · Describing an efficient approach', 'B · Explaining the decline of plantations', 'C · Addressing a misconception', 'D · Evaluating cultivation approaches'] },
      { id: 30, kind: 'choice', prompt: "What is the overall message of Bosma's book?", options: ['A · Sugar is harmful and unnecessary', 'B · Economic pressure should control production', 'C · Worker conditions should improve', 'D · Marketing caused disastrous consequences'] },
      { id: 31, kind: 'choice', prompt: 'Large sugar industries in Germany and the US depended on:', options: ['A · national governments', 'B · agricultural developments', 'C · less wealthy nations', 'D · untrained workers', 'E · small-scale cultivation', 'F · outdated methods', 'G · financial controls', 'H · migrant workers', 'I · powerful individuals and businesses'] },
      { id: 32, kind: 'choice', prompt: 'In South Asia and Latin America, this continued:', options: ['A · national governments', 'B · agricultural developments', 'C · less wealthy nations', 'D · untrained workers', 'E · small-scale cultivation', 'F · outdated methods', 'G · financial controls', 'H · migrant workers', 'I · powerful individuals and businesses'] },
      { id: 33, kind: 'choice', prompt: 'Sugar production also involved these groups, who protected their markets:', options: ['A · national governments', 'B · agricultural developments', 'C · less wealthy nations', 'D · untrained workers', 'E · small-scale cultivation', 'F · outdated methods', 'G · financial controls', 'H · migrant workers', 'I · powerful individuals and businesses'] },
      { id: 34, kind: 'choice', prompt: 'In Cuba, the sugar industry had a major influence on:', options: ['A · national governments', 'B · agricultural developments', 'C · less wealthy nations', 'D · untrained workers', 'E · small-scale cultivation', 'F · outdated methods', 'G · financial controls', 'H · migrant workers', 'I · powerful individuals and businesses'] },
      { id: 35, kind: 'choice', prompt: 'These were established to support sugar producers:', options: ['A · national governments', 'B · agricultural developments', 'C · less wealthy nations', 'D · untrained workers', 'E · small-scale cultivation', 'F · outdated methods', 'G · financial controls', 'H · migrant workers', 'I · powerful individuals and businesses'] },
      { id: 36, kind: 'choice', prompt: 'These were penalised as a result:', options: ['A · national governments', 'B · agricultural developments', 'C · less wealthy nations', 'D · untrained workers', 'E · small-scale cultivation', 'F · outdated methods', 'G · financial controls', 'H · migrant workers', 'I · powerful individuals and businesses'] },
      { id: 37, kind: 'choice', prompt: 'Sugar is now available in large quantities due to agricultural developments.', options: YNNG },
      { id: 38, kind: 'choice', prompt: 'Advertisers initially marketed sugar as a luxury product.', options: YNNG },
      { id: 39, kind: 'choice', prompt: 'The invention of high-fructose corn syrup was a positive development.', options: YNNG },
      { id: 40, kind: 'choice', prompt: 'High-fructose corn syrup is an ingredient in many processed foods.', options: YNNG },
    ],
  },
]

export const READING_ANSWERS: Record<number, string[]> = {
  1: ['lettuces'], 2: ['1,000 kg', '1000 kg'], 3: ['consumption', 'food consumption'], 4: ['pesticides'], 5: ['journeys'], 6: ['producers'], 7: ['flavour', 'flavor'],
  8: ['TRUE'], 9: ['NOT GIVEN'], 10: ['FALSE'], 11: ['TRUE'], 12: ['FALSE'], 13: ['NOT GIVEN'],
  14: ['C'], 15: ['B'], 16: ['A'], 17: ['G'], 18: ['breath'], 19: ['questionnaire'], 20: ['wellbeing'], 21: ['depression'],
  22: ['C'], 23: ['A'], 24: ['B'], 25: ['D'], 26: ['C'],
  27: ['B'], 28: ['A'], 29: ['C'], 30: ['A'], 31: ['H'], 32: ['E'], 33: ['I'], 34: ['A'], 35: ['G'], 36: ['C'],
  37: ['YES'], 38: ['NOT GIVEN'], 39: ['NO'], 40: ['YES'],
}
