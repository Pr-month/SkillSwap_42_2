import { Checkbox, type TCheckboxType } from "../checkbox/checkbox";
import style from "./checkbox-subgroup.module.css";

export type TCheckboxSubgroupProps = {
  items: TCheckboxType[];
  selectedItems: string[];
  className?: string;
  limit?: number;
  onItemChange: (data: TCheckboxType) => void;
};

export const CheckboxSubgroup = ({
  items,
  selectedItems,
  className,
  onItemChange,
  limit,
}: TCheckboxSubgroupProps) => {
  const visibleItems = limit ? items.slice(0, limit) : items;
  return (
    <div className={`${style.checkbox_subgroup} ${className ? className : ""}`}>
      {visibleItems.map((item) => (
        <Checkbox
          key={item.id}
          id={item.id}
          name={item.name}
          value={item.value}
          isCategory={false}
          checked={selectedItems.includes(item.value)}
          onChange={onItemChange}
        />
      ))}
    </div>
  );
};
