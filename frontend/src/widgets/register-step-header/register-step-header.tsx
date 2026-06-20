import styles from "./register-step-header.module.css";
import { useLocation } from "react-router-dom";

export const RegisterHeader = () => {
  const location = useLocation();
  const step = Number(location.pathname.split("step")[1]);

  return (
    <div className={styles.header}>
      <div className={styles.title}>Шаг {step} из 3</div>

      <div className={styles.lines}>
        <div className={`${styles.line} ${step >= 1 ? styles.active : ""}`} />
        <div className={`${styles.line} ${step >= 2 ? styles.active : ""}`} />
        <div className={`${styles.line} ${step >= 3 ? styles.active : ""}`} />
      </div>
    </div>
  );
};
