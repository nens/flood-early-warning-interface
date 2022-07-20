/* A wrapper around Chakra's Input for number input.

   Inputs we use are usually managed -- they get their value in a
   prop, and call a setValue() function on change.

   The problem is that sometimes the input is in an intermediate state
   that doesn't represent a number -- like when the user wants to
   input a negative number, and types "-". This cannot be stored in
   the "value", which is a number.

   So we store the current value of the input field in a useState() in
   this component, as a string.

   While the input field is in a state that doesn't represent a
   number, what do we let the number value be? There are a few
   options:


   1. Don't change value until the input field has a valid number
      again.  This works, but it makes it possible to submit the form,
      the field will have the last valid value. Validate() doesn't
      know about the current invalid value, and can't display an
      error. It's not what I prefer.

   2. Use a "null" value during the time the field has invalid data.
      This seems nice, but it would mean that all the config fields
      that store a number now have to have type "number | null", and
      that has to be checked everywhere.

   3. Instead of null, use NaN. That has a similar function to null,
      but its type is number. It is important that this value is never
      saved, so make sure validate() checks for this case for every
      input field that uses this component!


 */

import { useEffect, useState } from "react";
import { NumberInput, NumberInputField, NumberInputProps } from "@chakra-ui/react";

interface MyNumberInputProps extends Omit<NumberInputProps, "value" | "onChange"> {
  value?: number | null;
  onChange: (value: number) => void;
}

function MyNumberInput({value, onChange, precision, min, max, ...props}: MyNumberInputProps) {
  const currentValueWithPrecision = (value: number | undefined | null): string => {
    const v = value ?? 0;
    if (precision !== undefined) {
      return v.toFixed(precision);
    } else {
      return "" + v;
    }
  }

  const [currentValue, setCurrentValue] = useState(currentValueWithPrecision(value));

  useEffect(() => {
    if (value !== parseFloat(currentValue)) {
      setCurrentValue("" + (value ?? 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const updateValue = (newValue: string) => {
    setCurrentValue(newValue);
    const numberValue = parseFloat(newValue);
    if (!isNaN(numberValue)) {
      onChange(numberValue);
    }
  };

  const onBlur = () => {
    // 1. If number is currently invalid, set it to last valid value
    // otherwise, do what the old onBlur did:
    // 2. Clamp value to min and max, if given
    // 3. Set to right precision
    let numberValue: number | undefined | null = parseFloat(currentValue);
    if (isNaN(numberValue)) {
      // Reset to the prop
      numberValue = value;
    } else {
      if (max !== undefined && numberValue > max) {
        numberValue = max;
      }
      if (min !== undefined && numberValue < min) {
        numberValue = min;
      }
    }

    setCurrentValue(currentValueWithPrecision(numberValue));
    if (typeof numberValue === "number") {
      onChange(numberValue);
    }
  }

  return (
    <NumberInput
      value={currentValue}
      onChange={updateValue}
      onBlur={onBlur}
      clampValueOnBlur={false}
      {...props}
    >
      <NumberInputField />
    </NumberInput>
  );
}

export default MyNumberInput;
