import React, {
  useState,
  type ChangeEvent,
  type HTMLProps,
  type ReactNode,
} from "react";
import searchIcon from "../../../assets/icons/edit.svg";

import style from "./edit-textarea.module.css";

export type TTextareaProps = Omit<
  HTMLProps<HTMLTextAreaElement>,
  "onChange"
> & {
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  name: string;
  placeholder?: string;
  id?: string;
  value?: string;
  type?: string;
  className?: string;
  label?: string;
  hint?: string;
  isError?: boolean;
  children?: ReactNode;
  classNameError?: string;
};

export const EditTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TTextareaProps
>(({ className, ...props }, ref) => {
  const [disabled, setDisabled] = useState(true);
  return (
    <div className={style.input}>
      <textarea
        ref={ref}
        disabled={disabled}
        className={`${style.textarea} ${className}`}
        {...props}
      />
      <button type="button" onClick={() => setDisabled(!disabled)}>
        <img src={searchIcon} alt="Изменить" />
      </button>
    </div>
  );
});
