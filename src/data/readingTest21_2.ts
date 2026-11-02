import type { ReadingPassage } from './readingTest21'

const TFNG = ['TRUE', 'FALSE', 'NOT GIVEN']
const YNNG = ['YES', 'NO', 'NOT GIVEN']

export const READING_PASSAGES_21_T2: ReadingPassage[] = [
  {
    part: 1,
    range: [1, 13],
    title: 'Do animals dream?',
    paragraphs: [
      "Studies using electrodes attached to the heads of sleepers have shown that when we sleep, we do so in two ways that alternate throughout the night. The first is rapid eye movement (REM) or active sleep. During this stage our eyes move, even though our eyelids are closed. Our muscles also twitch slightly, though they are largely paralysed so we don't hurt ourselves. In contrast, we also engage in non-REM sleep, during which we barely move at all. Most dream states, and certainly those with the most vivid dreams, happen during REM sleep.",
      "There's some evidence that other mammals may also dream. For example, researchers compared the brain patterns of rats running through a maze when awake with their brain patterns during REM sleep. They found the patterns were very similar and concluded that the sleeping rats were dreaming about going through the maze.",
      "But finding evidence of dreaming in non-mammals has proved more difficult. Their brains are very different from those of humans, and it can often be difficult to record their activity while they are sleeping. Recently, however, researchers succeeded in recording brain activity in sleeping pigeons. As in mammals, the recordings revealed both REM and non-REM sleep. Intriguingly, REM sleep activity was high in brain regions involved in processing visual information, especially images related to physical activities such as flying, which suggests that this may possibly be what the pigeons were dreaming about.",
      "That said, dreaming and REM sleep are unlikely to be universal in the animal kingdom. For example, sponges don't have brains, so they lack the machinery for dreaming. There are also some animals with unusual sleep patterns. These include whales and dolphins, which do not shut down their entire brain when they sleep, but only half of it, keeping the rest awake. They also show no sign of REM sleep, suggesting that they may only experience non-REM dreams, which are less vivid. This is surprising because we tend to think of whales and dolphins as having complex inner lives. It's thought that they don't experience REM sleep because during REM sleep animals are more vulnerable to extremes of temperature.",
      "Nevertheless, in many cases REM sleep does seem to have benefits. Growing evidence from birds and mammals suggests that REM sleep and dreaming are important for forming memories and learning. It is believed that when events are replayed in dreams, this helps to integrate memories into longer-term storage. As soon as animals evolved moderately complex lifestyles, they would have needed to dream in order to manage these lifestyles.",
      "However, we still don't understand how this outward behaviour relates to internal experience. It seems impossible to know what it is like to be a rat or a pigeon, let alone imagine their dreamscapes. We are quick to interpret the twitching limbs and quiet barks of sleeping dogs, but the truth is that we don't know if there is an internal experience of chasing rabbits that comes along with that.",
      "Another non-human dreamer offers insight here. In 2019, while making a documentary, David Scheel of Alaska Pacific University in the USA housed an octopus named Heidi in a tank in his living room. At one point, in the middle of the night, Heidi seemed to dream: her limbs and head moved, and her skin rapidly changed colour, as though she was pursuing a crab.",
      "Similarly, a report recently emerged of a sleeping octopus apparently having a nightmare. Costello, as the octopus was called, thrashed around, extended his mantle as if trying to make himself look bigger, and squirted ink as though he were being attacked by a predator. The nightmare study is intriguing, says Scheel, but is only based on one animal. He argues that as well as outward behaviour, brain imaging is needed to show that the octopuses are replaying sequences of activities from their waking lives in dreams.",
      "The trouble is that we will never be able to experience any animal's dreams. That goes for other humans' dreams too. But we can try to imagine what these dreamscapes are like by meeting animals on their own terms. For example, vision is the dominant sense for many humans, and so our dreams are heavily visual too. Dogs primarily navigate the world using smell while spiders rely much more on vibrations.",
      "It is likely that dreaming has served multiple purposes since the first complex animals evolved. And if this is the case, it is possible that better understanding of these purposes might shed light on the true purpose of our own dreams."
    ],
    questions: [
      {
        id: 1,
        kind: 'text',
        prompt: 'Research findings: Similar brain patterns observed when active and sleeping in [1] (indicative of dreaming).',
        instruction: 'Choose ONE WORD ONLY from the passage for each answer.'
      },
      {
        id: 2,
        kind: 'text',
        prompt: 'Pigeons: when sleeping, displayed activity in parts of the brain that deal with [2] input (may have been dreaming of flying).',
        instruction: 'Choose ONE WORD ONLY from the passage for each answer.'
      },
      {
        id: 3,
        kind: 'text',
        prompt: 'Whales and dolphins: still have [3] their brain awake when they sleep.',
        instruction: 'Choose ONE WORD ONLY from the passage for each answer.'
      },
      {
        id: 4,
        kind: 'text',
        prompt: "Whales and dolphins: don't experience REM sleep, as this could affect their sensitivity to [4].",
        instruction: 'Choose ONE WORD ONLY from the passage for each answer.'
      },
      {
        id: 5,
        kind: 'text',
        prompt: 'Whales and dolphins: their dreams are probably not very [5].',
        instruction: 'Choose ONE WORD ONLY from the passage for each answer.'
      },
      {
        id: 6,
        kind: 'choice',
        prompt: 'Dreaming about past experiences helps us to create lasting memories of them.',
        options: TFNG,
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.'
      },
      {
        id: 7,
        kind: 'choice',
        prompt: 'It is now possible to tell what type of dream a dog is having.',
        options: TFNG,
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.'
      },
      {
        id: 8,
        kind: 'choice',
        prompt: "David Scheel's documentary was influential on other research into the sleeping patterns of octopuses.",
        options: TFNG,
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.'
      },
      {
        id: 9,
        kind: 'choice',
        prompt: 'While it was asleep, the octopus called Costello reacted as if it was hunting.',
        options: TFNG,
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.'
      },
      {
        id: 10,
        kind: 'choice',
        prompt: "Scheel believes more research into octopuses' dreams should be carried out.",
        options: TFNG,
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.'
      },
      {
        id: 11,
        kind: 'choice',
        prompt: 'We may soon be able to share the dreams of other human beings.',
        options: TFNG,
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.'
      },
      {
        id: 12,
        kind: 'choice',
        prompt: 'Hearing may be an important part of the dreams of some animals.',
        options: TFNG,
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.'
      },
      {
        id: 13,
        kind: 'choice',
        prompt: 'Interest in the reasons why humans dream has increased greatly in recent times.',
        options: TFNG,
        instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.'
      }
    ]
  },
  {
    part: 2,
    range: [14, 26],
    title: 'Mapungubwe',
    subtitle: 'Located in southern Africa just below the Limpopo River, the kingdom of Mapungubwe flourished between the 11th and 13th century CE',
    paragraphs: [
      "A Mapungubwe, which was one of the first states in southern Africa, was formed by Bantu-speaking peoples who were farmers. The area controlled by the rulers of Mapungubwe had at its heart a large sandstone plateau, which was easily defended due to its inaccessibility. As with other kingdoms in the region of southern Africa, cattle herding and other types of farming brought plenty of food and a surplus that could be traded for needed goods. Archaeology has revealed extensive layers of bones and manure, which indicate that from the 9th century CE there were large cattle herds, the traditional source of political power in southern African communities. The archaeological record for the 10th century shows a marked increase in the number of domesticated cattle in the area as well as cotton cultivation and weaving, as indicated by abundant finds of spindle whorls.",
      "B The total population of Mapungubwe at its peak in the mid-13th century was around 5,000 people. The chief or king of Mapungubwe was likely the wealthiest individual in the society, and would have owned more cattle and precious materials than anyone else. The king and his advisers dwelt in a stone enclosure composed of stone walls and housing built on the highest level of the community's territory, a natural sandstone hill which is some 30 metres high and 100 metres in length. Occupation on the hill dates from the 11th century and the entire complex was surrounded by a wooden palisade, as indicated by postholes made in the rock. The rest of the community lived in mud and thatch housing spread out below the hill, although there is one stone structure here. This settlement, known as Babandyanalo, covers around 5 hectares (12.3 acres) and predates the hilltop structures.",
      "C The kings of Mapungubwe were buried at the top of the hill site in a demarcated area away from the dwellings, while other members of the community were buried at the surrounding valley level. A wooden staircase connected the two levels, the sockets for the steps being clearly visible in the sandstone cliff face. There were some grander residences dotted around the outskirts of Babandyanalo, and these probably belonged to male relatives of the king. There are many other smaller but still impressive sites across the Mapungubwe plateau, which are located anywhere from 15 to 100 kilometres from the major hill site. Containing stone residences and walls, they likely belonged to local chiefs who acted as servants to the king.",
      "D The Mapungubwe plateau has a very high number of carnivore animal remains and ivory splinters, suggesting that the skins of these large animals and ivory elephant tusks were accumulated, probably for trade with coastal areas reached by the Limpopo River. The presence of glass beads, almost certainly from India, indicate there was trade of some sort with other states on the coast who, in turn, traded with merchants travelling from India by sea. Mapungubwe also benefitted from locally-sourced copper and the gold trade as it passed from the kingdom of Great Zimbabwe (12-15th century), situated to the north of Mapungubwe, to the coastal city of Kosala. It is likely that trade links led to a strengthening of political authority in order to control and even monopolise these lucrative interregional connections.",
      "E Archaeological discoveries reveal that pottery was produced on a scale large enough to suggest the presence of professional potters, and is another indicator of the prosperity of Mapungubwe society. Archaeological finds include spherical vessels with short necks, beakers, and bowls, many of which have decorative stamps. There are also ceramic discs, and whistles. In addition, cattle, sheep, and goat figurines, and small figures of highly stylised humans with elongated bodies and short limbs have been found. The figures may have been used in ceremonies as offerings to ancestors, but their precise function is not known. Other discoveries include small jewellery items made from locally sourced copper.",
      "F Beautifully decorated artefacts made of gold have also been found at Mapungubwe. A type of decoration, found nowhere else except Great Zimbabwe, involved the crafting of gold into small rectangular sheets and carving geometrical patterns into it. These sheets were then used to cover wooden objects (which have not survived) using small tacks, also made of gold. One such object that has been discovered may have been a sceptre, while additional evidence of local gold-working is a rhinoceros figurine made from small hammered sheets, and thousands of small gold beads. These objects were all found at the royal burial site and date to c. 1150. They are the first known indicators that gold had an intrinsic value of its own (as opposed to that of a currency) in southern Africa.",
      "G The kingdom of Mapungubwe was already in decline by the late 13th century, probably because overpopulation placed too much stress on local resources, a situation that may have been brought to a crisis point by a series of droughts. Trade routes may also have shifted northwards. Certainly, the areas that now prospered were to the north, such as Great Zimbabwe."
    ],
    questions: [
      {
        id: 14,
        kind: 'choice',
        prompt: 'a mention of the uncertainty regarding the purpose of certain objects',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information?'
      },
      {
        id: 15,
        kind: 'choice',
        prompt: 'the likelihood that a climatic factor increased the problems Mapungubwe faced',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information?'
      },
      {
        id: 16,
        kind: 'choice',
        prompt: "a mention of the location where members of the king's family are thought to have lived",
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information?'
      },
      {
        id: 17,
        kind: 'choice',
        prompt: 'a reference to people who brought goods by ship',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information?'
      },
      {
        id: 18,
        kind: 'choice',
        prompt: 'an estimate of the size to which the Mapungubwe community grew',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information?'
      },
      {
        id: 19,
        kind: 'choice',
        prompt: 'a mention of agricultural produce being exchanged for other items',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        instruction: 'Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information?'
      },
      {
        id: 20,
        kind: 'choice',
        prompt: 'The archaeological record reveals information about gold and the kingdom of Mapungubwe. Which piece of information is mentioned by the writer? (First)',
        options: [
          'A Not everyone in Mapungubwe used gold as a form of payment.',
          'B Items of gold were placed close to where Mapungubwe kings were buried.',
          'C The most valuable item discovered in Mapungubwe was a sceptre made of gold.',
          'D The way gold was decorated in Mapungubwe was also practised in another kingdom.',
          'E Working with gold was a respected occupation in the Mapungubwe community.'
        ],
        instruction: 'Choose TWO letters, A-E (Questions 20 and 21).'
      },
      {
        id: 21,
        kind: 'choice',
        prompt: 'The archaeological record reveals information about gold and the kingdom of Mapungubwe. Which piece of information is mentioned by the writer? (Second)',
        options: [
          'A Not everyone in Mapungubwe used gold as a form of payment.',
          'B Items of gold were placed close to where Mapungubwe kings were buried.',
          'C The most valuable item discovered in Mapungubwe was a sceptre made of gold.',
          'D The way gold was decorated in Mapungubwe was also practised in another kingdom.',
          'E Working with gold was a respected occupation in the Mapungubwe community.'
        ],
        instruction: 'Choose TWO letters, A-E (Questions 20 and 21).'
      },
      {
        id: 22,
        kind: 'text',
        prompt: "The Mapungubwe community's [22] is indicated by the amount of professionally made pottery discovered at the site.",
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.'
      },
      {
        id: 23,
        kind: 'text',
        prompt: 'Other finds include round ceramic objects, [23] and figures of various animals...',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.'
      },
      {
        id: 24,
        kind: 'text',
        prompt: '...as well as models of people with stretched [24].',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.'
      },
      {
        id: 25,
        kind: 'text',
        prompt: 'It is possible that these had a role in ceremonies to honour [25].',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.'
      },
      {
        id: 26,
        kind: 'text',
        prompt: 'In addition, pieces of [26] made from a local metal have been found at the site.',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.'
      }
    ]
  },
  {
    part: 3,
    range: [27, 40],
    title: 'Artificial Intelligence',
    paragraphs: [
      "In many countries in the West, hysteria about the future of artificial intelligence (AI) is everywhere. There seems to be no shortage of sensationalist news about how AI could cure diseases, accelerate human innovation and improve human creativity. Just looking at the media headlines, you might think that we are already living in a future where AI has infiltrated every aspect of society.",
      "While it is undeniable that AI has opened up a wealth of promising opportunities, it has also led to the emergence of a mindset that can be best described as 'AI solutionism'. This is the philosophy that, given enough data, machine learning algorithms can solve all of humanity's problems. But, in fact, instead of supporting AI progress, this mindset actually jeopardises the value of machine intelligence by disregarding important AI safety principles and setting unrealistic expectations about what AI can really do for humanity.",
      "In only a few years, AI solutionism has made its way from the technology evangelists' mouths in Silicon Valley in California to the minds of government officials and policymakers around the world. The pendulum has swung from the dystopian notion that AI will destroy humanity to the utopian belief that our algorithmic saviour is here.",
      "We are now seeing governments pledge support to national AI initiatives and compete in a technological race to dominate the burgeoning machine-learning sector. While many politicians proclaim the transformative effects of the coming 'AI revolution', they fail to realise the complexity around deploying advanced machine learning systems in the real world.",
      "One of the most promising varieties of AI technologies are neural networks. This form of machine learning is loosely modelled on the neuronal structure of the human brain, but on a much smaller scale. But what many politicians do not understand is that simply adding a neural network to a problem will not automatically mean that you'll find a solution. Similarly, adding a neural network to a system of government does not mean it will be instantaneously more inclusive or fair.",
      "AI systems need a lot of data to function, but the public sector typically does not have the appropriate data infrastructure to support advanced machine learning. Most of the data remains stored in offline archives. The few digitised sources of data that exist tend to be buried in bureaucracy. More often than not, data is spread across different government departments that each require special permissions to be accessed. Above all, the public sector typically lacks the human talent with the right technological capabilities to fully reap the benefits of machine intelligence.",
      "For these reasons, the sensationalism over AI has attracted many critics. Stuart Russell, a professor of computer science at the University of California, Berkeley, has long advocated a more sensible and realistic approach that focuses on simple everyday applications of AI instead of the hypothetical takeover by super-intelligent robots. Similarly, Rodney Brooks, professor of robotics at Massachusetts Institute of Technology, writes that 'almost all innovations in robotics and AI take far, far, longer to be really widely deployed than people in the field and outside the field imagine'.",
      "One of the many difficulties in deploying machine learning systems is that AI is extremely susceptible to adversarial attacks. This means that a malicious AI can target another AI to make it behave in a certain way, such as forcing it to make wrong predictions. Many researchers have warned against the rolling out of AI without appropriate security standards and defence mechanisms. Still, AI security remains an often overlooked topic when machine learning systems are installed.",
      "The medical profession has also recognised the drawbacks to AI. The IBM Watson for Oncology programme was a piece of AI that was meant to help doctors treat cancer. Even though it was developed to deliver the best recommendations, human experts found it hard to trust the machine. As a result, the AI programme was abandoned in most hospitals where it was trialled.",
      "Similar difficulties arose in the legal domain when algorithms were used in courts in the US to sentence criminals. An algorithm calculated risk assessment scores and advised judges on the sentencing. The system was found to amplify structural racial discrimination and was later abandoned.",
      "There are some crucial lessons here for everyone aiming to boost investments in national AI programmes. These examples demonstrate that there is no AI solution for everything. Using AI simply for the sake of AI may not always be productive or useful, and not every issue is best addressed by applying machine intelligence to it. All solutions come with a cost and not everything that can be automated should be.",
      "If we are to reap the benefits and minimise the potential harms of AI, we must start thinking about how machine learning can be meaningfully applied to specific areas of government, business and society. This means we need to have a discussion about AI ethics and the distrust that many people have towards machine learning. Most importantly, we need to be aware of the limitations of AI and where people still need to take the lead. Instead of painting an unrealistic picture of the power of AI, it is important to take a step back and separate the actual technological capabilities of AI from fantasy."
    ],
    questions: [
      {
        id: 27,
        kind: 'choice',
        prompt: 'What is the writer doing in the first paragraph?',
        options: [
          'A predicting the future impact of AI',
          'B describing a public perception of AI',
          'C outlining some possible benefits of AI',
          'D highlighting the breadth of the influence of AI'
        ],
        instruction: 'Choose the correct letter, A, B, C or D.'
      },
      {
        id: 28,
        kind: 'choice',
        prompt: 'When discussing AI solutionism in the second paragraph, the writer',
        options: [
          'A points out a risk involved.',
          'B specifies its probable origins.',
          'C mentions its chief supporters.',
          'D weighs up some pros and cons.'
        ],
        instruction: 'Choose the correct letter, A, B, C or D.'
      },
      {
        id: 29,
        kind: 'choice',
        prompt: 'In the fourth paragraph, the writer suggests that many politicians may',
        options: [
          'A have failed to appreciate the true potential of AI initiatives.',
          'B have misunderstood the function of the machine-learning sector.',
          'C be unaware of the challenges of implementing national AI initiatives.',
          'D be too keen to enter the race to dominate the machine-learning sector.'
        ],
        instruction: 'Choose the correct letter, A, B, C or D.'
      },
      {
        id: 30,
        kind: 'choice',
        prompt: 'Neural networks are a promising area of AI technology for governments. However, many politicians overestimate their capabilities, believing that the mere addition of a neural network will produce solutions and promote [30].',
        options: ['A reliability', 'B funding', 'C skills', 'D prejudices', 'E computers', 'F equality', 'G framework', 'H confidentiality', 'I approval'],
        instruction: 'Complete the summary using the list of words, A-I. Choose the correct letter, A-I.'
      },
      {
        id: 31,
        kind: 'choice',
        prompt: 'Most public sector organisations have not set up the necessary [31] to manage the huge amount of data required to enable AI to function.',
        options: ['A reliability', 'B funding', 'C skills', 'D prejudices', 'E computers', 'F equality', 'G framework', 'H confidentiality', 'I approval'],
        instruction: 'Complete the summary using the list of words, A-I. Choose the correct letter, A-I.'
      },
      {
        id: 32,
        kind: 'choice',
        prompt: 'Complex bureaucracy is another issue, as each person involved needs [32] to access the relevant data, which is often spread across different departments.',
        options: ['A reliability', 'B funding', 'C skills', 'D prejudices', 'E computers', 'F equality', 'G framework', 'H confidentiality', 'I approval'],
        instruction: 'Complete the summary using the list of words, A-I. Choose the correct letter, A-I.'
      },
      {
        id: 33,
        kind: 'choice',
        prompt: 'But the main problem is that few public sector employees have the [33] to take full advantage of machine intelligence.',
        options: ['A reliability', 'B funding', 'C skills', 'D prejudices', 'E computers', 'F equality', 'G framework', 'H confidentiality', 'I approval'],
        instruction: 'Complete the summary using the list of words, A-I. Choose the correct letter, A-I.'
      },
      {
        id: 34,
        kind: 'choice',
        prompt: 'The medical profession experimented with an AI programme, but their experts had little faith in its [34], and the programme was abandoned.',
        options: ['A reliability', 'B funding', 'C skills', 'D prejudices', 'E computers', 'F equality', 'G framework', 'H confidentiality', 'I approval'],
        instruction: 'Complete the summary using the list of words, A-I. Choose the correct letter, A-I.'
      },
      {
        id: 35,
        kind: 'choice',
        prompt: 'US courts also abandoned the use of algorithms when it was found that these reflected and magnified the existing [35] within the legal profession.',
        options: ['A reliability', 'B funding', 'C skills', 'D prejudices', 'E computers', 'F equality', 'G framework', 'H confidentiality', 'I approval'],
        instruction: 'Complete the summary using the list of words, A-I. Choose the correct letter, A-I.'
      },
      {
        id: 36,
        kind: 'choice',
        prompt: "Stuart Russell's proposals regarding the use of AI are impractical.",
        options: YNNG,
        instruction: 'Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.'
      },
      {
        id: 37,
        kind: 'choice',
        prompt: "Rodney Brooks' view has attracted unfair criticism from supporters of AI.",
        options: YNNG,
        instruction: 'Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.'
      },
      {
        id: 38,
        kind: 'choice',
        prompt: 'Nowadays, the need to protect AI systems is always taken into account when they are set up.',
        options: YNNG,
        instruction: 'Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.'
      },
      {
        id: 39,
        kind: 'choice',
        prompt: "In order to benefit from AI and minimise the harms, we have to explore people's concerns about its use.",
        options: YNNG,
        instruction: 'Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.'
      },
      {
        id: 40,
        kind: 'choice',
        prompt: 'What would be a suitable subtitle for Reading Passage 3?',
        options: [
          'A How to make the most of what AI has to offer',
          'B Why AI may not be the answer to our problems',
          'C Why governments should not invest in AI systems',
          'D How AI could improve the efficiency of the public sector'
        ],
        instruction: 'Choose the correct letter, A, B, C or D.'
      }
    ]
  }
]

