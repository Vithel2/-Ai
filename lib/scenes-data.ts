// Мини-сценки после покупок, НЕ занятых ивентами.
// После такой покупки экран сменяется на фон школьного класса (scene-bg.png),
// посередине появляется кнопка. При нажатии — плашка-результат (resultImg).
// При появлении сценки играет звук двери класса (class-door).

export interface SceneButton {
  id: string
  img: string
  label: string
  /** Звук при нажатии на кнопку */
  sfx: string
  /** Плашка-результат после нажатия; null — картинка ещё не добавлена */
  resultImg: string | null
}

export const SCENE_BUTTONS: Record<string, SceneButton> = {
  english: {
    id: "english",
    img: "/img/scene-english.png",
    label: "Не сделать дз по английскому",
    sfx: "english-two",
    resultImg: "/img/scene-result-english.png",
  },
  bashkir: {
    id: "bashkir",
    img: "/img/scene-bashkir.png",
    label: "Не сделать дз по башкирскому",
    sfx: "bashkir-two",
    resultImg: "/img/scene-result-bashkir.png",
  },
  "intim-zlata": {
    id: "intim-zlata",
    img: "/img/scene-intim-zlata.png",
    label: "Снять интим ролик со Златой",
    sfx: "zlata-creak",
    resultImg: "/img/scene-result-intim-zlata.png",
  },
  parasha: {
    id: "parasha",
    img: "/img/scene-parasha.png",
    label: "Войти в парашу",
    sfx: "danil-brag",
    resultImg: "/img/scene-result-parasha.png",
  },
  lonely: {
    id: "lonely",
    img: "/img/scene-lonely.png",
    label: "С Сашей перестали все общаться",
    sfx: "sasha-sigh",
    resultImg: "/img/scene-result-lonely.png",
  },
}

/**
 * Какая сценка показывается после какой покупки.
 * Здесь только покупки БЕЗ ивентов — по 3 сценки на каждую из 5 кнопок.
 * Интим со Златой — только после её появления (покупка zlata) и до расставания (breakup-zlata).
 */
export const PURCHASE_SCENES: Record<string, string> = {
  bag: "english",
  throw: "bashkir",
  "rat-gift": "intim-zlata",
  capture: "parasha",
  rebuild: "english",
  "fart-director": "bashkir",
  "ban-hygiene": "lonely",
  "ban-washing": "parasha",
  "car-production": "intim-zlata",
  protests: "lonely",
  lavrushka: "intim-zlata",
  "breakup-zlata": "lonely",
  statue: "bashkir",
  "date-artem": "parasha",
  "sleep-artem": "english",
}
