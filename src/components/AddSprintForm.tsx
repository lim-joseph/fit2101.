import { Button } from "@/components/ui/button"; // Adjust the import according to your project structure
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  sprintName: z.string().min(1, "Sprint name is required."),
  startDate: z.string().nonempty("Start date is required."),
});

type FormValues = z.infer<typeof schema>;

interface AddSprintFormProps {
  getSprints: () => void;
}

export function AddSprintForm({ getSprints }: AddSprintFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sprintName: "",
      startDate: "",
    },
  });

  async function addSprint(data: FormValues) {
    const { error } = await supabase.from("sprints").insert({
      name: data.sprintName,
      start_date: data.startDate,
      end_date: new Date(
        new Date(data.startDate).setDate(
          new Date(data.startDate).getDate() + 14,
        ),
      ),
      status: "Inactive",
    });

    if (error) {
      console.log(error);
    }
    getSprints();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Sprint</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Sprint</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new sprint.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(addSprint)} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sprintName" className="text-right">
              Sprint Name
            </Label>
            <Controller
              name="sprintName"
              control={control}
              render={({ field }) => (
                <Input
                  id="sprintName"
                  placeholder="Enter sprint name"
                  {...field}
                  className="col-span-3"
                />
              )}
            />
            {errors.sprintName && (
              <p className="col-span-4 text-red-600">
                {errors.sprintName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Input
                  id="startDate"
                  type="date"
                  {...field}
                  className="col-span-3"
                />
              )}
            />
            {errors.startDate && (
              <p className="col-span-4 text-red-600">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Create Sprint</Button>
            </DialogClose>

            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
