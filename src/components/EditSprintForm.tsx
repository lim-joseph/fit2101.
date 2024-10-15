"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  sprintName: z.string().min(1, "Sprint name is required."),
  startDate: z.string().nonempty("Start date is required."),
  status: z.string().nonempty("Status is required."),
});

type FormValues = z.infer<typeof schema>;

export function EditSprintForm({
  initialValues,
  onSubmit,
  isActiveSprintPresent,
}) {
  let possibleStatus = [];

  if (initialValues.status === "Completed") {
    possibleStatus = [{ value: "Completed", label: "Completed" }];
  } else if (initialValues.status === "Active") {
    possibleStatus = [
      { value: "Active", label: "Active" },
      { value: "Completed", label: "Completed" },
    ];
  } else if (isActiveSprintPresent) {
    possibleStatus = [{ value: "Inactive", label: "Inactive" }];
  } else {
    possibleStatus = [
      { value: "Inactive", label: "Inactive" },
      { value: "Active", label: "Active" },
      { value: "Completed", label: "Completed" },
    ];
  }
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sprintName: initialValues.name,
      startDate: initialValues.start_date,
      status: initialValues.status,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="sprintName">Sprint Name</label>
        <Controller
          name="sprintName"
          control={control}
          render={({ field }) => (
            <Input id="sprintName" placeholder="Enter sprint name" {...field} />
          )}
        />
        {errors.sprintName && (
          <p className="text-red-600">{errors.sprintName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="startDate">Start Date</label>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <Input id="startDate" type="date" {...field} />
          )}
        />
        {errors.startDate && (
          <p className="text-red-600">{errors.startDate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={field.value} />
              </SelectTrigger>
              <SelectContent>
                {possibleStatus.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && (
          <p className="text-red-600">{errors.status.message}</p>
        )}
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
