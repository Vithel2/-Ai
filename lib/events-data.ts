export interface EventEffects {
  money?: number
  reputation?: number
  happiness?: number
  water?: number
  satiety?: number
}

export interface EventOutcome {
  /** вероятность исхода (0..1), сумма исходов = 1 */
  chance: number
  /** текст результата, который увидит игрок */
  text: string
  effects?: EventEffects
  /** секретная концовка (лампа джина) */
  secretEnding?: boolean
  /** финальная концовка (УЖИВИТИК 666) */
  finalEnding?: boolean
  /** пометить, что лампа не сработала — откроет ивент 10 */
  lampFailed?: boolean
}

export interface EventChoice {
  label: string
  outcomes: EventOutcome[]
}

export interface EventTriggerCtx {
  purchased: Set<string>
  reputation: number
  lampFailed: boolean
  eventsDone: Set<string>
}

export interface GameEvent {
  id: string
  img: string
  alt: string
  choices: EventChoice[]
  condition: (ctx: EventTriggerCtx) => boolean
}

// 10 ивентов. Показываются по одному разу, в порядке прогресса покупок,
// чтобы равномерно распределиться по игре.
export const GAME_EVENTS: GameEvent[] = [
  {
    id: "timofey",
    img: "/img/event-1-timofey.jpg",
    alt: "У Тимофея встал на башкирском",
    condition: ({ purchased }) => purchased.has("house"),
    choices: [
      { label: "Утешить", outcomes: [{ chance: 1, text: "Тимофей успокоился и отсыпал деньжат. +10$", effects: { money: 10 } }] },
      { label: "Похвалить", outcomes: [{ chance: 1, text: "Тимофей засмущался, но приятно. +5$", effects: { money: 5 } }] },
      { label: "Позавидовать", outcomes: [{ chance: 1, text: "Зависть до добра не доводит. -5$", effects: { money: -5 } }] },
    ],
  },
  {
    id: "parasha",
    img: "/img/event-2-parasha.jpg",
    alt: "Вы прогуливаете урок в параше",
    condition: ({ purchased }) => purchased.has("puddle"),
    choices: [
      {
        label: "Помериться с Буриком",
        outcomes: [
          { chance: 0.5, text: "У Саши больше! Уважение растёт. +5 репутации", effects: { reputation: 5 } },
          { chance: 0.5, text: "У Бурика больше... Позор. -2 репутации", effects: { reputation: -2 } },
        ],
      },
      { label: "Покакать", outcomes: [{ chance: 1, text: "Дело сделано. +1$", effects: { money: 1 } }] },
    ],
  },
  {
    id: "dianka",
    img: "/img/event-3-dianka.jpg",
    alt: "Тимерхун хвалит Дианку на математике",
    condition: ({ purchased }) => purchased.has("desk"),
    choices: [
      { label: "Похвалить Дианку", outcomes: [{ chance: 1, text: "Дианка довольна. +2 репутации", effects: { reputation: 2 } }] },
      { label: "Похвалить Тимерхуна", outcomes: [{ chance: 1, text: "Тимерхун оценил. +3 репутации", effects: { reputation: 3 } }] },
      { label: "Похвалить Бурика", outcomes: [{ chance: 1, text: "Бурик от неожиданности отдал заначку. +10$", effects: { money: 10 } }] },
    ],
  },
  {
    id: "rat",
    img: "/img/event-4-rat.jpg",
    alt: "Бурик украл крысу",
    condition: ({ purchased }) => purchased.has("production"),
    choices: [
      { label: "Поесть вместе", outcomes: [{ chance: 1, text: "Вкусно поели и заработали. +15$", effects: { money: 15 } }] },
      {
        label: "Помериться",
        outcomes: [
          { chance: 0.75, text: "У Саши больше! Бурик платит дань. +20$", effects: { money: 20 } },
          { chance: 0.25, text: "У Бурика больше... Пришлось платить. -30$", effects: { money: -30 } },
        ],
      },
    ],
  },
  {
    id: "zlata",
    img: "/img/event-5-zlata.jpg",
    alt: "Злата начала гулять с Буриком",
    condition: ({ purchased }) => purchased.has("zlata"),
    choices: [
      { label: "Отшлёпать Злату", outcomes: [{ chance: 1, text: "Злата довольна. +25 счастья, +25$", effects: { happiness: 25, money: 25 } }] },
      { label: "Отшлёпать Бурика", outcomes: [{ chance: 1, text: "Бурик наказан при всех. +15 репутации", effects: { reputation: 15 } }] },
    ],
  },
  {
    id: "krysyatinovo",
    img: "/img/event-6-krysyatinovo.jpg",
    alt: "В Крысятиново люди недовольны",
    condition: ({ purchased }) => purchased.has("rename"),
    choices: [
      { label: "Дать всем по крысе", outcomes: [{ chance: 1, text: "Народ накормлен. -20$, +10 репутации", effects: { money: -20, reputation: 10 } }] },
      { label: "Срать на главной площади", outcomes: [{ chance: 1, text: "Народ в восторге от смелости. +15 репутации", effects: { reputation: 15 } }] },
    ],
  },
  {
    id: "uzhivitik",
    img: "/img/event-7-uzhivitik.jpg",
    alt: "Арсений хочет снять фильм про уживитик два",
    condition: ({ purchased }) => purchased.has("ads"),
    choices: [
      { label: "Позвать ещё Бурика", outcomes: [{ chance: 1, text: "Кассовый успех! +30$", effects: { money: 30 } }] },
      { label: "Позвать Тимофея", outcomes: [{ chance: 1, text: "Критики оценили. +15 репутации", effects: { reputation: 15 } }] },
    ],
  },
  {
    id: "castle",
    img: "/img/event-8-castle.jpg",
    alt: "Тимофей насрал возле замка",
    condition: ({ purchased }) => purchased.has("castle"),
    choices: [
      { label: "Отшлёпать", outcomes: [{ chance: 1, text: "Справедливость восстановлена. +15 репутации", effects: { reputation: 15 } }] },
      { label: "Переспать с ним", outcomes: [{ chance: 1, text: "Ну... бывает. +50 счастья, +50 воды", effects: { happiness: 50, water: 50 } }] },
    ],
  },
  {
    id: "lamp",
    img: "/img/event-9-lamp.jpg",
    alt: "Саша нашёл лампу джина",
    condition: ({ purchased }) => purchased.has("emperor"),
    choices: [
      {
        label: "Потереть лампу",
        outcomes: [
          { chance: 0.8, text: "Джин промолчал... Лампа оказалась пустой.", lampFailed: true },
          { chance: 0.2, text: "ДЖИН УСЛЫШАЛ! +999 репутации", effects: { reputation: 999 }, secretEnding: true },
        ],
      },
      { label: "Выбросить", outcomes: [{ chance: 1, text: "Лампа улетела обратно в мусор.", lampFailed: true }] },
    ],
  },
  {
    id: "zhopa",
    img: "/img/event-10-zhopa.jpg",
    alt: "Арсений хочет снять ЖОПА ПОЛНАЯ 2 (УЖИВИТИК 666)",
    condition: ({ lampFailed, eventsDone }) => lampFailed && eventsDone.has("lamp"),
    choices: [{ label: "ДА", outcomes: [{ chance: 1, text: "", finalEnding: true }] }],
  },
]
