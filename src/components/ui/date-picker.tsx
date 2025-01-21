"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import {
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerProps as AriaDateRangePickerProps,
  DateValue as AriaDateValue,
  Dialog as AriaDialog,
  DialogProps as AriaDialogProps,
  PopoverProps as AriaPopoverProps,
  ValidationResult as AriaValidationResult,
  composeRenderProps,
  Text,
} from "react-aria-components";

import { cn } from "#src/utils/misc";
import { FieldGroup } from "#src/components/ui/field";
import { Popover } from "#src/components/ui/popover";
import { Button } from "./button";

import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  RangeCalendar,
} from "./calendar";
import { DateInput } from "./date-field";
import { FieldError, Label } from "./field";

const DatePicker = AriaDatePicker;

const DateRangePicker = AriaDateRangePicker;

const DatePickerContent = ({
  className,
  popoverClassName,
  ...props
}: AriaDialogProps & { popoverClassName?: AriaPopoverProps["className"] }) => (
  <Popover
    className={composeRenderProps(popoverClassName, (className) =>
      cn("w-auto p-3", className),
    )}
  >
    <AriaDialog
      className={cn(
        "flex w-full flex-col space-y-4 outline-none sm:flex-row sm:space-x-4 sm:space-y-0",
        className,
      )}
      {...props}
    />
  </Popover>
);

interface JollyDatePickerProps<T extends AriaDateValue>
  extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}

function JollyDatePicker<T extends AriaDateValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: JollyDatePickerProps<T>) {
  return (
    <DatePicker
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <DateInput className="flex-1" variant="ghost" />
        <Button
          variant="ghost"
          size="icon"
          className="size-6 focus-visible:ring-none focus-visible:ring-0 outline-none"
        >
          <CalendarIcon aria-hidden className="size-4" />
        </Button>
      </FieldGroup>
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerContent>
        <Calendar>
          <CalendarHeading />
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => <CalendarCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </Calendar>
      </DatePickerContent>
    </DatePicker>
  );
}

interface JollyDateRangePickerProps<T extends AriaDateValue>
  extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}

function JollyDateRangePicker<T extends AriaDateValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: JollyDateRangePickerProps<T>) {
  return (
    <DateRangePicker
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <DateInput variant="ghost" slot={"start"} />
        <span aria-hidden className="px-2 text-sm text-muted-foreground">
          -
        </span>
        <DateInput className="flex-1" variant="ghost" slot={"end"} />

        <Button
          variant="ghost"
          size="icon"
          className="mr-1 size-6 data-[focus-visible]:ring-offset-0"
        >
          <Calendar aria-hidden className="size-4" />
        </Button>
      </FieldGroup>
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerContent>
        <RangeCalendar>
          <CalendarHeading />
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => <CalendarCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </RangeCalendar>
      </DatePickerContent>
    </DateRangePicker>
  );
}

export {
  DatePicker,
  DatePickerContent,
  DateRangePicker,
  JollyDatePicker,
  JollyDateRangePicker,
};
export type { JollyDatePickerProps, JollyDateRangePickerProps };
