import type { TOptionType } from "../ui/radio-group/option";

// constants for filters

export const modeOptions: TOptionType[] = [
  { title: "Всё", value: "all" },
  { title: "Могу научить", value: "teach" },
  { title: "Хочу научиться", value: "learn" },
];

export const genderOptions: TOptionType[] = [
  { title: "Не имеет значения", value: "no_matter" },
  { title: "Мужской", value: "male" },
  { title: "Женский", value: "female" },
];

// constants for colors

export const categoryColors: Record<number, string> = {
  1: "var(--tag-business-color)",
  2: "var(--tag-art-color)",
  3: "var(--tag-languages-color)",
  4: "var(--tag-education-color)",
  5: "var(--tag-home-color)",
  6: "var(--tag-health-color)",
};

export const months: string[] = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const daysOfWeek: string[] = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
