import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

export default function EditStory({
  open,
  onClose,
  onEditStory,
  item,
  getBacklog,
  sprintData,
}) {
  const [name, setName] = useState(item?.name || "");
  const [tag, setTag] = useState(item?.tag || "");
  const [priority, setPriority] = useState(item?.priority || "None");
  const [storyPoints, setStoryPoints] = useState(item?.story_points || null);
  const [sprint, setSprint] = useState(item?.sprint_id || null);
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(item?.estimated_time || 0);

  useEffect(() => {
    async function loadData() {
      if (item) {
        setLoading(true);
        setName(item.name);
        setTag(item.tag || "");
        setPriority(item.priority || "None");
        setStoryPoints(item.story_points || null);
        setSprint(item.sprint_id || null);
        setEstimatedTime(item.estimated_time || 0);
        await fetchSubtasks();
        setLoading(false);
      }
    }
    loadData();
  }, [item]);

  async function handleClick() {
    await handleEditStory();
    resetForm();
    onEditStory();
  }

  function resetForm() {
    setName("");
    setTag("");
    setPriority("None");
    setStoryPoints(null);
    setSprint(null);
    setEstimatedTime(0);
  }

  async function deleteStory() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_stories")
        .delete()
        .eq("id", item.id);

      if (error) {
        console.error("Error deleting user story:", error);
      } else {
        console.log("User story deleted successfully");
      }
    } catch (error) {
      console.log(error);
    }

    resetForm();
    onEditStory();
    await getBacklog();
    setLoading(false);
  }

  async function handleEditStory() {
    setLoading(true);

    const updatedSubtasks = subtasks.map(({ id, state }) => ({
      id,
      state,
    }));

    for (const { id, state } of updatedSubtasks) {
      const { error } = await supabase
        .from("sub_tasks")
        .update({ state })
        .eq("id", id);

      if (error) {
        console.error(`Error updating subtask ${id}:`, error);
      }
    }

    let state = null;

    if (sprint) {
      state = "Todo";
    } else {
      state = "Backlog";
    }

    // Update user story details
    const { error } = await supabase
      .from("user_stories")
      .update({
        name: name || "User Story",
        tag,
        state,
        priority,
        story_points: storyPoints,
        sprint_id: sprint,
        estimated_time: estimatedTime,
      })
      .eq("id", item.id);

    if (error) {
      console.log(error);
    }

    await getBacklog();
    setLoading(false);
  }

  async function fetchSubtasks() {
    try {
      const { data, error } = await supabase
        .from("sub_tasks")
        .select("*")
        .eq("user_story_id", item.id);

      if (error) {
        console.error("Error fetching subtasks:", error);
      } else {
        setSubtasks(
          data.map((subtask) => ({
            ...subtask,
            state: subtask.state || "Todo",
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching subtasks:", error);
    }
  }

  async function addSubtask() {
    if (!newSubtaskName) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("sub_tasks")
        .insert([
          { name: newSubtaskName, user_story_id: item.id, state: "Todo" },
        ]);

      if (error) {
        console.error("Error adding subtask:", error);
      } else {
        await fetchSubtasks();
        setNewSubtaskName(""); // Clear the input field
      }
    } catch (error) {
      console.error("Error adding subtask:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSubtask(index) {
    const subtaskToDelete = subtasks[index];
    setLoading(true);
    try {
      const { error } = await supabase
        .from("sub_tasks")
        .delete()
        .eq("id", subtaskToDelete.id);

      if (error) {
        console.error(`Error deleting subtask ${subtaskToDelete.id}:`, error);
      } else {
        await fetchSubtasks();
      }
    } catch (error) {
      console.error("Error deleting subtask:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubtaskStateChange(index, newState) {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].state = newState; // Update the state in local state

    setSubtasks(updatedSubtasks); // Update the state in React

    setLoading(true);
    try {
      const subtaskId = updatedSubtasks[index].id;
      const { error } = await supabase
        .from("sub_tasks")
        .update({ state: newState })
        .eq("id", subtaskId);

      if (error) {
        console.error(`Error updating subtask ${subtaskId}:`, error);
      }
    } catch (error) {
      console.error("Error updating subtask state:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        {loading ? (
          <Spinner size="large" />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Edit User Story</DialogTitle>
              <DialogDescription>Edit the user story.</DialogDescription>
            </DialogHeader>

            {/* Name Input */}
            <div className="grid gap-4 py-3">
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-5"
                />
              </div>
            </div>

            <div className="grid gap-4 py-1">
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="tag" className="text-right">
                  Tag
                </Label>
                <select
                  id="tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="col-span-5 rounded-md border p-2"
                >
                  <option value="">None</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="DevOps">DevOps</option>
                  <option value="UI">UI</option>
                  <option value="Database">Database</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 py-1">
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="col-span-5 rounded-md border p-2"
                >
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 py-1">
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="storyPoints" className="text-right">
                  Story Points
                </Label>
                <select
                  id="storyPoints"
                  value={storyPoints || ""}
                  onChange={(e) =>
                    setStoryPoints(
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  className="col-span-5 rounded-md border p-2"
                >
                  <option value="">Select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="8">8</option>
                  <option value="13">13</option>
                </select>
              </div>
            </div>
            {/* Estimated Time Input */}
            <div className="grid gap-4 py-1">
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="estimatedTime" className="text-right">
                  Estimated Time
                </Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={estimatedTime}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setEstimatedTime(!isNaN(value) ? value : 0);
                  }}
                  className="col-span-3"
                />
              </div>
            </div>

            <div className="grid gap-4 py-1">
              <div className="grid grid-cols-6 items-center gap-4">
                <Label htmlFor="sprint" className="text-right">
                  Sprint
                </Label>
                <select
                  id="sprint"
                  value={sprint || ""}
                  onChange={(e) =>
                    setSprint(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="col-span-5 rounded-md border p-2"
                >
                  <option value="">None</option>
                  {sprintData &&
                    sprintData.map((sprintItem) => (
                      <option key={sprintItem.id} value={sprintItem.id}>
                        {sprintItem.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="mx-5 py-4">
              <h3 className="mb-1 text-lg font-semibold">Subtasks</h3>
              <div className="flex items-center gap-2">
                <Input
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  placeholder="New subtask name"
                  className="flex-grow"
                />
                <button
                  onClick={addSubtask}
                  className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow outline-offset-2 outline-red-600 transition-colors hover:bg-primary/90 hover:outline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Add Subtask
                </button>
              </div>

              <ul className="mt-2">
                {subtasks && subtasks.length === 0 ? (
                  <p className="col-span-3">No subtasks yet</p>
                ) : subtasks ? (
                  <ul className="col-span-3">
                    {subtasks.map((subtask, index) => (
                      <li
                        key={index}
                        className="my-2 flex items-center justify-between rounded-lg border border-gray-500 px-3 py-2"
                      >
                        {subtask.name}
                        <div>
                          <select
                            id={index}
                            value={subtask.state || ""}
                            onChange={(e) =>
                              handleSubtaskStateChange(index, e.target.value)
                            }
                            className="rounded-md border p-1"
                          >
                            <option value="Todo">Todo</option>
                            <option value="In-Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <button
                            className="ml-3 inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md bg-red-600 px-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            onClick={() => deleteSubtask(index)}
                          >
                            X
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </ul>
            </div>

            {/* Save and Delete Buttons */}
            <DialogClose
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              onClick={handleClick}
            >
              Save Changes
            </DialogClose>
            <DialogClose
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              onClick={deleteStory}
            >
              Delete Story
            </DialogClose>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
