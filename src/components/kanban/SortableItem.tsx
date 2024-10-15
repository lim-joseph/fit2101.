import { UserStory } from "@/types/types";
import supabase from "@/utils/supabase";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CircleUserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const priorityMap = {
  Low: "bg-green-500 hover:bg-green-600",
  Medium: "bg-yellow-500 hover:bg-yellow-600",
  High: "bg-red-500 hover:bg-red-600",
};

const tagMap = {
  Frontend: "bg-green-500 hover:bg-green-600",
  Backend: "bg-yellow-500 hover:bg-yellow-600",
  DevOps: "bg-red-500 hover:bg-red-600",
  UI: "bg-red-500 hover:bg-red-600",
  Database: "bg-red-500 hover:bg-red-600",
};

export function SortableItem(props: { story: UserStory; className?: string }) {
  const [developerName, setDeveloperName] = useState<string | null>(null);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.story.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    const fetchDeveloperName = async () => {
      if (props.story.developer_id) {
        const { data: developer, error } = await supabase
          .from("developers")
          .select("name")
          .eq("id", props.story.developer_id)
          .single();

        if (error) {
          console.error("Error fetching developer:", error);
        } else {
          console.log(developer.name);
          setDeveloperName(developer.name || "Unknown Developer");
        }
      } else {
        setDeveloperName("Unassigned");
      }
    };

    fetchDeveloperName();
  }, [props.story.developer_id]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={props.className}
    >
      <CardHeader>
        <CardTitle>{props.story.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <CircleUserRound className="opacity-50" />
          <span className="text-sm text-gray-500">{developerName}</span>
        </div>
        <div>
          {(() => {
            const priorityClass = priorityMap[props.story.priority] || "";
            return (
              <Badge
                variant={"secondary"}
                color="red"
                className={priorityClass}
              >
                {props.story.priority}
              </Badge>
            );
          })()}
        </div>
        <div>
          {(() => {
            const priorityClass = tagMap[props.story.tag] || "";
            return (
              <Badge
                variant={"secondary"}
                color="red"
                className={priorityClass}
              >
                {props.story.tag}
              </Badge>
            );
          })()}
        </div>
        <div>
          {(() => {
            return (
              <Badge variant={"secondary"} color="red" className="font-2xl">
                {props.story.story_points}
              </Badge>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
