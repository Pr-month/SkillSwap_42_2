import { useMemo, type FC } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { Input } from "../../shared/ui/input";
import { DateSelectionInput } from "../../shared/ui/input/date-selection-input";
import { DropdownComponent } from "../../shared/ui/dropdown";
import { Button } from "../../shared/ui/button/button";
import { RegistrationAvatarField } from "../../pages/registration/registration-avatar";
import styles from "./user-data-reg-form.module.css";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector } from "../../features/store";
import { categoriesSelector } from "../../features/categories/categoriesSlice";
import { citiesSelector } from "../../features/cities/citiesSlice";
import { useRegistrationAvatar } from "../../shared/hooks/useRegistrationAvatar";
import { setRegFormState } from "../../features/forms/formsSlice";
import { useDispatch } from "../../features/store";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const gender = [
  { name: "Не указан", value: "not specified" },
  { name: "Мужской", value: "male" },
  { name: "Женский", value: "female" },
];

const userSchema = yup.object({
  avatar: yup.mixed<File>().nullable().optional(),
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
  categoriesWantToLearn: yup
    .array()
    .of(yup.string())
    .min(1, "Выберите хотя бы одну категорию")
    .required(),
  subcategoriesWantToLearn: yup
    .array()
    .of(yup.string())
    .min(1, "Выберите хотя бы одну подкатегорию")
    .required(),
});

type TUserData = yup.InferType<typeof userSchema>;

export const UserDataRegForm: FC = () => {
  const categories = useSelector(categoriesSelector);
  const cities = useSelector(citiesSelector);
  const { avatarFile, previewUrl, setAvatar } = useRegistrationAvatar();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reg } = useSelector((store) => store.forms);

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      name: category.name,
      value: category.id.toString(),
    }));
  }, [categories]);

  const {
    handleSubmit,
    control,
    trigger,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: reg.name || "",
      location: reg.location || "",
      categoriesWantToLearn: reg.categoryWantToLearn
        ? reg.categoryWantToLearn.map((cat) => cat.toString())
        : [],
      subcategoriesWantToLearn: reg.subcategoryWantToLearn
        ? reg.subcategoryWantToLearn.map((cat) => cat.toString())
        : [],
      gender: reg.gender || undefined,
      birthDate: reg.birthDate ? new Date(reg.birthDate) : undefined,
      // avatar: avatarFile || undefined, // doesnt work as default value. instead this see useEffect below
    },
    mode: "onChange",
  });

  useEffect(() => {
    setValue("avatar", avatarFile ?? null, {
      shouldValidate: true,
    });
  }, [avatarFile, setValue]); // necessary to autocomplete form cause tempImages at 1st render is undefined

  const selectedCategories = useWatch({
    control,
    name: "categoriesWantToLearn",
    defaultValue: [],
  });

  const availableSubcategories = useMemo(() => {
    if (!selectedCategories || selectedCategories.length === 0) {
      return [];
    }

    const selectedCategoryIds = selectedCategories.map((id) =>
      parseInt(id as string, 10),
    );
    const selectedCategoriesData = categories.filter((category) =>
      selectedCategoryIds.includes(category.id),
    );

    const allSubcategories: Array<{ name: string; value: string }> = [];
    selectedCategoriesData.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        allSubcategories.push({
          name: subcategory.name,
          value: subcategory.id.toString(),
        });
      });
    });

    return allSubcategories;
  }, [selectedCategories, categories]);

  const dispatchData = (data: TUserData) => {
    const dataToSend = {
      name: data.name,
      location: data.location,
      categoryWantToLearn: data.categoriesWantToLearn.map((id) =>
        parseInt(id as string, 10),
      ),
      subcategoryWantToLearn: data.subcategoriesWantToLearn.map((id) =>
        parseInt(id as string, 10),
      ),
      birthDate: data.birthDate?.toISOString() || "",
      gender: ["male", "female", "not specified"].includes(data.gender)
        ? data.gender
        : null,
    };
    dispatch(setRegFormState(dataToSend));
  };

  const onSubmit: SubmitHandler<TUserData> = (data) => {
    dispatchData(data);
    navigate("/register/step3");
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="avatar"
          control={control}
          render={({ field }) => (
            <RegistrationAvatarField
              avatarUrl={previewUrl}
              onAvatarChange={(file) => {
                setAvatar(file);
                field.onChange(file);
              }}
            />
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              placeholder={"Введите ваше имя"}
              label={"Имя"}
              onChange={(e) => {
                field.onChange(e.target.value);
                trigger("name");
              }}
              className={styles.element}
              isError={!!fieldState.error}
              hint={fieldState.error?.message}
            />
          )}
        />

        <div className={styles.section}>
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
          Категория навыка, которому хотите научиться
          <Controller
            name="categoriesWantToLearn"
            control={control}
            render={({ field, fieldState }) => (
              <DropdownComponent
                {...field}
                options={categoryOptions}
                placeholder={"Выберите категорию"}
                required={false}
                isMulti={true}
                closeMenuOnSelect={false}
                withCheckbox={true}
                value={field.value as string[]}
                onChange={(values) => {
                  field.onChange(values);
                  trigger("categoriesWantToLearn");
                }}
                error={fieldState.error?.message}
              />
            )}
          />
        </label>
        <label className={styles.label}>
          Подкатегория навыка, которому хотите научиться
          <Controller
            name="subcategoriesWantToLearn"
            control={control}
            render={({ field, fieldState }) => (
              <DropdownComponent
                {...field}
                options={availableSubcategories}
                placeholder={
                  availableSubcategories.length === 0
                    ? "Сначала выберите категорию"
                    : "Выберите подкатегорию"
                }
                required={false}
                isMulti={true}
                closeMenuOnSelect={false}
                withCheckbox={true}
                value={field.value as string[]}
                onChange={(values) => {
                  field.onChange(values);
                  trigger("subcategoriesWantToLearn");
                }}
                error={fieldState.error?.message}
                disabled={selectedCategories.length === 0}
              />
            )}
          />
        </label>

        <div className={styles.button_section}>
          <Button
            fullWidth
            type="secondary"
            onClick={() => {
              dispatchData(getValues());
              navigate("/register/step1", { state: { from: "step2" } });
            }}
            htmlType="button"
          >
            Назад
          </Button>
          <Button disabled={!isValid} fullWidth htmlType="submit">
            Продолжить
          </Button>
        </div>
      </form>
    </div>
  );
};
