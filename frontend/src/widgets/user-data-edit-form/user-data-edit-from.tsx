import styles from "./user-data-edit-from.module.css";

import {
  Controller,
  useForm,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "../../features/store";
import { useEffect, useMemo } from "react";

import { EditInput } from "../../shared/ui/input";
import { Button } from "../../shared/ui/button/button";
import { DateSelectionInput } from "../../shared/ui/input/date-selection-input";
import { DropdownComponent } from "../../shared/ui/dropdown";
import { EditTextarea } from "../../shared/ui/edit-textarea";
import { ProfileAvatar } from "../../pages/profile/personal-data/avatar";
import { updateUserAvatar, updateUserData } from "../../features/user/actions";
import { useRegistrationAvatar } from "../../shared/hooks/useRegistrationAvatar";

const gender = [
  { name: "Не указан", value: "not specified" },
  { name: "Мужской", value: "male" },
  { name: "Женский", value: "female" },
];

const userDataSchema = yup.object({
  name: yup
    .string()
    .required("Имя обязательно для заполнения")
    .matches(
      /^[a-zA-Zа-яА-ЯёЁ-]+$/,
      "Имя может содержать только кириллические/латинские символы и дефис",
    ),
  birthDate: yup.date().nullable().required("Дата рождения обязательна"),
  gender: yup
    .string()
    .oneOf(["male", "female", "not specified"])
    .required("Выберите пол"),
  location: yup.string().required("Выберите город"),
  email: yup.string().email("Некорректный email").required("Email обязателен"),
  description: yup.string().required(),
  avatar: yup.mixed<File>().nullable().optional(),
});

type TUserData = yup.InferType<typeof userDataSchema>;

export const UserDataEditFrom = () => {
  const dispatch = useDispatch();
  const { avatarFile, previewUrl, setAvatar, discardAvatar } =
    useRegistrationAvatar();
  const { cities } = useSelector((store) => store.cities);
  const { currentUser } = useSelector((store) => store.auth);

  const defaultValues: TUserData = useMemo(() => {
    return {
      name: "",
      email: "",
      birthDate: new Date(),
      gender: "not specified",
      location: "",
      description: "",
      //avatar: null, // doesnt work as default value. instead this see useEffect below
    };
  }, []);

  const {
    handleSubmit,
    control,
    reset,
    trigger,
    formState: { isValid, isDirty },
    setValue,
  } = useForm<TUserData>({
    resolver: yupResolver(userDataSchema) as Resolver<TUserData>,
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    setValue("avatar", avatarFile ?? undefined, {
      shouldValidate: true,
    });
  }, [avatarFile, setValue]);

  useEffect(() => {
    if (currentUser)
      reset({
        ...defaultValues,
        ...{
          name: currentUser.name,
          email: currentUser.email,
          birthDate: new Date(currentUser.birthDate),
          gender:
            currentUser.gender === "male" || currentUser.gender === "female"
              ? currentUser.gender
              : "not specified",
          location: currentUser.location,
          description: currentUser.description,
        },
      });
  }, [currentUser, defaultValues, reset]);

  const onSubmit: SubmitHandler<TUserData> = (data) => {
    const dataToSend = {
      name: data.name,
      email: data.email,
      location: data.location,
      birthDate: data.birthDate.toISOString(),
      gender: ["male", "female", "not specified"].includes(data.gender)
        ? data.gender
        : null,
      userDescription: data.description,
    };
    dispatch(updateUserData(dataToSend));
    if (avatarFile) {
      const data = { avatar: avatarFile, id: currentUser!.id.toString() };
      dispatch(updateUserAvatar(data));
      discardAvatar();
    }
    reset(data);
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.text_data_wrapper}>
          <div>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <EditInput
                  {...field}
                  placeholder={"Введите вашу почту"}
                  label={"Почта"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    trigger("email");
                  }}
                  isError={!!fieldState.error}
                  hint={fieldState.error?.message}
                />
              )}
            />
            <Button
              type="tertiary"
              onClick={() => {}}
              className={styles.change_password_button}
            >
              Изменить пароль
            </Button>
          </div>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <EditInput
                {...field}
                placeholder={"Введите ваше имя"}
                label={"Имя"}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  trigger("name");
                }}
                isError={!!fieldState.error}
                hint={fieldState.error?.message}
              />
            )}
          />
          <div className={styles.data_gender_section}>
            <div className={styles.calendar}>
              <Controller
                name="birthDate"
                control={control}
                render={({ field, fieldState }) => (
                  <DateSelectionInput
                    selectedDate={field.value ? new Date(field.value) : null}
                    onDateChange={(date) => {
                      field.onChange(date);
                      if (!date) {
                        trigger("birthDate");
                      }
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
            <label className={`${styles.label} ${styles.width}`}>
              Пол
              <Controller
                name="gender"
                control={control}
                render={({ field, fieldState }) => (
                  <DropdownComponent
                    {...field}
                    options={gender}
                    placeholder={"Не указан"}
                    required={false}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      trigger("gender");
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </label>
          </div>
          <label className={styles.label}>
            Город
            <Controller
              name="location"
              control={control}
              render={({ field, fieldState }) => (
                <DropdownComponent
                  {...field}
                  options={cities}
                  placeholder={"Не указан"}
                  required={false}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    trigger("location");
                  }}
                  error={fieldState.error?.message}
                />
              )}
            />
          </label>
          <label className={styles.label}>
            О себе
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <EditTextarea
                  {...field}
                  placeholder={"Введите описание"}
                  label={"Описание"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    trigger("description");
                  }}
                  className={styles.description_field}
                  hint={fieldState.error?.message}
                />
              )}
            />
          </label>
        </div>
        <div className={styles.avatar_section}>
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => (
              <ProfileAvatar
                avatarUrl={previewUrl}
                onAvatarChange={(file) => {
                  setAvatar(file);
                  field.onChange(file);
                }}
              />
            )}
          />
        </div>
        <Button
          onClick={() => {}}
          fullWidth
          disabled={!isValid || !isDirty}
          htmlType="submit"
        >
          Сохранить
        </Button>
      </form>
    </div>
  );
};
