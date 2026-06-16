import { forwardRef, type FC } from "react";
import { Input } from "../input";
import calendar from "./../../../../assets/icons/calendar.svg";
import style from "./../style.module.css";
import "react-datepicker/dist/react-datepicker.css";

type TCustomInputProps = {
  value?: string;
  onClick?: () => void;
  error?: string;
};

export const CustomInput: FC<TCustomInputProps> = forwardRef<
  HTMLInputElement,
  TCustomInputProps
>(({ value, onClick, error }, ref) => {
  return (
    <Input
      readOnly
      ref={ref}
      className={`${style.input}  ${style.input_password}`}
      name={"birthDate"}
      label="Дата рождения"
      value={value}
      placeholder="дд.мм.гггг"
      onClick={onClick}
      onChange={() => {}}
      isError={error ? true : false}
      hint={error}
    >
      <button type="button" onClick={onClick}>
        <img src={calendar} alt={"Календарь"} />
      </button>
    </Input>
  );
});
