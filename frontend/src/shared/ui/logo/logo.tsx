import { Link } from "react-router-dom";
import { LogoIcon } from "../../../assets/img/icons/logo";
import style from "./logo.module.css";

export const Logo = () => {
  return (
    <Link to="/" className={style.logo}>
      <LogoIcon />
      <p className={style.logo_text}>SkillSwap</p>
    </Link>
  );
};
