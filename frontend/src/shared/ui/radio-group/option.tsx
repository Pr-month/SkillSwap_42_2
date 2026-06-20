import styles from "./style.module.css";

export type TOptionType = {
  title: string;
  value: string;
};

type TOptionProps = {
  selected?: boolean;
  onChange: (option: TOptionType) => void;
  groupName: string;
} & TOptionType;

export const Option = ({
  title,
  value,
  onChange,
  selected,
  groupName,
}: TOptionProps) => {
  const handleChange = () => onChange({ title, value });
  return (
    <div className={styles.option} key={value} tabIndex={0}>
      <label className={styles["option__label"]}>
        <input
          className={styles["option__input"]}
          checked={selected}
          type="radio"
          value={value}
          onChange={handleChange}
          tabIndex={-1}
          name={groupName}
        />
        <div className={styles["option__check-icon-out"]}>
          <div className={styles["option__check-icon-in"]}></div>
        </div>
        <span className={styles["option__title"]}>{title}</span>
      </label>
    </div>
  );
};
