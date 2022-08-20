import React from "react"

import { Meta, Story } from "@storybook/react"
import { ExampleImpure, ExampleImpureProps } from "."

const Template: Story<ExampleImpureProps> = (args: ExampleImpureProps) => (
  <ExampleImpure {...args} />
)

export const ExampleImpure1: Story<ExampleImpureProps> = Template.bind({})
ExampleImpure1.args = {
  color: `blue`,
}

export default {
  title: `Example`,
  component: ExampleImpure,
  parameters: {
    layout: `centered`,
    actions: {
      handles: [`click`],
    },
  },
  argTypes: {
    color: { control: `color` },
  },
} as Meta
