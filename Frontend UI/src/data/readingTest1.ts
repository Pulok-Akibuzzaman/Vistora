export type ReadingQuestion = {
  id: number
  kind: 'text' | 'choice'
  prompt: string
  options?: string[]
  instruction?: string
  explanation?: string
  passageReference?: string
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
      {
        id: 1,
        kind: 'text',
        prompt: 'Vertical tubes are used to grow strawberries, ______ and herbs.',
        instruction: 'NO MORE THAN TWO WORDS AND/OR A NUMBER',
        passageReference: 'Paragraph 1: "Strawberries that are small, intensely flavoured and resplendently red sprout abundantly from large plastic tubes... From identical vertical tubes nearby burst row upon row of lettuces; near those are aromatic herbs, such as basil, sage and peppermint."',
        explanation: 'Paragraph 1 describes what is grown in the vertical tubes: first strawberries, then from identical vertical tubes "row upon row of lettuces", followed by aromatic herbs. Therefore, the missing word is "lettuces".',
      },
      {
        id: 2,
        kind: 'text',
        prompt: 'There will eventually be a daily harvest of as much as ______ in weight of fruit and vegetables.',
        instruction: 'NO MORE THAN TWO WORDS AND/OR A NUMBER',
        passageReference: 'Paragraph 2: "When the remaining two thirds of the vast open area are in production, 20 staff will harvest up to 1,000 kg of perhaps 35 different varieties of fruit and vegetables, every day."',
        explanation: 'Paragraph 2 states that once the full rooftop area is in production, 20 staff will harvest "up to 1,000 kg" of fruit and vegetables every day. Thus, the expected daily harvest weight is "1,000 kg".',
      },
      {
        id: 3,
        kind: 'text',
        prompt: "It may be possible that the farm's produce will account for as much as 10% of the city's ______ overall.",
        instruction: 'NO MORE THAN TWO WORDS AND/OR A NUMBER',
        passageReference: 'Paragraph 2: "...there’s no reason why you shouldn’t eventually target maybe between 5% and 10% of consumption."',
        explanation: 'Pascal Hardy explains that if enough unused space is developed, urban farming can eventually target "between 5% and 10% of consumption" of the city.',
      },
      {
        id: 4,
        kind: 'text',
        prompt: 'Intensive farming (Growth): wide range of ______ used',
        instruction: 'ONE WORD ONLY',
        passageReference: 'Paragraph 3: "First, I don\'t much like the fact that most of the fruit and vegetables we eat have been treated with something like 17 different pesticides, or that the intensive farming techniques that produced them are such huge generators of greenhouse gases."',
        explanation: 'Under intensive farming, Hardy points out that produce is typically treated with "something like 17 different pesticides", which represents a wide range of pesticides used during cultivation.',
      },
      {
        id: 5,
        kind: 'text',
        prompt: 'Intensive farming (Selection): varieties of fruit and vegetables chosen that can survive long ______',
        instruction: 'ONE WORD ONLY',
        passageReference: 'Paragraph 3: "...because the varieties are selected for their capacity to withstand such substantial journeys..."',
        explanation: 'In intensive farming, commercial varieties are chosen for their "capacity to withstand such substantial journeys" (travelling 2,000 km), directly matching the table entry about surviving long "journeys".',
      },
      {
        id: 6,
        kind: 'text',
        prompt: 'Intensive farming (Sale): ______ receive very little of overall income',
        instruction: 'ONE WORD ONLY',
        passageReference: 'Paragraph 3: "...or that 80% of the price I pay goes to wholesalers and transport companies, not the producers."',
        explanation: 'Because 80% of the customer price goes to middlemen (wholesalers and transport companies), the original "producers" receive only a small fraction of the total income.',
      },
      {
        id: 7,
        kind: 'text',
        prompt: 'Aeroponic urban farming (Selection): produce chosen because of its ______',
        instruction: 'ONE WORD ONLY',
        passageReference: 'Paragraph 4: "You can select crop varieties for their flavour, not their resistance to the transport and storage chain, and you can pick them when they’re really at their best, and not before."',
        explanation: 'Because produce is grown and sold locally without needing to withstand long transit, growers can select varieties specifically for their "flavour" (or "flavor").',
      },
      {
        id: 8,
        kind: 'choice',
        prompt: 'Urban farming can take place above or below ground.',
        options: TFNG,
        passageReference: 'Paragraph 1 & 5: Paragraph 1 highlights rooftop farms ("world\'s largest urban rooftop farm"), and Paragraph 5 mentions that "mushrooms in underground carparks" are also grown.',
        explanation: 'The passage explicitly mentions urban farming on rooftops (above ground) and in underground carparks (below ground). Because the statement agrees with the information, the answer is TRUE.',
      },
      {
        id: 9,
        kind: 'choice',
        prompt: 'Some of the equipment used in aeroponic farming can be made by hand.',
        options: TFNG,
        passageReference: 'Paragraph 5: "The equipment weighs little, can be installed on almost any flat surface and is cheap to buy: roughly €100 to €150 per square metre."',
        explanation: 'The passage mentions the weight, installation flexibility, and retail purchase price of the equipment, but does not provide any information about whether equipment can be made by hand. Therefore, the answer is NOT GIVEN.',
      },
      {
        id: 10,
        kind: 'choice',
        prompt: 'Urban farming relies more on electricity than some other types of farming.',
        options: TFNG,
        passageReference: 'Paragraph 5: "It is cheap to run, too, consuming a tiny fraction of the electricity used by some techniques."',
        explanation: 'The text states that aeroponic farming consumes "a tiny fraction of the electricity used by some techniques", meaning it uses significantly less electricity, not more. Since this directly contradicts the statement, the answer is FALSE.',
      },
      {
        id: 11,
        kind: 'choice',
        prompt: 'Fruit and vegetables grown on an aeroponic urban farm are cheaper than traditionally grown organic produce.',
        options: TFNG,
        passageReference: 'Paragraph 6: "Produce grown this way typically sells at prices that, while generally higher than those of classic intensive agriculture, are lower than soil-based organic growers."',
        explanation: 'The passage explicitly states that prices are "lower than soil-based organic growers" (traditional organic produce). Lower prices mean cheaper, so the statement agrees with the text: TRUE.',
      },
      {
        id: 12,
        kind: 'choice',
        prompt: 'Most produce can be grown on an aeroponic urban farm at any time of the year.',
        options: TFNG,
        passageReference: 'Paragraph 6: "There are limits to what farmers can grow this way, of course, and much of the produce is suited to the summer months."',
        explanation: 'The passage states that "much of the produce is suited to the summer months" and highlights limitations, which contradicts the idea that most produce can be grown year-round. Therefore, the answer is FALSE.',
      },
      {
        id: 13,
        kind: 'choice',
        prompt: 'Beans take longer to grow on an urban farm than other vegetables.',
        options: TFNG,
        passageReference: 'Paragraph 6: "And beans tend to take up a lot of space for not much return."',
        explanation: 'Pascal Hardy notes that beans take up too much space for too little return, but gives no information regarding how long they take to grow compared to other vegetables. Thus, the answer is NOT GIVEN.',
      },
    ],
  },
  {
    part: 2,
    range: [14, 26],
    title: 'Forest management in Pennsylvania, USA',
    subtitle: 'How managing low-quality wood (also known as low-use wood) for bioenergy can encourage sustainable forest management',
    paragraphs: [
      "A.  A tree's 'value' depends on several factors including its species, size, form, condition, quality, function, and accessibility, and depends on the management goals for a given forest. The same tree can be valued very differently by each person who looks at it. A large, straight black cherry tree has high value as timber to be cut into logs or made into furniture, but for a landowner more interested in wildlife habitat, the real value of that stem (or trunk) may be the food it provides to animals. Likewise, if the tree suffers from black knot disease, its value for timber decreases, but to a woodworker interested in making bowls, it brings an opportunity for a unique and beautiful piece of art.",
      "B.  In the past, Pennsylvania landowners were solely interested in the value of their trees as high-quality timber. The norm was to remove the stems of highest quality and leave behind poorly formed trees that were not as well suited to the site where they grew. This practice, called 'high-grading', has left a legacy of 'low-use wood' in the forests. Some people even call these 'junk trees', and they are abundant in Pennsylvania. These trees have lower economic value for traditional timber markets, compete for growth with higher-value trees, shade out desirable regeneration and decrease the health of a stand* leaving it more vulnerable to poor weather and disease. Management that specifically targets low-use wood can help landowners manage these forest health issues, and wood energy markets help promote this.\n\n* Stand – An area covered with trees that have common features (e.g. size)",
      'C.  Wood energy markets can accept less expensive wood material of lower quality than would be suitable for traditional timber markets. Most wood used for energy in Pennsylvania is used to produce heat or electricity through combustion. Many schools and hospitals use wood boiler systems to heat and power their facilities, many homes are primarily heated with wood, and some coal plants incorporate wood into their coal streams to produce electricity. Wood can also be gasified for electrical generation and can even be made into liquid fuels like ethanol and gasoline for lorries and cars. All these products are made primarily from low-use wood. Several tree- and plant-cutting approaches, which could greatly improve the long-term quality of a forest, focus strongly or solely on the use of wood for those markets.',
      "D.  One such approach is called a Timber Stand Improvement (TSI) Cut. In a TSI Cut, really poor-quality tree and plant material is cut down to allow more space, light, and other resources to the highest-valued stems that remain. Removing invasive plants might be another primary goal of a TSI Cut. The stems that are left behind might then grow in size and develop more foliage and larger crowns or tops that produce more coverage for wildlife; they have a better chance to regenerate in a less crowded environment. TSI Cuts can be tailored to one farmer's specific management goals for his or her land.",
      'E.  Another approach that might yield a high amount of low-use wood is a Salvage Cut. With the many pests and pathogens visiting forests including hemlock wooly adelgid, Asian longhorned beetle, emerald ash borer, and gypsy moth, to name just a few, it is important to remember that those working in the forests can help ease these issues through cutting procedures. These types of cut reduce the number of sick trees and seek to manage the future spread of a pest problem. They leave vigorous trees that have stayed healthy enough to survive the outbreak.',
      'F.  A Shelterwood Cut, which only takes place in a mature forest that has already been thinned several times, involves removing all the mature trees when other seedlings have become established. This then allows the forester to decide which tree species are regenerated. It leaves a young forest where all trees are at a similar point in their growth. It can also be used to develop a two-tier forest so that there are two harvests and the money that comes in is spread out over a decade or more.',
      'G.  Thinnings and dense and dead wood removal for fire prevention also center on the production of low-use wood. However, it is important to remember that some retention of what many would classify as low-use wood is very important. The tops of trees that have been cut down should be left on the site so that their nutrients cycle back into the soil. In addition, trees with many cavities are extremely important habitats for insect predators like woodpeckers, bats and small mammals. They help control problem insects and increase the health and resilience of the forest. It is also important to remember that not all small trees are low-use. For example, many species like hawthorn provide food for wildlife. Finally, rare species of trees in a forest should also stay behind as they add to its structural diversity.',
    ],
    questions: [
      {
        id: 14,
        kind: 'choice',
        prompt: 'bad outcomes for a forest when people focus only on its financial reward',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'NB You may use any letter more than once.',
        passageReference: 'Paragraph B: "The norm was to remove the stems of highest quality and leave behind poorly formed trees... This practice, called \'high-grading\', has left a legacy of \'low-use wood\'... compete for growth with higher-value trees, shade out desirable regeneration and decrease the health of a stand leaving it more vulnerable to poor weather and disease."',
        explanation: 'Paragraph B describes the negative consequences ("bad outcomes") for a forest when landowners in the past focused exclusively on the economic value of high-quality timber ("financial reward"), leaving behind unhealthy stands vulnerable to weather and disease.',
      },
      {
        id: 15,
        kind: 'choice',
        prompt: 'reference to the aspects of any tree that contribute to its worth',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'NB You may use any letter more than once.',
        passageReference: 'Paragraph A: "A tree\'s \'value\' depends on several factors including its species, size, form, condition, quality, function, and accessibility, and depends on the management goals for a given forest."',
        explanation: 'Paragraph A details the various factors and characteristics (aspects) that determine a tree\'s value or worth, such as species, size, form, condition, quality, function, and accessibility.',
      },
      {
        id: 16,
        kind: 'choice',
        prompt: 'mention of the potential use of wood to help run vehicles',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'NB You may use any letter more than once.',
        passageReference: 'Paragraph C: "Wood can also be gasified for electrical generation and can even be made into liquid fuels like ethanol and gasoline for lorries and cars."',
        explanation: 'Paragraph C discusses how wood can be converted into liquid fuels such as ethanol and gasoline for lorries and cars ("wood to help run vehicles").',
      },
      {
        id: 17,
        kind: 'choice',
        prompt: 'examples of insects that attack trees',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'NB You may use any letter more than once.',
        passageReference: 'Paragraph E: "With the many pests and pathogens visiting forests including hemlock wooly adelgid, Asian longhorned beetle, emerald ash borer, and gypsy moth, to name just a few..."',
        explanation: 'Paragraph E lists specific examples of harmful insects attacking forest trees: hemlock wooly adelgid, Asian longhorned beetle, emerald ash borer, and gypsy moth.',
      },
      {
        id: 18,
        kind: 'choice',
        prompt: 'an alternative name for trees that produce low-use wood',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'NB You may use any letter more than once.',
        passageReference: 'Paragraph B: "This practice, called \'high-grading\', has left a legacy of \'low-use wood\' in the forests. Some people even call these \'junk trees\', and they are abundant in Pennsylvania."',
        explanation: 'Paragraph B states that trees producing low-use wood are also referred to as "junk trees" (an alternative name).',
      },
      {
        id: 19,
        kind: 'choice',
        prompt: 'to remove trees that are diseased',
        options: ['A · a TSI Cut', 'B · a Salvage Cut', 'C · a Shelterwood Cut'],
        instruction: 'NB You may use any letter more than once.',
        passageReference: 'Paragraph E: "Another approach that might yield a high amount of low-use wood is a Salvage Cut. With the many pests and pathogens visiting forests... These types of cut reduce the number of sick trees and seek to manage the future spread of a pest problem."',
        explanation: 'Paragraph E explains that a Salvage Cut is used to reduce the number of sick, pest-infested, or diseased trees in a forest.',
      },
      {
        id: 20,
        kind: 'choice',
        prompt: 'to generate income across a number of years',
        options: ['A · a TSI Cut', 'B · a Salvage Cut', 'C · a Shelterwood Cut'],
        instruction: 'NB You may use any letter more than once.',
        passageReference: 'Paragraph F: "A Shelterwood Cut... can also be used to develop a two-tier forest so that there are two harvests and the money that comes in is spread out over a decade or more."',
        explanation: 'Paragraph F notes that a Shelterwood Cut enables two separate harvests, spreading the income ("money that comes in") over ten years or more ("across a number of years").',
      },
      {
        id: 21,
        kind: 'choice',
        prompt: 'to create a forest whose trees are close in age',
        options: ['A · a TSI Cut', 'B · a Salvage Cut', 'C · a Shelterwood Cut'],
        instruction: 'NB You may use any letter more than once.',
        passageReference: 'Paragraph F: "A Shelterwood Cut... leaves a young forest where all trees are at a similar point in their growth."',
        explanation: 'Paragraph F points out that a Shelterwood Cut results in a young forest where all remaining trees are at a similar stage of growth ("close in age").',
      },
      {
        id: 22,
        kind: 'text',
        prompt: 'Some dead wood is removed to avoid the possibility of ______.',
        instruction: 'ONE WORD ONLY',
        passageReference: 'Paragraph G: "Thinnings and dense and dead wood removal for fire prevention also center on the production of low-use wood."',
        explanation: 'Paragraph G states that dense and dead wood is removed specifically for "fire prevention", avoiding the danger or possibility of fire.',
      },
      {
        id: 23,
        kind: 'text',
        prompt: 'The ______ from the tops of cut trees can help improve soil quality.',
        instruction: 'ONE WORD ONLY',
        passageReference: 'Paragraph G: "The tops of trees that have been cut down should be left on the site so that their nutrients cycle back into the soil."',
        explanation: 'Paragraph G specifies that leaving the tops of cut trees on site allows their "nutrients" to return to the soil and maintain soil health.',
      },
      {
        id: 24,
        kind: 'text',
        prompt: 'Some damaged trees should be left, as their ______ provide habitats for a range of creatures.',
        instruction: 'ONE WORD ONLY',
        passageReference: 'Paragraph G: "In addition, trees with many cavities are extremely important habitats for insect predators like woodpeckers, bats and small mammals."',
        explanation: 'Paragraph G mentions that trees containing "cavities" are vital habitats for woodpeckers, bats, and small mammals (a range of creatures).',
      },
      {
        id: 25,
        kind: 'text',
        prompt: 'Some trees that are small, such as ______ , are a source of food for animals and insects.',
        instruction: 'ONE WORD ONLY',
        passageReference: 'Paragraph G: "It is also important to remember that not all small trees are low-use. For example, many species like hawthorn provide food for wildlife."',
        explanation: 'Paragraph G highlights "hawthorn" as an example of a small tree that provides essential food for wildlife.',
      },
      {
        id: 26,
        kind: 'text',
        prompt: 'Any trees that are ______ should be left to grow, as they add to the variety of species in the forest.',
        instruction: 'ONE WORD ONLY',
        passageReference: 'Paragraph G: "Finally, rare species of trees in a forest should also stay behind as they add to its structural diversity."',
        explanation: 'Paragraph G states that "rare" tree species should be left in the forest because they contribute to structural diversity and variety of species.',
      },
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
  14: ['B'], 15: ['A'], 16: ['C'], 17: ['E'], 18: ['B'], 19: ['B', 'a Salvage Cut'], 20: ['C', 'a Shelterwood Cut'], 21: ['C', 'a Shelterwood Cut'],
  22: ['fire'], 23: ['nutrients'], 24: ['cavities'], 25: ['hawthorn'], 26: ['rare'],
  27: ['B'], 28: ['A'], 29: ['C'], 30: ['A'], 31: ['H'], 32: ['E'], 33: ['I'], 34: ['A'], 35: ['G'], 36: ['C'],
  37: ['YES'], 38: ['NOT GIVEN'], 39: ['NO'], 40: ['YES'],
}
