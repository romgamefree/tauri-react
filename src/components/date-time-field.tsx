import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { ChevronDownIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode: "date" | "time";
  required?: boolean;
};

export function DateTimeField({ id, label, value, onChange, mode, required }: Props) {
  const [open, setOpen] = useState(false);
  const parsed = mode === "date" && value ? parseISO(value) : undefined;
  const date = parsed && isValid(parsed) ? parsed : undefined;

  if (mode === "time") {
    return (
      <FieldGroup className="gap-0">
        <Field className="gap-1.5">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            id={id}
            type="time"
            step="1"
            required={required}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </Field>
      </FieldGroup>
    );
  }

  return (
    <FieldGroup className="gap-0">
      <Field className="gap-1.5">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <div className="flex min-w-0 gap-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  id={id}
                  aria-required={required}
                  className="min-w-0 flex-1 justify-between font-normal"
                />
              }
            >
              <span className="truncate">{date ? format(date, "dd/MM/yyyy") : "Chọn ngày"}</span>
              <ChevronDownIcon data-icon="inline-end" />
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                defaultMonth={date}
                onSelect={(selected) => {
                  onChange(selected ? format(selected, "yyyy-MM-dd") : "");
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {value && !required && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Xóa ${label.toLowerCase()}`}
              onClick={() => onChange("")}
            >
              <XIcon />
            </Button>
          )}
        </div>
      </Field>
    </FieldGroup>
  );
}
