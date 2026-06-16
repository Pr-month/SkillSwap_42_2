import { RegisterHeader } from "../../widgets/register-step-header";
import { AuthForm } from "../../widgets/auth-form";
import { RegisterStepInfo } from "../../widgets/register-step-info";
import Lamp from "../../assets/icons/light-bulb.svg";
import styles from "./register-step1.module.css";
import { useDispatch } from "../../features/store";
import { setRegFormState } from "../../features/forms/formsSlice";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { reset } from "../../features/forms/formsSlice";
import { useRegistrationAvatar } from "../../shared/hooks/useRegistrationAvatar";
import { useTempSkillImages } from "../../shared/hooks/useTempSkillImages";
import { useEffect } from "react";

export const RegisterStep1Page = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { discardAvatar } = useRegistrationAvatar();
  const { discardImages } = useTempSkillImages();

  useEffect(() => {
    const fromStep2 = location.state?.from === "step2";

    if (!fromStep2) {
      dispatch(reset());
      discardAvatar();
      discardImages();
    }
  }, [location.state, dispatch, discardAvatar, discardImages]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <RegisterHeader />
      </div>

      <div className={styles.container}>
        <div className={styles.left}>
          <AuthForm
            onSubmit={({ email, password }) => {
              dispatch(setRegFormState({ email, password }));
              navigate("/register/step2");
            }}
            submitButtonText="Далее"
            mode="register"
          />
        </div>

        <div className={styles.right}>
          <RegisterStepInfo
            image={Lamp}
            title="Добро пожаловать в SkillSwap!"
            subtitle="Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми"
          />
        </div>
      </div>
    </div>
  );
};
