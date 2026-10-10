export type ListeningQuestion = {
  id: number
  kind: 'text' | 'choice'
  prompt: string
  options?: string[]
  instruction?: string
}

export type ListeningPart = {
  part: number
  title: string
  subtitle?: string
  questions: ListeningQuestion[]
  image?: string // e.g., for maps
}

export const LISTENING_PARTS_2: ListeningPart[] = [
  {
    part: 1,
    title: 'Working at Milo\'s Restaurants',
    questions: [
      {
        id: 1,
        kind: 'text',
        prompt: 'Benefits: ______ provided for all staff',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 2,
        kind: 'text',
        prompt: 'Benefits: ______ during weekdays at all Milo\'s Restaurants',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 3,
        kind: 'text',
        prompt: 'Benefits: ______ provided after midnight',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 4,
        kind: 'text',
        prompt: 'Person specification: must care about maintaining a high standard of ______',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 5,
        kind: 'text',
        prompt: 'Person specification: must have a qualification in ______',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 6,
        kind: 'text',
        prompt: 'Location: ______ Street | Job title: Breakfast supervisor',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 7,
        kind: 'text',
        prompt: 'Responsibilities include: Checking portions, etc. are correct. Making sure ______ is clean',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 8,
        kind: 'text',
        prompt: 'Pay and conditions: Starting salary £______ per hour. Start work at 5.30 a.m.',
        instruction: 'ONE WORD AND/OR A NUMBER'
      },
      {
        id: 9,
        kind: 'text',
        prompt: 'Location: City Road | Job title: Junior chef | Responsibilities include: Supporting senior chefs. Maintaining stock and organising ______',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 10,
        kind: 'text',
        prompt: 'Pay and conditions: Annual salary £23,000. No work on a ______ once a month.',
        instruction: 'ONE WORD ONLY'
      }
    ]
  },
  {
    part: 2,
    title: 'Planned housing development',
    questions: [
      {
        id: 11,
        kind: 'choice',
        prompt: 'What are the TWO main reasons why this site has been chosen for the housing development?',
        options: [
          'A · It has suitable geographical features.',
          'B · There is easy access to local facilities.',
          'C · It has good connections with the airport.',
          'D · The land is of little agricultural value.',
          'E · It will be convenient for workers.'
        ],
        instruction: 'Choose TWO letters, A–E.'
      },
      {
        id: 12,
        kind: 'choice',
        prompt: '(Second reason why this site has been chosen for the housing development)',
        options: [
          'A · It has suitable geographical features.',
          'B · There is easy access to local facilities.',
          'C · It has good connections with the airport.',
          'D · The land is of little agricultural value.',
          'E · It will be convenient for workers.'
        ]
      },
      {
        id: 13,
        kind: 'choice',
        prompt: 'Which TWO aspects of the planned housing development have people given positive feedback about?',
        options: [
          'A · the facilities for cyclists',
          'B · the impact on the environment',
          'C · the encouragement of good relations between residents',
          'D · the low cost of all the accommodation',
          'E · the rural location'
        ],
        instruction: 'Choose TWO letters, A–E.'
      },
      {
        id: 14,
        kind: 'choice',
        prompt: '(Second aspect of the planned housing development people have given positive feedback about)',
        options: [
          'A · the facilities for cyclists',
          'B · the impact on the environment',
          'C · the encouragement of good relations between residents',
          'D · the low cost of all the accommodation',
          'E · the rural location'
        ]
      },
      {
        id: 15,
        kind: 'text',
        prompt: 'Map Label: School',
        instruction: 'Write the correct letter, A–I'
      },
      {
        id: 16,
        kind: 'text',
        prompt: 'Map Label: Sports centre',
        instruction: 'Write the correct letter, A–I'
      },
      {
        id: 17,
        kind: 'text',
        prompt: 'Map Label: Clinic',
        instruction: 'Write the correct letter, A–I'
      },
      {
        id: 18,
        kind: 'text',
        prompt: 'Map Label: Community centre',
        instruction: 'Write the correct letter, A–I'
      },
      {
        id: 19,
        kind: 'text',
        prompt: 'Map Label: Supermarket',
        instruction: 'Write the correct letter, A–I'
      },
      {
        id: 20,
        kind: 'text',
        prompt: 'Map Label: Playground',
        instruction: 'Write the correct letter, A–I'
      }
    ]
  },
  {
    part: 3,
    title: 'The Laki eruption of 1783',
    questions: [
      {
        id: 21,
        kind: 'choice',
        prompt: 'Why do the students think the Laki eruption of 1783 is so important?',
        options: [
          'A · It was the most severe eruption in modern times.',
          'B · It led to the formal study of volcanoes.',
          'C · It had a profound effect on society.'
        ]
      },
      {
        id: 22,
        kind: 'choice',
        prompt: 'What surprised Adam about observations made at the time?',
        options: [
          'A · the number of places producing them',
          'B · the contradictions in them',
          'C · the lack of scientific data to support them'
        ]
      },
      {
        id: 23,
        kind: 'choice',
        prompt: 'According to Michelle, what did the contemporary sources say about the Laki haze?',
        options: [
          'A · People thought it was similar to ordinary fog.',
          'B · It was associated with health issues.',
          'C · It completely blocked out the sun for weeks.'
        ]
      },
      {
        id: 24,
        kind: 'choice',
        prompt: 'Adam corrects Michelle when she claims that Benjamin Franklin...',
        options: [
          'A · came to the wrong conclusion about the cause of the haze.',
          'B · was the first to identify the reason for the haze.',
          'C · supported the opinions of other observers about the haze.'
        ]
      },
      {
        id: 25,
        kind: 'choice',
        prompt: 'Which TWO issues following the Laki eruption surprised the students?',
        options: [
          'A · how widespread the effects were',
          'B · how long-lasting the effects were',
          'C · the number of deaths it caused',
          'D · the speed at which the volcanic ash cloud spread',
          'E · how people ignored the warning signs'
        ],
        instruction: 'Choose TWO letters, A–E.'
      },
      {
        id: 26,
        kind: 'choice',
        prompt: '(Second issue following the Laki eruption that surprised the students)',
        options: [
          'A · how widespread the effects were',
          'B · how long-lasting the effects were',
          'C · the number of deaths it caused',
          'D · the speed at which the volcanic ash cloud spread',
          'E · how people ignored the warning signs'
        ]
      },
      {
        id: 27,
        kind: 'choice',
        prompt: 'What comment do the students make about the impact of the Laki eruption on Iceland?',
        options: [
          'A · This country suffered the most severe loss of life.',
          'B · The impact on agriculture was predictable.',
          'C · There was a significant increase in deaths of young people.',
          'D · Animals suffered from a sickness.',
          'E · This country saw the highest rise in food prices in the world.',
          'F · It caused a particularly harsh winter.'
        ],
        instruction: 'Choose the correct letter, A–F.'
      },
      {
        id: 28,
        kind: 'choice',
        prompt: 'What comment do the students make about the impact of the Laki eruption on Egypt?',
        options: [
          'A · This country suffered the most severe loss of life.',
          'B · The impact on agriculture was predictable.',
          'C · There was a significant increase in deaths of young people.',
          'D · Animals suffered from a sickness.',
          'E · This country saw the highest rise in food prices in the world.',
          'F · It caused a particularly harsh winter.'
        ],
        instruction: 'Choose the correct letter, A–F.'
      },
      {
        id: 29,
        kind: 'choice',
        prompt: 'What comment do the students make about the impact of the Laki eruption on the UK?',
        options: [
          'A · This country suffered the most severe loss of life.',
          'B · The impact on agriculture was predictable.',
          'C · There was a significant increase in deaths of young people.',
          'D · Animals suffered from a sickness.',
          'E · This country saw the highest rise in food prices in the world.',
          'F · It caused a particularly harsh winter.'
        ],
        instruction: 'Choose the correct letter, A–F.'
      },
      {
        id: 30,
        kind: 'choice',
        prompt: 'What comment do the students make about the impact of the Laki eruption on the USA?',
        options: [
          'A · This country suffered the most severe loss of life.',
          'B · The impact on agriculture was predictable.',
          'C · There was a significant increase in deaths of young people.',
          'D · Animals suffered from a sickness.',
          'E · This country saw the highest rise in food prices in the world.',
          'F · It caused a particularly harsh winter.'
        ],
        instruction: 'Choose the correct letter, A–F.'
      }
    ]
  },
  {
    part: 4,
    title: 'Pockets',
    questions: [
      {
        id: 31,
        kind: 'text',
        prompt: 'Reason for choice of subject: They are ______ but can be overlooked by consumers and designers.',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 32,
        kind: 'text',
        prompt: 'Pockets in men\'s clothes: Men started to wear ______ in the 18th century.',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 33,
        kind: 'text',
        prompt: 'A ______ sewed pockets into the lining of the garments.',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 34,
        kind: 'text',
        prompt: 'Bigger pockets might be made for men who belonged to a certain type of ______.',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 35,
        kind: 'text',
        prompt: 'Pockets in women\'s clothes: Women\'s pockets were less ______ than men\'s.',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 36,
        kind: 'text',
        prompt: 'Women were very concerned about pickpockets. Pockets were produced in pairs using ______ to link them together.',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 37,
        kind: 'text',
        prompt: 'Pockets hung from the women\'s ______ under skirts and petticoats.',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 38,
        kind: 'text',
        prompt: 'Items such as ______ could be reached through a gap in the material.',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 39,
        kind: 'text',
        prompt: 'When dresses changed shape, hidden pockets had a negative effect on the ______ of women.',
        instruction: 'ONE WORD ONLY'
      },
      {
        id: 40,
        kind: 'text',
        prompt: 'Bags called \'pouches\' became popular, before women carried a ______.',
        instruction: 'ONE WORD ONLY'
      }
    ]
  }
]

export const LISTENING_ANSWERS_2: Record<number, string[]> = {
  1: ['training'],
  2: ['discount'],
  3: ['taxi'],
  4: ['service'],
  5: ['English'],
  6: ['Wivenhoe'],
  7: ['equipment'],
  8: ['9.75'],
  9: ['deliveries'],
  10: ['Sunday'],
  11: ['B', 'E'],
  12: ['B', 'E'],
  13: ['B', 'C'],
  14: ['B', 'C'],
  15: ['G'],
  16: ['C'],
  17: ['D'],
  18: ['B'],
  19: ['H'],
  20: ['A'],
  21: ['C'],
  22: ['A'],
  23: ['B'],
  24: ['B'],
  25: ['A', 'B'],
  26: ['A', 'B'],
  27: ['D'],
  28: ['A'],
  29: ['C'],
  30: ['F'],
  31: ['convenient'],
  32: ['suits'],
  33: ['tailor'],
  34: ['profession'],
  35: ['visible'],
  36: ['string', 'strings'],
  37: ['waist', 'waists'],
  38: ['perfume'],
  39: ['image'],
  40: ['handbag']
}
