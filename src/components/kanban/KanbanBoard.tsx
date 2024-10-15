import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";

import { UserStory } from "@/types/types";
import supabase from "@/utils/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SortableItem } from "./SortableItem";

// Used for preventing backwards movement of user stories
const allowedStates = ["Todo", "In-Progress", "Completed"];

// Used to enable dropping user stories in empty columns
const createDummyStory = (
  state: "Todo" | "In-Progress" | "Completed",
): UserStory => ({
  id: Math.floor(Math.random() * 9000) + 1001,
  name: `Dummy Story for ${state}`,
  tag: "dummy",
  priority: "Low",
  state: state,
  story_points: 0,
  developer_id: 0,
  sprint_id: 0,
  position: 1000,
});

export default function KanbanBoard({ id }: { id: string }) {
  const [stories, setStories] = useState<UserStory[]>([]);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    const { data: user_stories, error } = await supabase
      .from("user_stories")
      .select("*")
      .eq("sprint_id", id);

    if (error) {
      console.error("Error fetching stories:", error);
    } else {
      const dummyStories = allowedStates.map((state) =>
        createDummyStory(state),
      );
      setStories([...user_stories, ...dummyStories]);
    }
  }

  const sortStories = (stories: UserStory[]) =>
    stories.sort((a, b) => {
      return a.position - b.position;
    });

  const todoStories = sortStories(
    stories.filter((story) => story.state === "Todo"),
  );

  const inProgressStories = sortStories(
    stories.filter((story) => story.state === "In-Progress"),
  );

  const completedStories = sortStories(
    stories.filter((story) => story.state === "Completed"),
  );

  // Allows us to move things around in kanban board
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Refs for each kanban column
  const { setNodeRef: todoRef } = useDroppable({
    id: "todo",
  });

  const { setNodeRef: inProgressRef } = useDroppable({
    id: "In-Progress",
  });

  const { setNodeRef: CompletedRef } = useDroppable({
    id: "Completed",
  });

  async function updateAllStories() {
    const updates = stories
      .filter((story) => story.tag !== "dummy") // Filter out dummy stories
      .map((story) => ({
        id: story.id,
        name: story.name,
        position: story.position,
        state: story.state,
        completed_date: story.completed_date,
      }));

    const { error } = await supabase
      .from("user_stories")
      .upsert(updates, { onConflict: "id" });

    if (error) {
      console.error("Error updating story positions and statuses:", error);
    }
  }

  // Dropping a user story in a new position
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeStory = stories.find((story) => story.id === active.id);
    const overStory = stories.find((story) => story.id === over.id);
    // console.log(activeStory?.name);
    // console.log(overStory.name);

    if (!activeStory || !overStory) return;

    const activeStateIndex = allowedStates.indexOf(activeStory.state);
    const overStateIndex = allowedStates.indexOf(overStory.state);

    // Prevent moving backwards in the workflow
    if (overStateIndex < activeStateIndex) return;

    setStories((stories) => {
      const activeIndex = stories.findIndex((story) => story.id === active.id);
      const overIndex = stories.findIndex((story) => story.id === over.id);

      // Update the state of the active story to match the state of the over story
      const updatedStories = [...stories];
      updatedStories[activeIndex] = {
        ...updatedStories[activeIndex],
        state: updatedStories[overIndex].state,
      };
      // Update the story's state
      const activeStory = updatedStories[activeIndex];
      const newState = overStory.state;
      activeStory.state = newState;

      // Set the completed_date if the story is moved to "Completed"
      if (newState === "Completed" && !activeStory.completed_date) {
        activeStory.completed_date = new Date().toISOString();
      }

      updateAllStories();

      // Recalculate positions for all stories
      return updatedStories.map((story, index) => ({
        ...story,
        position: index,
      }));
    });

    updateAllStories();
  }

  // Dragging a user story over another user story
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeStory = stories.find((story) => story.id === active.id);
    const overStory = stories.find((story) => story.id === over.id);
    // console.log(activeStory?.name);
    // console.log(overStory.name);

    if (!activeStory || !overStory) return;

    const activeStateIndex = allowedStates.indexOf(activeStory.state);
    const overStateIndex = allowedStates.indexOf(overStory.state);

    // Prevent moving backwards in the workflow
    if (overStateIndex < activeStateIndex) return;

    setStories((stories) => {
      const activeIndex = stories.findIndex((story) => story.id === active.id);
      const overIndex = stories.findIndex((story) => story.id === over.id);

      // Update the state of the active story to match the state of the over story
      const updatedStories = [...stories];
      updatedStories[activeIndex] = {
        ...updatedStories[activeIndex],
        state: updatedStories[overIndex].state,
      };
      // Update the story's state
      const activeStory = updatedStories[activeIndex];
      const newState = overStory.state;
      activeStory.state = newState;

      // Set the completed_date if the story is moved to "Completed"
      if (newState === "Completed" && !activeStory.completed_date) {
        activeStory.completed_date = new Date().toISOString();
      }

      // Recalculate positions for all stories
      return updatedStories.map((story, index) => ({
        ...story,
        position: index,
      }));
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {/* Todo stories*/}
        <SortableContext
          items={todoStories}
          strategy={verticalListSortingStrategy}
        >
          <Card ref={todoRef} className="flex-1 bg-neutral-100">
            <CardHeader className="pb-3">
              <CardTitle>📃 TO DO</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-4">
              {todoStories.map((story) => (
                <SortableItem
                  key={story.id}
                  story={story}
                  className={story.tag === "dummy" ? "invisible" : ""}
                />
              ))}
            </CardContent>
          </Card>
        </SortableContext>

        {/* In-Progress stories*/}
        <SortableContext
          items={inProgressStories}
          strategy={verticalListSortingStrategy}
        >
          <Card ref={inProgressRef} className="flex-1 bg-neutral-100">
            <CardHeader className="pb-3">
              <CardTitle>✏️ IN PROGRESS</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-4">
              {inProgressStories.map((story) => (
                <SortableItem
                  key={story.id}
                  story={story}
                  className={story.tag === "dummy" ? "invisible" : ""}
                />
              ))}
            </CardContent>
          </Card>
        </SortableContext>

        {/* Completed stories*/}
        <SortableContext
          items={completedStories}
          strategy={verticalListSortingStrategy}
        >
          <Card ref={CompletedRef} className="flex-1 bg-neutral-100">
            <CardHeader className="pb-3">
              <CardTitle>✅ COMPLETED</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-4">
              {completedStories.map((story) => (
                <SortableItem
                  key={story.id}
                  story={story}
                  className={story.tag === "dummy" ? "invisible" : ""}
                />
              ))}
            </CardContent>
          </Card>
        </SortableContext>
      </div>
    </DndContext>
  );
}
