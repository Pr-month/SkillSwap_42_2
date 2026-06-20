import styles from "./NotFound404.module.css";
import { AppError } from "../../widgets/AppError/AppError";
import error_404 from "../../assets/icons/error_404.svg";
import { useNavigate } from "react-router-dom";

export function NotFound404() {
  const navigate = useNavigate();
  const navigateToHome = () => {
    navigate("/");
  };

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <AppError
          title="Страница не найдена"
          description="К сожалению, эта страница недоступна. Вернитесь на главную страницу или попробуйте позже"
          icon={error_404}
          onHomeClick={navigateToHome}
        />
      </main>
    </div>
  );
}
