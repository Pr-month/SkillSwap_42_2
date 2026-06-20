import styles from "./AppError.module.css";
import { Button } from "../../shared/ui/button/button";

type AppErrorProps = {
  title: string;
  description: string;
  icon?: string;
  onHomeClick?: () => void; // Обработчик для "На главную"
};

export function AppError({
  title,
  description,
  icon,
  onHomeClick,
}: AppErrorProps) {
  return (
    <section className={styles.error}>
      {icon && <img src={icon} alt="" className={styles.icon} />}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.button}>
        <Button type="secondary" fullWidth onClick={() => {}}>
          Сообщить об ошибке
        </Button>
        <Button type="primary" fullWidth onClick={onHomeClick}>
          На главную
        </Button>
      </div>
    </section>
  );
}
