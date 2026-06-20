import { useMemo, type FC } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import styles from "./user-skills-reg-form.module.css";
import { Button } from "../../shared/ui/button/button";
import { Input } from "../../shared/ui/input";
import { DropdownComponent } from "../../shared/ui/dropdown";
import { useSelector } from "../../features/store";
import { categoriesSelector } from "../../features/categories/categoriesSlice";
import ImageUploader from "../image-upload-widget/image-upload-widget";
import type { ISkillCategory, ISubcategory } from "../../entities/types";
import { useTempSkillImages } from "../../shared/hooks/useTempSkillImages";
import type { IUploadedFile } from "../../entities/types";
import { setRegFormState } from "../../features/forms/formsSlice";
import { useDispatch } from "../../features/store";
import { useNavigate } from "react-router-dom";

import { useEffect } from "react";

const skillsSchema = yup.object({
  name: yup
    .string()
    .required("Навык обязателен для заполнения")
    .matches(
      /^[а-яА-ЯёЁ\s-]+$/,
      "Навык может содержать только кириллические символы, пробелы и дефис",
    ),
  categoryId: yup.number().required("Категория обязательна для заполнения"),
  subCategoryId: yup
    .number()
    .required("Подкатегория обязательна для заполнения"),
  fullDescription: yup.string().required("Описание обязательно для заполнения"),
  images: yup
    .array()
    .of(yup.mixed<IUploadedFile>())
    .min(1, "Загрузите хотя бы одно изображение")
    .required("Изображения обязательны"),
});

type TUserSkills = yup.InferType<typeof skillsSchema>;

type TUserSkillsRegFormProps = {
  setIsProposalOpen: (open: boolean) => void;
};

export const UserSkillsRegForm: FC<TUserSkillsRegFormProps> = ({
  setIsProposalOpen,
}) => {
  const categoriesData = useSelector(categoriesSelector);
  const categoryOptions = useMemo(() => {
    return categoriesData.map((category: ISkillCategory) => ({
      name: category.name,
      value: category.id.toString(),
    }));
  }, [categoriesData]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reg } = useSelector((store) => store.forms);

  const { tempImages, addTempImages, removeTempImage } = useTempSkillImages();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm<TUserSkills>({
    resolver: yupResolver(skillsSchema),
    defaultValues: {
      name: reg.skillCanTeach.name || "",
      categoryId: reg.skillCanTeach.categoryId || undefined,
      subCategoryId: reg.skillCanTeach.subcategoryId || undefined,
      fullDescription: reg.skillCanTeach.description || "",
      // images: tempImages, // doesnt work as default value. instead this see useEffect below
    },
    mode: "onChange",
  });

  useEffect(() => {
    setValue("images", tempImages ?? [], {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [tempImages, setValue]); // necessary to autocomplete form cause tempImages at 1st render is undefined

  const selectedCategoryId = useWatch({
    control,
    name: "categoryId",
  });

  const subcategoryOptions = useMemo(() => {
    if (!selectedCategoryId) {
      return [];
    }

    const selectedCategoryData = categoriesData.find(
      (category: ISkillCategory) => selectedCategoryId === category.id,
    );

    return (selectedCategoryData?.subcategories || []).map(
      (subcategory: ISubcategory) => ({
        name: subcategory.name,
        value: subcategory.id.toString(),
      }),
    );
  }, [selectedCategoryId, categoriesData]);

  const dispatchSkill = (data: TUserSkills) => {
    const dataToSend = {
      name: data.name,
      categoryId: data.categoryId,
      subcategoryId: data.subCategoryId,
      description: data.fullDescription,
    };
    dispatch(setRegFormState({ skillCanTeach: dataToSend }));
  };

  const onSubmit: SubmitHandler<TUserSkills> = (data) => {
    dispatchSkill(data);
    setIsProposalOpen(true);
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              value={field.value}
              placeholder={"Введите название вашего навыка"}
              label={"Название навыка"}
              onChange={(e) => {
                field.onChange(e.target.value);
                trigger("name");
              }}
              isError={!!fieldState.error}
              hint={fieldState.error?.message}
            />
          )}
        />

        <label className={styles.label}>
          Категория навыка
          <Controller
            name="categoryId"
            control={control}
            render={({ field, fieldState }) => (
              <DropdownComponent
                options={categoryOptions}
                placeholder={"Выберите категорию навыка"}
                required={false}
                value={
                  field.value !== undefined && field.value !== null
                    ? field.value.toString()
                    : ""
                }
                onChange={(value: string | string[] | null) => {
                  if (typeof value === "string") {
                    const categoryId = value ? parseInt(value, 10) : undefined;
                    field.onChange(categoryId);
                    trigger("categoryId");
                  }
                }}
                error={fieldState.error?.message}
              />
            )}
          />
        </label>

        <label className={styles.label}>
          Подкатегория навыка
          <Controller
            name="subCategoryId"
            control={control}
            render={({ field, fieldState }) => (
              <DropdownComponent
                options={subcategoryOptions}
                placeholder={
                  !selectedCategoryId
                    ? "Сначала выберите категорию"
                    : "Выберите подкатегорию навыка"
                }
                required={false}
                value={
                  field.value !== undefined && field.value !== null
                    ? field.value.toString()
                    : ""
                }
                onChange={(value) => {
                  const stringValue = value as string;
                  const subCategoryId = stringValue
                    ? parseInt(stringValue, 10)
                    : undefined;
                  field.onChange(subCategoryId);
                  trigger("subCategoryId");
                }}
                error={fieldState.error?.message}
                disabled={!selectedCategoryId}
              />
            )}
          />
        </label>

        <label className={styles.label}>
          Описание
          <textarea
            {...register("fullDescription", { required: true })}
            rows={3}
            placeholder={"Коротко опишите, чему можете научить"}
            className={`${styles.textarea}  ${errors.fullDescription ? styles.textarea_error : ""}`}
          ></textarea>
          {errors.fullDescription && (
            <span className={styles.error}>
              {errors.fullDescription.message}
            </span>
          )}
        </label>

        <div>
          <ImageUploader
            onFilesUploaded={addTempImages}
            onFileRemoved={removeTempImage}
            state={tempImages}
            onChange={(newFiles) => {
              setValue("images", newFiles, { shouldValidate: true });
            }}
          />
          {errors.images && (
            <span className={styles.image_error}>{errors.images.message}</span>
          )}
        </div>

        <div className={styles.button_section}>
          <Button
            fullWidth
            type="secondary"
            onClick={() => {
              navigate("/register/step2");
              dispatchSkill(getValues());
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
