import type { FC } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input, PasswordInput } from "../../shared/ui/input";
import { Button } from "../../shared/ui/button/button";
import styles from "./styles.module.css";
import { TextLink } from "../../shared/ui/text-link";
import { useNavigate } from "react-router-dom";
import { useSelector } from "../../features/store";

type TAuthData = {
  email: string;
  password: string;
};

type TAuthFormMode = "login" | "register";

type TAuthFormProps = {
  onSubmit: ({ email, password }: TAuthData) => void;
  className?: string;
  submitButtonText: string;
  optionalLinkText?: string;
  optionalLinkUrl?: string;
  mode?: TAuthFormMode;
  submitErrorText?: string | null;
};

export const AuthForm: FC<TAuthFormProps> = ({
  onSubmit,
  className,
  submitButtonText,
  optionalLinkText,
  optionalLinkUrl,
  mode = "register",
  submitErrorText = null,
}) => {
  const { reg } = useSelector((store) => store.forms);
  const schema =
    mode === "login"
      ? yup.object().shape({
          email: yup
            .string()
            .email("Не похоже на email")
            .required("Это обязательное поле"),
          password: yup.string().required("Это обязательное поле"),
        })
      : yup.object().shape({
          email: yup
            .string()
            .email("Не похоже на email")
            .required("Это обязательное поле"),
          password: yup
            .string()
            .min(8, "Пароль должен содержать не менее 8 знаков")
            .required("Это обязательное поле"),
        });

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    getValues,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues:
      mode === "register"
        ? { email: reg.email || "", password: reg.password || "" }
        : { email: "", password: "" },
  });

  const navigate = useNavigate();

  const onError = () => {
    console.log();
  };

  return (
    <div className={`${styles.registration} ${className || ""}`}>
      <Button
        onClick={() => {}}
        className={styles.registration__link}
        fullWidth
        type="secondary"
        htmlType="button"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24.0002 12.2658C24.0002 11.2792 23.9185 10.5592 23.7417 9.8125H12.2451V14.2658H18.9934C18.8574 15.3725 18.1227 17.0392 16.49 18.1591L16.4671 18.3082L20.1021 21.0679L20.354 21.0925C22.6668 18.9991 24.0002 15.9191 24.0002 12.2658Z"
            fill="#4285F4"
          />
          <path
            d="M12.245 23.9997C15.551 23.9997 18.3265 22.933 20.3538 21.093L16.4898 18.1596C15.4558 18.8663 14.068 19.3596 12.245 19.3596C9.00688 19.3596 6.25861 17.2664 5.27892 14.373L5.13532 14.385L1.35558 17.2517L1.30615 17.3863C3.31974 21.3063 7.4558 23.9997 12.245 23.9997Z"
            fill="#34A853"
          />
          <path
            d="M5.27886 14.3731C5.02036 13.6265 4.87076 12.8264 4.87076 11.9998C4.87076 11.1731 5.02036 10.3731 5.26526 9.62643L5.25841 9.46741L1.43131 6.55469L1.30609 6.61306C0.476196 8.23974 0 10.0664 0 11.9998C0 13.9331 0.476196 15.7597 1.30609 17.3864L5.27886 14.3731Z"
            fill="#FBBC05"
          />
          <path
            d="M12.245 4.63997C14.5442 4.63997 16.0952 5.6133 16.9796 6.42669L20.4354 3.12C18.313 1.18667 15.551 0 12.245 0C7.4558 0 3.31974 2.69331 1.30615 6.61328L5.26532 9.62665C6.25861 6.73333 9.00688 4.63997 12.245 4.63997Z"
            fill="#EB4335"
          />
        </svg>
        Продолжить с Google
      </Button>

      <Button
        onClick={() => {}}
        className={styles.registration__link}
        fullWidth
        type="secondary"
        htmlType="button"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.6545 5.77578C11.3986 4.3804 12.0583 2.94439 12.8529 1.97664C13.7286 0.908854 15.2314 0.0899883 16.5157 0C16.7326 1.46297 16.1356 2.88836 15.3497 3.8966C14.5066 4.97974 13.0571 5.8197 11.6545 5.77578ZM19.1875 10.832C19.5849 9.72329 20.3722 8.72577 21.5935 8.05273C20.3593 6.5126 18.6265 5.61845 16.9912 5.61845C14.8277 5.61845 13.9129 6.64923 12.4102 6.64923C10.8621 6.64923 9.68774 5.61845 7.81372 5.61845C5.97605 5.61845 4.01993 6.73851 2.77935 8.65142C2.32321 9.3585 2.01422 10.2369 1.8457 11.2153C1.3781 13.96 2.07659 17.535 4.16018 20.7094C5.17325 22.2497 6.52359 23.9847 8.28766 23.9998C9.85912 24.0152 10.3049 22.9951 12.4323 22.9846C14.5628 22.9725 14.9666 24.0104 16.5359 23.9954C18.3005 23.9805 19.7252 22.0604 20.7383 20.5203C21.4596 19.4151 21.7324 18.8568 22.2933 17.6073C19.4412 16.5317 18.2681 13.3889 19.1875 10.832Z"
            fill="#253017"
          />
        </svg>
        Продолжить с Apple
      </Button>

      <div className={styles.registration__separator}>или</div>

      <form
        onSubmit={handleSubmit(() => {
          onSubmit(getValues() as TAuthData);
          reset();
        }, onError)}
      >
        <Input
          {...register("email")}
          isError={errors.email && touchedFields.email}
          name="email"
          label="Email"
          placeholder="Введите email"
          hint={errors.email && touchedFields.email ? errors.email.message : ""}
          className={styles.registration__input}
        ></Input>

        <PasswordInput
          {...register("password")}
          isError={errors.password && touchedFields.password}
          name="password"
          label="Пароль"
          placeholder={
            mode === "login"
              ? "Введите ваш пароль"
              : "Придумайте надежный пароль"
          }
          hint={
            touchedFields.password
              ? errors.password
                ? errors.password.message
                : mode === "login"
                  ? ""
                  : "Надежный"
              : mode === "login"
                ? ""
                : "Пароль должен содержать не менее 8 знаков"
          }
          className={`${styles.registration__input} ${styles.input_password}`}
        ></PasswordInput>
        {submitErrorText ? (
          <div className={styles.registration__error}>{submitErrorText}</div>
        ) : null}

        <Button
          disabled={!isValid}
          fullWidth
          onClick={() => {}}
          htmlType="submit"
        >
          {submitButtonText}
        </Button>

        {optionalLinkText && (
          <TextLink
            onClick={() => navigate(optionalLinkUrl || "/")}
            className={styles.registration__optional}
          >
            {optionalLinkText}
          </TextLink>
        )}
      </form>
    </div>
  );
};
