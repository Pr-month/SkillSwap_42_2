import { Option, type TOptionType } from "./option";
import styles from "./style.module.css";

type TRadioGroupProps = {
  name: string;
  title: string;
  options: TOptionType[];
  selected: TOptionType;
  onChange: (option: TOptionType) => void;
};

export const RadioGroup = ({
  name,
  onChange,
  options,
  title,
  selected,
}: TRadioGroupProps) => {
  return (
    <div className={styles["radio-group"]}>
      {title && <div className={styles["radio-group__title"]}>{title}</div>}
      <div className={styles["radio-group__options"]}>
        {options.map((item, i) => (
          <Option
            selected={item.value === selected.value}
            groupName={name}
            onChange={onChange}
            title={item.title}
            value={item.value}
            key={i}
          />
        ))}
      </div>
    </div>
  );
};
