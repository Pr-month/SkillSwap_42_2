import style from "./sidebar.module.css";
import { RadioGroup } from "../../shared/ui/radio-group/radio-group";
import {
  CheckboxGroupList,
  CheckboxSubgroupList,
} from "../../shared/ui/checkbox-group";
import type { TCheckboxType } from "../../shared/ui/checkbox-group/checkbox/checkbox";
import type { TCheckboxGroupProps } from "../../shared/ui/checkbox-group/checkbox-group";
import type { TFilters } from "../../entities/types";
import { CrossIcon } from "../../assets/img/icons";
import { modeOptions, genderOptions } from "../../shared/lib/constants";
import { useSelector, useDispatch } from "../../features/store";
import { setFilters, resetFilters } from "../../features/filters/filtersSlice";
import {
  isNotEmptySelector,
  filtersCounterSelector,
} from "../../features/filters/filtersSlice";

export const Sidebar = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((store) => store.categories);
  const { cities } = useSelector((store) => store.cities);
  const { filters } = useSelector((store) => store.filters);
  const isNotEmpty = useSelector(isNotEmptySelector);
  const filtersCounter = useSelector(filtersCounterSelector);

  const skillsOptions: TCheckboxGroupProps[] = categories.map((cat) => ({
    category: {
      id: cat.id,
      name: cat.name,
      value: cat.id.toString(),
    },
    items: cat.subcategories.map((sub) => ({
      ...sub,
      value: sub.id.toString(),
    })),
    selectedItems: cat.subcategories
      .map((sub) => ({
        ...sub,
        value: sub.id.toString(),
      }))
      .filter((sub) => filters.skillIds.includes(sub.id)),
    handleSubItemChange: ({ id }: TCheckboxType) => {
      dispatch(
        setFilters({
          skillIds: filters.skillIds.includes(id)
            ? filters.skillIds.filter((v) => v !== id)
            : [...filters.skillIds, id],
        }),
      );
    },
  }));

  const citiesOptions: TCheckboxType[] = cities.map((city) => ({
    ...city,
    value: city.id.toString(),
  }));

  return (
    <div className={style.sidebar}>
      <div className={style.sidebar_title}>
        <p className={style.sidebar_title_text}>
          Фильтры
          {isNotEmpty && ` (${filtersCounter})`}
        </p>
        {isNotEmpty && (
          <button
            className={style.reset_button}
            onClick={() => dispatch(resetFilters())}
          >
            Сбросить{<CrossIcon />}
          </button>
        )}
      </div>
      <div className={style.sidebar_content}>
        <RadioGroup
          name="mode"
          title=""
          options={modeOptions}
          selected={
            modeOptions.find(({ value }) => value === filters.mode) ||
            modeOptions[0]
          }
          onChange={(option) =>
            dispatch(setFilters({ mode: option.value as TFilters["mode"] }))
          }
        />
        <CheckboxGroupList
          title="Навыки"
          buttonText="Все категории"
          limit={5}
          items={skillsOptions}
        />
        <RadioGroup
          name="gender"
          title="Пол автора"
          options={genderOptions}
          selected={
            genderOptions.find(({ value }) => value === filters.gender) ||
            genderOptions[0]
          }
          onChange={(option) =>
            dispatch(setFilters({ gender: option.value as TFilters["gender"] }))
          }
        />
        <CheckboxSubgroupList
          title="Города"
          buttonText="Все города"
          limit={5}
          items={citiesOptions}
          selectedItems={citiesOptions.filter((item) =>
            filters.cityNames.includes(item.name),
          )}
          handleSubItemChange={({ name }: TCheckboxType) => {
            dispatch(
              setFilters({
                cityNames: filters.cityNames.includes(name)
                  ? filters.cityNames.filter((v) => v !== name)
                  : [...filters.cityNames, name],
              }),
            );
          }}
        />
      </div>
    </div>
  );
};
