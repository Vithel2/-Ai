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
 * Каждая из 5 сценок привязана РОВНО к одной покупке, иначе одна и та же
 * плашка-результат выпадала по три раза за игру.
 * Покупки выбраны из первых двух третей списка и по смыслу сценки —
 * привязанные к самым дорогим покупкам в конце игрок почти никогда не видел.
 * Все пять — покупки без ивентов, иначе ивент перекрыл бы сценку.
 */
export const PURCHASE_SCENES: Record<string, string> = {
  // 2-я покупка: рюкзак — школа, дз по английскому
  bag: "english",
  // 6-я: выбросить учебники — дз по башкирскому
  throw: "bashkir",
  // 14-я: подарок Злате — уже после её появления и до расставания
  "rat-gift": "intim-zlata",
  // 16-я: захват школы — параша
  capture: "parasha",
  // 20-я: запрет гигиены — с Сашей перестали общаться
  "ban-hygiene": "lonely",
}
