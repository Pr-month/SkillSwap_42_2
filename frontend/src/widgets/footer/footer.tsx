import { Logo } from "../../shared/ui/logo";
import { TextLink } from "../../shared/ui/text-link";
import style from "./footer.module.css";

export type TFooterProps = {
  allSkillsOnClick?: () => void;
};

export const Footer = ({ allSkillsOnClick }: TFooterProps) => {
  return (
    <div className={style.footer}>
      <div className={style.footer_logo_section}>
        <Logo />
        <p className={style.caption}>SkillSwap - 2025</p>
      </div>
      <nav className={style.footer_nav_section}>
        <div className={style.footer_nav_subsection}>
          <TextLink>О проекте</TextLink>
          <TextLink onClick={allSkillsOnClick}>Все навыки</TextLink>
        </div>
        <div className={style.footer_nav_subsection}>
          <TextLink>Контакты</TextLink>
          <TextLink>Блог</TextLink>
        </div>
        <div className={style.footer_nav_subsection}>
          <TextLink>Политика конфиденциальности</TextLink>
          <TextLink>Пользовательское соглашение</TextLink>
        </div>
      </nav>
    </div>
  );
};
