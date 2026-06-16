import styles from "./checkbox.module.css";
import { CheckboxIcon, ArrowIcon } from "../../../../assets/img/icons";
import type { ISubcategory } from "../../../../entities/types";
import { useId } from "react";

export type TCheckboxType = {
  value: string;
} & ISubcategory;

type TCheckboxProps = {
  isCategory: boolean;
  checked: boolean;
  onChange?: (option: TCheckboxType) => void;
  arrowOpened?: boolean;
} & TCheckboxType;

export const Checkbox = ({
  isCategory = false,
  id,
  name,
  value,
  checked,
  arrowOpened,
  onChange,
}: TCheckboxProps) => {
  const _id = `${value}-${useId()}`;
  return (
    <div key={value}>
      <input
        className="visually-hidden"
        type="checkbox"
        id={_id}
        name={name}
        value={value}
        onClick={() => {
          if (onChange) onChange({ name, value, id });
        }}
      />
      <label className={styles.checkbox} htmlFor={_id}>
        <div className={styles.checkbox_element}>
          <CheckboxIcon checked={checked} isCategory={isCategory} />
          {name}
        </div>
        {isCategory && <ArrowIcon initialRotation={0} opened={!!arrowOpened} />}
      </label>
    </div>
  );
};
