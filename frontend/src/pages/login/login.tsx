import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "../../features/store";
import { AuthForm } from "../../widgets/auth-form";
import { RegisterStepInfo } from "../../widgets/register-step-info";
import Lamp from "../../assets/icons/light-bulb.svg";
import styles from "./login.module.css";
import { selectLoginError, clearError } from "../../features/user/userSlice";
import { loginUser } from "../../features/user/actions";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authError = useSelector(selectLoginError);

  const handleSubmit = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    dispatch(clearError());

    const resultAction = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(resultAction)) {
      const from = (location.state as { from?: string } | null)?.from;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(-1);
      }
      return;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>Вход</div>
      <div className={styles.container}>
        <div className={styles.left}>
          <AuthForm
            mode="login"
            onSubmit={handleSubmit}
            submitButtonText="Войти"
            optionalLinkText="Зарегистрироваться"
            optionalLinkUrl="/register/step1"
            submitErrorText={
              authError
                ? "Email или пароль введён неверно. Пожалуйста проверьте правильность введённых данных"
                : null
            }
          />
        </div>

        <div className={styles.right}>
          <RegisterStepInfo
            image={Lamp}
            title="С возвращением в SkillSwap!"
            subtitle="Обменивайтесь знаниями и навыками с другими людьми"
          />
        </div>
      </div>
    </div>
  );
};
