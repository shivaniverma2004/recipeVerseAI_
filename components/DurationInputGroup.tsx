import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "./ui/input-group";

import { Controller, Control, FieldValues, FieldPath } from "react-hook-form";

function DurationInputGroup<TFieldValues extends FieldValues>({
  control,
  name,
  rules,
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  rules?: object;
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const totalMinutes = (field.value as number) ?? 0;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const sanitize = (val: string) => val.replace(/\D/g, "");

        const handleHours = (e: React.ChangeEvent<HTMLInputElement>) => {
          const h = Number(sanitize(e.target.value)) || 0;
          field.onChange(h * 60 + minutes);
        };

        const handleMinutes = (e: React.ChangeEvent<HTMLInputElement>) => {
          let m = Number(sanitize(e.target.value)) || 0;
          m = Math.min(59, m);
          field.onChange(hours * 60 + m);
        };

        return (
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <InputGroup className="h-10 w-1/2 bg-background border-border/80 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                <InputGroupInput
                  type="text"
                  placeholder="e.g. 1"
                  value={hours === 0 ? "" : hours}
                  onChange={handleHours}
                  onBlur={field.onBlur}
                />
                <InputGroupAddon align="inline-end" className="pr-3">
                  <InputGroupText className="text-xs font-medium text-muted-foreground/80">Hours</InputGroupText>
                </InputGroupAddon>
              </InputGroup>

              <InputGroup className="h-10 w-1/2 bg-background border-border/80 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                <InputGroupInput
                  type="text"
                  placeholder="e.g. 20"
                  value={minutes === 0 ? "" : minutes}
                  onChange={handleMinutes}
                  onBlur={field.onBlur}
                />
                <InputGroupAddon align="inline-end" className="pr-3">
                  <InputGroupText className="text-xs font-medium text-muted-foreground/80">Mins</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
            {/* {fieldState.error && (
              <p className="text-xs text-destructive">{fieldState.error.message}</p>
            )} */}
          </div>
        );
      }}
    />
  );
}
export default DurationInputGroup