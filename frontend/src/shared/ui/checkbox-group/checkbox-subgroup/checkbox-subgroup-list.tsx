import type { TCheckboxSubgroupProps } from "./checkbox-subgroup";
import { CheckboxSubgroup } from "./checkbox-subgroup";
import type { TCheckboxType } from "../checkbox/checkbox";
import style from "./checkbox-subgroup.module.css";
import { ArrowIcon } from "../../../../assets/img/icons";
import { useState } from "react";

export type TCheckboxSubgroupListProps = {
  title: string;
  buttonText: string;
  limit?: number;
  selectedItems: TCheckboxType[];
  handleSubItemChange: (item: TCheckboxType) => void;
} & Pick<TCheckboxSubgroupProps, "items">;

export const CheckboxSubgroupList = ({
  title,
  items,
  buttonText,
  limit,
  selectedItems,
  handleSubItemChange,
}: TCheckboxSubgroupListProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={style.subgroup_list}>
      <p className={style.subgroup_list_title}>{title}</p>
      <CheckboxSubgroup
        items={items}
        className={`${style.checkbox_subgroup}`}
        selectedItems={selectedItems.map((item) => item.value)}
        onItemChange={handleSubItemChange}
        limit={expanded ? undefined : limit}
      />
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
