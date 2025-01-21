import * as React from 'react'

import * as ReactAria from 'react-aria-components'

import { cn } from "#src/utils/misc";

interface CheckboxGroupProps extends ReactAria.CheckboxGroupProps {
  orientation?: 'horizontal' | 'vertical'
}

export const CheckboxGroup = ({
  orientation = 'vertical',
  ...props
}: CheckboxGroupProps) => {
  return (
    <ReactAria.CheckboxGroup
      data-orientation={orientation}
      className="group"
      {...props}
    />
  )
}

export const CheckboxGroupContent = (
  props: React.HTMLAttributes<HTMLDivElement>,
) => {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-x-6 gap-y-2',
        'group-orientation-horizontal:flex-row',
        'group-orientation-vertical:flex-col',
      )}
      {...props}
    />
  )
}
