import React, { useEffect, useState, type ChangeEvent } from "react";
import { Input } from "./input";
import searchIcon from "../../../assets/icons/search.svg";
import style from "./style.module.css";
import { useDispatch, useSelector } from "../../../features/store";
import { setFilters } from "../../../features/filters/filtersSlice";
import { useLocation, useNavigate } from "react-router-dom";

type TSearchInputProps = {
  placeholder: string;
  className?: string;
};

export const SearchInput = React.forwardRef<
  HTMLInputElement,
  TSearchInputProps
>(({ className, placeholder }, ref) => {
  const { searchInputValue } = useSelector((state) => state.filters.filters);
  const [enteredValue, setEnteredValue] = useState(searchInputValue);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEnteredValue(event.target.value);
  };

  const handleClick = async () => {
    if (location.pathname !== "/") navigate("/");
    if (searchInputValue !== enteredValue)
      dispatch(setFilters({ searchInputValue: enteredValue }));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleClick();
    }
  };
  useEffect(() => {
    setEnteredValue(searchInputValue);
  }, [searchInputValue]);

  return (
    <Input
      className={`${style.input_search} ${className || ""}`}
      type="text"
      name="search-input"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      ref={ref}
      placeholder={placeholder}
      value={enteredValue}
    >
      <button type="button" onClick={handleClick}>
        <img src={searchIcon} alt={"Поиск"} />
      </button>
    </Input>
  );
});
