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
    title: 'The Davies Sisters',
    subtitle: 'Between 1908 and 1924, Gwendoline and Margaret Davies amassed one of the largest collections of late-nineteenth and early-twentieth-century French paintings in Britain.',
    paragraphs: [
      'Gwendoline (1882–1951) and Margaret (1884–1963) Davies were the granddaughters of David Davies, a Welshman who amassed a fortune in the shipping and mining industries. In 1907, when Gwendoline came into her inheritance (Margaret would follow in 1909), the sisters were said to be the wealthiest unmarried women in Britain. Their religious upbringing in rural Wales gave them a deep sense of social responsibility and they chose to use their inheritance for cultural and philanthropic purposes.',
      "While there was no real family history of art collecting, the sisters' education was rigorously geared toward such pursuits. Their London school focused on cultural rather than academic study, and they travelled extensively with their governess, Jane Blaker, visiting art galleries and making extensive notes on the collections there.",
      "The sisters began to make regular art purchases from 1908, which roughly coincided with the dates of their inheritance. They took advice from various people, including the art dealer Hugh Blaker and David Croal Thompson. While it was long assumed that these men were largely responsible for the nature of the sisters' collection, it has recently been accepted that Gwendoline and Margaret retained a far more active role.",
      "The sisters' journals reveal their preference for Old Master paintings. Yet they initially made very few attempts to secure any such works. While wealthy in relative terms, their income was nothing compared with the fortunes of American collectors. Instead, their early purchases were of the fashionable, safe variety and included paintings by Jean-Baptiste-Camille Corot.",
      'Only a few years later their collecting took a new direction and they turned to the French Impressionists. Hugh Blaker, a champion of contemporary French art, had a hand in the decision. Their first purchases of Impressionist art, made in October 1912, were scenes of Venice by Claude Monet. Over the next 12 years, they amassed the bulk of their Impressionist collection.',
      "The First World War played a part in the collection's development. The sisters first financed the safe passage of artists from occupied Belgium to Wales. Later, both volunteered at a canteen for troops at Troyes in northern France.",
      "The work had a permanent effect on Gwendoline's health. On a trip to Paris, she acquired two works by Cezanne. They were shipped to Bath, where they became the first works by Cezanne displayed in a public gallery in Britain.",
      "Commentators have described the sisters as unlikely pioneer collectors, noting their isolation and lack of artist friends. Yet this meant they did not feel obliged to follow fashionable tastes. Although they relied on advisers, they made frequent trips to London and Paris and regularly had paintings sent home for consideration.",
      'By the early 1920s, Gwendoline felt increasingly uncomfortable buying art while faced with the poverty and upheaval created by the war. The sisters collected French Impressionist paintings at a time when such art was routinely ignored. Their collection was later donated to the National Museum Wales, creating a lasting cultural legacy.',
    ],
    questions: [
      { id: 1, kind: 'text', prompt: "Their grandfather's wealth came from ______ and transportation businesses.", instruction: 'ONE WORD ONLY' },
      { id: 2, kind: 'text', prompt: 'Their ______ was designed to give them an interest in activities such as collecting art.', instruction: 'ONE WORD ONLY' },
      { id: 3, kind: 'text', prompt: 'They took lengthy ______ about the things they saw in art galleries.', instruction: 'ONE WORD ONLY' },
      { id: 4, kind: 'text', prompt: 'Their ______ showed they liked Old Master paintings.', instruction: 'ONE WORD ONLY' },
      { id: 5, kind: 'text', prompt: 'The first Impressionist paintings they bought showed places in ______.', instruction: 'ONE WORD ONLY' },
      { id: 6, kind: 'text', prompt: 'They worked in a ______ for soldiers in France.', instruction: 'ONE WORD ONLY' },
      { id: 7, kind: 'text', prompt: 'They did not have any ______ who were artists.', instruction: 'ONE WORD ONLY' },
      { id: 8, kind: 'choice', prompt: "The Davies sisters' childhood influenced the way they decided to use their wealth.", options: TFNG },
      { id: 9, kind: 'choice', prompt: "The Corot paintings in the sisters' collection were purchased from a gallery in France.", options: TFNG },
      { id: 10, kind: 'choice', prompt: "Hugh Blaker opposed the sisters' decision to buy art by French Impressionists.", options: TFNG },
      { id: 11, kind: 'choice', prompt: 'The exhibition of Cezanne paintings at the Bath gallery was very popular with the public.', options: TFNG },
      { id: 12, kind: 'choice', prompt: 'The impact of the First World War encouraged Gwendoline to reconsider her interest in collecting art.', options: TFNG },
      { id: 13, kind: 'choice', prompt: 'The sisters bought French Impressionist art during a period when very few people were doing so.', options: TFNG },
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
  1: ['mining'], 2: ['education'], 3: ['notes'], 4: ['journals'], 5: ['venice'], 6: ['canteen'], 7: ['friends'],
  8: ['TRUE'], 9: ['NOT GIVEN'], 10: ['FALSE'], 11: ['NOT GIVEN'], 12: ['TRUE'], 13: ['TRUE'],
  14: ['C'], 15: ['B'], 16: ['A'], 17: ['G'], 18: ['breath'], 19: ['questionnaire'], 20: ['wellbeing'], 21: ['depression'],
  22: ['C'], 23: ['A'], 24: ['B'], 25: ['D'], 26: ['C'],
  27: ['B'], 28: ['A'], 29: ['C'], 30: ['A'], 31: ['H'], 32: ['E'], 33: ['I'], 34: ['A'], 35: ['G'], 36: ['C'],
  37: ['YES'], 38: ['NOT GIVEN'], 39: ['NO'], 40: ['YES'],
}
