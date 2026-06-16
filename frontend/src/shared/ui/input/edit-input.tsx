import React, { useState } from "react";
import { Input, type TInputProps } from "./input";
import searchIcon from "../../../assets/icons/edit.svg";
import style from "./style.module.css";

type TEditInputProps = TInputProps;

export const EditInput = React.forwardRef<HTMLInputElement, TEditInputProps>(
  ({ className, ...props }, ref) => {
    const [disabled, setDisabled] = useState(true);
    const onEdit = () => setDisabled((prev) => !prev);
    return (
      <Input
        className={`${style.input_edit} ${className || ""}`}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <button type="button" onClick={onEdit}>
          <img src={searchIcon} alt={"Изменить"} />
        </button>
      </Input>
    );
  },
);