export const READING_ANSWERS_21_T2: Record<number, string[]> = {
  1: ['rats', 'Rats'],
  2: ['visual', 'Visual'],
  3: ['half', 'Half'],
  4: ['temperature', 'Temperature', 'temperatures', 'Temperatures'],
  5: ['vivid', 'Vivid'],
  6: ['TRUE', 'True'],
  7: ['FALSE', 'False'],
  8: ['NOT GIVEN', 'NOTGIVEN', 'Not Given'],
  9: ['FALSE', 'False'],
  10: ['TRUE', 'True'],
  11: ['FALSE', 'False'],
  12: ['NOT GIVEN', 'NOTGIVEN', 'Not Given'],
  13: ['NOT GIVEN', 'NOTGIVEN', 'Not Given'],
  14: ['E'],
  15: ['G'],
  16: ['C'],
  17: ['D'],
  18: ['B'],
  19: ['A'],
  20: ['B'],
  21: ['D'],
  22: ['prosperity', 'Prosperity'],
  23: ['whistles', 'Whistles'],
  24: ['bodies', 'Bodies'],
  25: ['ancestors', 'Ancestors'],
  26: ['jewellery', 'jewelry', 'Jewellery', 'Jewelry'],
  27: ['B'],
  28: ['A'],
  29: ['C'],
  30: ['F'],
  31: ['G'],
  32: ['I'],
  33: ['C'],
  34: ['A'],
  35: ['D'],
  36: ['NO', 'No'],
  37: ['NOT GIVEN', 'NOTGIVEN', 'Not Given'],
  38: ['NO', 'No'],
  39: ['YES', 'Yes'],
  40: ['B']
}
