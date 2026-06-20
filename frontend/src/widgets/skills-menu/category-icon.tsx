import { type ReactNode } from "react";
import styles from "./skills-menu.module.css";
import {
  BusinessIcon,
  LanguagesIcon,
  HomeIcon,
  CreativityIcon,
  EducationIcon,
  HealthIcon,
} from "../../assets/img/icons";

type CategoryIconProps = {
  categoryName: string;
};

const getCategoryIcon = (categoryName: string): ReactNode => {
  const iconMap: Record<string, ReactNode> = {
    "Бизнес и карьера": <BusinessIcon />,
    "Иностранные языки": <LanguagesIcon />,
    "Дом и уют": <HomeIcon />,
    "Творчество и искусство": <CreativityIcon />,
    "Образование и развитие": <EducationIcon />,
    "Здоровье и лайфстайл": <HealthIcon />,
  };
  return iconMap[categoryName] || null;
};

export const CategoryIcon = ({ categoryName }: CategoryIconProps) => {
  return (
    <span className={styles.categoryIcon}>{getCategoryIcon(categoryName)}</span>
  );
};
