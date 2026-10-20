import { useState, type Ref } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  dateTimeConstraints,
  fromPickerDate,
  pickerBounds,
  toPickerDate,
  type DateTimeBounds,
} from '../../utils/datePicker';
import {
  dateInputYears,
  isUnchangedTimestamp,
  isValidLocalDateTime,
  repeatedTimeHint,
  toLocalDateTime,
} from '../../utils/dates';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  error?: string;
  originalTimestamp?: string;
  bounds?: DateTimeBounds;
  onOpenChange?: (open: boolean) => void;
}

export function DateTimeInput({
  label,
  value,
  onChange,
  onBlur,
  inputRef,
  error,
  originalTimestamp,
  bounds = {},
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [referenceDate, setReferenceDate] = useState(
    () => toPickerDate(toLocalDateTime(new Date().toISOString())) ?? undefined,
  );
  const constraints = dateTimeConstraints(bounds, value, originalTimestamp);
  function openPicker() {
    setReferenceDate(toPickerDate(toLocalDateTime(new Date().toISOString())) ?? undefined);
    setOpen(true);
    onOpenChange?.(true);
  }
  const invalid = value !== '' && !isValidLocalDateTime(value);
  const message =
    error ??
    (invalid
      ? `Choose a valid local date and time (${dateInputYears.min}–${dateInputYears.max}).`
      : undefined);
  return (
    <DateTimePicker
      label={label}
      value={toPickerDate(value)}
      onChange={(date) => onChange(fromPickerDate(date, value, originalTimestamp))}
      onAccept={() => onBlur?.()}
      inputRef={inputRef}
      open={open}
      onOpen={openPicker}
      onClose={() => {
        setOpen(false);
        onOpenChange?.(false);
      }}
      timezone="UTC"
      format="DD/MM/YYYY HH:mm"
      ampm={false}
      views={['year', 'month', 'day', 'hours', 'minutes']}
      timeSteps={{ minutes: 1 }}
      reduceAnimations
      {...constraints}
      referenceDate={constraints.minDateTime ?? referenceDate}
      minDate={pickerBounds.min}
      maxDate={pickerBounds.max}
      slotProps={{
        desktopTransition: { timeout: 0 },
        dialog: { transitionDuration: 0 },
        openPickerButton: { disableRipple: true },
        field: { clearable: true },
        textField: {
          size: 'small',
          fullWidth: true,
          error: !!message,
          helperText:
            message ?? (!isUnchangedTimestamp(value, originalTimestamp) && repeatedTimeHint(value)),
          slotProps: {
            root: {
              onClick: (event) => {
                if (!(event.target instanceof Element && event.target.closest('button')))
                  openPicker();
              },
              onBlur: (event) => {
                if (!open && !event.currentTarget.contains(event.relatedTarget)) onBlur?.();
              },
            },
          },
        },
      }}
    />
  );
}
