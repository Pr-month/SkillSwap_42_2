import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { ClockIcon } from "../../../assets/img/icons";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Кнопка",
    type: "primary",
    htmlType: "button",
    disabled: false,
    fullWidth: false,
    iconPosition: "left",
    className: "",
  },
  argTypes: {
    onClick: { action: "clicked" },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    type: "primary",
  },
};

export const Secondary: Story = {
  args: {
    type: "secondary",
  },
};

export const Tertiary: Story = {
  args: {
    type: "tertiary",
  },
};

export const Disabled: Story = {
  args: {
    type: "primary",
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    type: "primary",
    fullWidth: true,
  },
};

export const WithIconLeft: Story = {
  args: {
    type: "primary",
    icon: <ClockIcon />,
    iconPosition: "left",
    children: "С иконкой",
  },
};

export const WithIconRight: Story = {
  args: {
    type: "secondary",
    icon: <ClockIcon />,
    iconPosition: "right",
    children: "С иконкой",
  },
};
