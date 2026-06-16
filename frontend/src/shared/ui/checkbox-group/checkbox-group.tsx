import { CheckboxSubgroup } from "./checkbox-subgroup/checkbox-subgroup";
import type { TCheckboxSubgroupProps } from "./checkbox-subgroup/checkbox-subgroup";
import { Checkbox, type TCheckboxType } from "./checkbox/checkbox";
import style from "./checkbox-group.module.css";
import { useState } from "react";

export type TCheckboxGroupProps = {
  category: TCheckboxType;
  selectedItems: TCheckboxType[];
  handleSubItemChange: (item: TCheckboxType) => void;
} & Pick<TCheckboxSubgroupProps, "items">;

export const CheckboxGroup = ({
  category,
  items,
  selectedItems,
  handleSubItemChange,
}: TCheckboxGroupProps) => {
  const [categoryOpen, setCategoryOpen] = useState(false);

  return (
    <div className={`${style.checkbox_group}`}>
      <Checkbox
        isCategory
        id={category.id}
        name={category.name}
        value={category.value}
        checked={selectedItems.length > 0}
        arrowOpened={categoryOpen}
        onChange={() => setCategoryOpen(!categoryOpen)}
      />
      {categoryOpen && (
        <CheckboxSubgroup
          items={items}
          className={`${style.checkbox_subgroup}`}
          selectedItems={selectedItems.map((item) => item.value)}
          onItemChange={handleSubItemChange}
        />
      )}
    </div>
  );
};
