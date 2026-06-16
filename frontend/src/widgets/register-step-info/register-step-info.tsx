import { type FC } from "react";
import styles from "./register-step-info.module.css";

interface IRegisterStepInfoProps {
  image: string;
  title: string;
  subtitle: string;
}

export const RegisterStepInfo: FC<IRegisterStepInfoProps> = ({
  image,
  title,
  subtitle,
}) => {
  return (
    <div className={styles.wrapper}>
      <img src={image} alt={title} className={styles.image} />

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
};
