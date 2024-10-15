import { UserStory } from "@/types/types";
import supabase from "@/utils/supabase";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface BacklogTableProps {
  backlog: UserStory[];
  fetchBacklog: () => void;
  storyCompleted: (storyId: number) => void;
}

export default function BacklogTable({
  backlog,
  fetchBacklog,
  storyCompleted,
}: BacklogTableProps) {
  //state to keep track of editing values
  const [editingValues, setEditingValues] = useState<{
    [key: number]: number | null;
  }>({});

  const handleTimeTakenChange = (storyId: number, value: string) => {
    const parsedValue = value !== "" ? parseFloat(value) : null;
    setEditingValues((prev) => ({
      ...prev,
      [storyId]: parsedValue,
    }));
  };

  const handleTimeTakenBlur = async (story: UserStory) => {
    const timeTaken = editingValues[story.id];
    if (timeTaken !== story.time_taken) {
      const { error } = await supabase
        .from("user_stories")
        .update({ time_taken: timeTaken })
        .eq("id", story.id);

      if (error) {
        console.error("Error updating time taken:", error);
      } else {
        fetchBacklog();
      }
    }
  };

  return (
    <Table>
      <TableCaption>Backlog Items</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Sprint ID</TableHead>
          <TableHead>Tag</TableHead>
          <TableHead>Story Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {backlog.map((story) => (
          <TableRow key={story.id}>
            <TableCell className="font-medium">{story.id}</TableCell>
            <TableCell>{story.name}</TableCell>
            <TableCell>{story.state ?? "-"}</TableCell>
            <TableCell>{story.priority ?? "-"}</TableCell>
            <TableCell>{story.sprint_id ?? "-"}</TableCell>
            <TableCell>{story.tag ?? "-"}</TableCell>
            <TableCell>{story.story_points ?? "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
