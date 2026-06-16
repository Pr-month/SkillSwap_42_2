import {
  components,
  type DropdownIndicatorProps,
  type MultiValueProps,
  type OptionProps,
} from "react-select";
import { ArrowIcon } from "../../../assets/img/icons/arrow";
import styles from "./dropdown.module.css";
import { CheckboxIcon } from "../../../assets/img/icons/checkbox";
import { CrossIcon } from "../../../assets/img/icons/cross";
import type { TSelectOptionProps } from "./dropdown";

export const CustomDropdownIndicator = (
  props: DropdownIndicatorProps<TSelectOptionProps, boolean>,
) => {
  const { selectProps } = props;
  const { inputValue } = selectProps;

  const hasValue = inputValue && inputValue.length > 0;

  return (
    <components.DropdownIndicator {...props}>
      {hasValue ? (
        <CrossIcon />
      ) : (
        <ArrowIcon opened={props.selectProps.menuIsOpen} initialRotation={0} />
      )}
    </components.DropdownIndicator>
  );
};

interface ICustomOptionProps extends OptionProps<TSelectOptionProps, boolean> {
  withCheckbox?: boolean;
  isCategory: boolean;
}

export const CustomOption = (props: ICustomOptionProps) => {
  const {
    children,
    isSelected,
    innerProps,
    isCategory,
    withCheckbox = false,
    ...rest
  } = props;
  return (
    <components.Option
      {...rest}
      isSelected={isSelected}
      innerProps={innerProps}
    >
      <div className={styles.option}>
        {withCheckbox && (
          <CheckboxIcon checked={isSelected} isCategory={isCategory} />
        )}
        <span className={styles.children}>{children}</span>
      </div>
    </components.Option>
  );
};

export const CustomMultiValueContainer = (
  props: MultiValueProps<TSelectOptionProps, boolean>,
) => {
  const { selectProps, index, ...rest } = props;
  const { value } = selectProps;
  const valueLength = Array.isArray(value) ? value.length : 0;

  if (index === 0 && valueLength > 0) {
    return (
      <components.MultiValueContainer {...rest} selectProps={selectProps}>
        {valueLength > 0 && `Выбрано: ${valueLength}`}
      </components.MultiValueContainer>
    );
  }
  return null;
};
