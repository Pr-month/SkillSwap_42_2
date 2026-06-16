import type { TCheckboxGroupProps } from "./checkbox-group";
import { CheckboxGroup } from "./checkbox-group";
import style from "./checkbox-group.module.css";
import { ArrowIcon } from "../../../assets/img/icons";
import { useState } from "react";

export type TCheckboxGroupListProps = {
  title: string;
  items: TCheckboxGroupProps[];
  buttonText: string;
  limit?: number;
};

export const CheckboxGroupList = ({
  title,
  items,
  buttonText,
  limit = 2,
}: TCheckboxGroupListProps) => {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, limit);
  return (
    <div className={style.group_list}>
      <p className={style.group_list_title}>{title}</p>
      <div className={style.checkbox_group}>
        {visibleItems.map((item) => {
          return (
            <CheckboxGroup
              category={item.category}
              items={item.items}
              key={item.category.value}
              selectedItems={item.selectedItems}
              handleSubItemChange={item.handleSubItemChange}
            />
          );
        })}
      </div>
      <button
        className={style.all_categories}
        onClick={() => setExpanded(!expanded)}
      >
        {buttonText}
        <ArrowIcon initialRotation={0} opened={expanded} />
      </button>
    </div>
  );
};
