import { useRef, useState } from "react";
import Select, {
  type ControlProps,
  type CSSObjectWithLabel,
  type GroupBase,
  type MultiValue,
  type OptionProps,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import {
  CustomDropdownIndicator,
  CustomOption,
  CustomMultiValueContainer,
} from "./dropdown-custom-components";
import style from "./dropdown.module.css";

type TDropdownComponentProps<T extends { name: string; value?: string }> = {
  options: T[];
  placeholder: string;
  isMulti?: boolean; //возможен ли множественный выбор
  closeMenuOnSelect?: boolean; //для isMulti={true} используйте closeMenuOnSelect={false}, чтобы меню не закрывалось
  required: boolean; //обязательно что-то выбрать или нет
  withCheckbox?: boolean; //чекбокс нужно сделать {true} для множественного выбора
  isCategory?: boolean; //для внешнего вида чекбокса при множественном выборе, по умолчанию false
  value?: string | number | (string | number)[] | null;
  onChange?: (value: string | string[] | null) => void;
  error?: string;
  disabled?: boolean;
};

export type TSelectOptionProps = {
  value: string;
  label: string;
};

export const DropdownComponent = <T extends { name: string; value?: string }>({
  options,
  closeMenuOnSelect = true,
  isMulti,
  placeholder,
  required,
  isCategory = false,
  withCheckbox = false,
  value,
  onChange,
  error,
  disabled,
}: TDropdownComponentProps<T>) => {
  const [isSearchable] = useState(true);
  const selectRef = useRef(null);

  const selectOptions: TSelectOptionProps[] = options.map((option) => ({
    value: option.value || option.name,
    label: option.name,
  }));

  const getValue = ():
    | SingleValue<TSelectOptionProps>
    | MultiValue<TSelectOptionProps> => {
    if (value === null || value === undefined) {
      return isMulti ? [] : null;
    }

    if (isMulti) {
      if (Array.isArray(value)) {
        const stringValues = value.map((v) =>
          typeof v === "number" ? v.toString() : v || "",
        );
        return selectOptions.filter((option) =>
          stringValues.includes(option.value),
        );
      }
      return [];
    } else {
      const stringValue =
        typeof value === "number"
          ? value.toString()
          : typeof value === "string"
            ? value
            : "";

      return (selectOptions.find((option) => option.value === stringValue) ||
        null) as SingleValue<TSelectOptionProps>;
    }
  };

  const handleChange = (
    selected: SingleValue<TSelectOptionProps> | MultiValue<TSelectOptionProps>,
  ) => {
    if (!onChange) return;

    if (isMulti) {
      const values = Array.isArray(selected)
        ? selected.map((option) => option.value)
        : [];
      onChange(values);
    } else {
      const value = selected as SingleValue<TSelectOptionProps>;
      onChange(value ? value.value : null);
    }
  };

  const baseComponents = {
    DropdownIndicator: CustomDropdownIndicator,
    IndicatorSeparator: null,
    MultiValue: CustomMultiValueContainer,
    MultiValueRemove: () => null,
  };

  const componentsWithCheckbox = {
    ...baseComponents,

    Option: (props: OptionProps<TSelectOptionProps, boolean>) => (
      <CustomOption
        {...props}
        withCheckbox={withCheckbox}
        isCategory={isCategory}
      />
    ),
  };

  const components = withCheckbox ? componentsWithCheckbox : baseComponents;

  const styles: StylesConfig<TSelectOptionProps, boolean> = {
    control: (
      baseStyles: CSSObjectWithLabel,
      state: ControlProps<TSelectOptionProps, boolean>,
    ) => {
      const isMenuOpen = state.selectProps.menuIsOpen;

      return {
        ...baseStyles,
        position: "relative",
        display: "flex",
        flexDirection: "row",
        padding: "12px 20px",
        minWidth: "48px",
        backgroundColor: "var(--card-input-color)",

        borderColor: error ? "var(--error-color)" : "var(--caption-color)",
        borderTop: error
          ? "1px solid var(--error-color)"
          : "1px solid var(--caption-color)",
        borderLeft: error
          ? "1px solid var(--error-color)"
          : "1px solid var(--caption-color)",
        borderRight: error
          ? "1px solid var(--error-color)"
          : "1px solid var(--caption-color)",
        borderBottom: isMenuOpen
          ? "1px solid transparent"
          : error
            ? "1px solid var(--error-color)"
            : "1px solid var(--caption-color)",

        borderTopLeftRadius: "var(--border-raduis-main, 50%)",
        borderTopRightRadius: "var(--border-raduis-main, 50%)",

        borderBottomLeftRadius: isMenuOpen
          ? "0"
          : "var(--border-raduis-main, 50%)",
        borderBottomRightRadius: isMenuOpen
          ? "0"
          : "var(--border-raduis-main, 50%)",

        cursor: "pointer",

        "&::after": {
          content: '""',
          position: "absolute",
          left: "0px",
          top: "-1.5px",
          display: "block",

          borderBottom: isMenuOpen
            ? "1px solid var(--button-disabled-color)"
            : "none",

          borderLeft: isMenuOpen
            ? "1px solid var(--button-disabled-color)"
            : "none",
          borderRight: isMenuOpen
            ? "1px solid var(--button-disabled-color)"
            : "none",
          borderRadius: "var(--border-raduis-main)",

          width: "100%",
          height: "100%",
          zIndex: "20",
        },
      } as CSSObjectWithLabel;
    },
    placeholder: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,
      color: "var(--caption-color)",
      fontSize: "var(--font-size-main)",
    }),
    singleValue: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,
      color: "var(--text-color)",
      fontSize: "var(--font-size-main)",
    }),
    dropdownIndicator: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingInlineEnd: "4px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    menu: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,

      display: "flex",
      gap: "4px",
      zIndex: "1000",
      flexDirection: "column",
      padding: "8px 0px",
      backgroundColor: "var(--card-input-color)",

      borderBottom: "1px solid var(--caption-color)",
      borderLeft: "1px solid var(--caption-color)",
      borderRight: "1px solid var(--caption-color)",
      borderTop: "transparent",

      borderBottomLeftRadius: "var(--border-raduis-main, 50%)",
      borderBottomRightRadius: "var(--border-raduis-main, 50%)",

      overflow: "hidden",
    }),
    menuList: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,

      maxHeight: "300px",
      // Кастомизация скролла
      "&::-webkit-scrollbar": {
        width: "4px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "var(--button-disabled-color)",
        borderRadius: "2px",
        maxHeight: "40px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "var(--button-disabled-color)",
      },
      "&::-webkit-scrollbar-thumb:active": {
        background: "var(--button-disabled-color)",
      },

      "&::-webkit-scrollbar-button": {
        display: "none",
      },
      scrollbarWidth: "thin",
      scrollbarColor: "var(--button-disabled-color) transparent",
    }),
    option: (
      baseStyles: CSSObjectWithLabel,
      state: OptionProps<TSelectOptionProps, boolean>,
    ) => ({
      ...baseStyles,

      backgroundColor: "transparent",
      cursor: "pointer",
      color: state.isSelected
        ? "var(--button-pressed-color)"
        : "var(--text-color)",
      fontSize: "var(--font-size-main)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "4px 20px",
      lineHeight: "1.5",

      "&:hover": {
        backgroundColor: "var(--button-disabled-color)",
      },
    }),
    multiValueRemove: () => ({
      display: "none",
    }),
  };

  return (
    <>
      <Select<TSelectOptionProps, boolean, GroupBase<TSelectOptionProps>>
        ref={selectRef}
        className="basic-single"
        classNamePrefix="select"
        isSearchable={isSearchable}
        options={selectOptions}
        closeMenuOnSelect={closeMenuOnSelect}
        isMulti={isMulti}
        placeholder={placeholder}
        openMenuOnFocus={true}
        required={required}
        unstyled
        styles={styles}
        components={components}
        hideSelectedOptions={false}
        isClearable={false}
        isDisabled={disabled}
        value={getValue()}
        onChange={handleChange}
      />
      {error && <span className={style.error}>{error}</span>}
    </>
  );
};
