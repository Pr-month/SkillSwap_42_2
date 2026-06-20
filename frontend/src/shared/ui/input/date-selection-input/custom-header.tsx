import type { ReactDatePickerCustomHeaderProps } from "react-datepicker";
import { getYear, getMonth } from "date-fns";
import style from "./date-selection-input.module.css";
import { daysOfWeek, months } from "../../../lib/constants";
import { getRange } from "../../../lib/helpers";

const years = getRange(1900, getYear(new Date()) + 1, 1) as number[];

export const CustomHeader = ({
  date,
  changeYear,
  changeMonth,
}: ReactDatePickerCustomHeaderProps) => (
  <div className={style.calendar_header}>
    <div className={style.header}>
      <div className={style.selector_wrapper}>
        <select
          name="month"
          className={style.selector}
          value={months[getMonth(date)]}
          onChange={({ target: { value } }) =>
            changeMonth(months.indexOf(value as (typeof months)[number]))
          }
        >
          {months.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className={style.selector_wrapper}>
        <select
          name="year"
          className={style.selector}
          value={getYear(date)}
          onChange={({ target: { value } }) => changeYear(+value)}
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className={style.weeks}>
      {daysOfWeek.map((day) => (
        <div key={day} className={style.week_day}>
          {day}
        </div>
      ))}
    </div>
  </div>
);
