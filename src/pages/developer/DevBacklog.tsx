import AddStory from "@/components/AddStory";
import BacklogTable from "@/components/backlog/BacklogTable";
import DevBacklogV2Table from "@/components/backlog/DevBacklogV2Table";
import { Spinner } from "@/components/ui/spinner";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DevBacklog() {
  const [backlog, setBacklog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sprintData, setSprintData] = useState([]);
  const navigate = useNavigate();

  async function getBacklog() {
    try {
      const { data, error } = await supabase
        .from("user_stories")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        setError("Error fetching backlog.");
        console.log("Error from supabase:", error);
      } else {
        setBacklog(data);
      }
    } catch (error) {
      setError("Error fetching backlog."); // Set error message
      console.error("Error fetching sprint data:", error);
    } finally {
      setLoading(false);
    }
  }

  function storyCompleted(storyId) {
    setBacklog((prevBacklog) =>
      prevBacklog.filter((story) => story.id !== storyId),
    );
  }

  async function getSprintData() {
    try {
      const { data, error } = await supabase.from("sprints").select();

      if (error) {
        console.log(error);
      } else {
        setSprintData(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await getBacklog();
      await getSprintData();
      setLoading(false);
    }

    loadData();
  }, []);

  async function onAddStory(name) {
    setLoading(true);
    const { error } = await supabase.from("user_stories").insert({
      name: name,
      state: "Backlog",
    });
    if (error) {
      console.log(error);
    }
    getBacklog();
    setLoading(false);
  }

  function onEditStory() {
    setDialogOpen(false);
  }

  const activeStories =
    backlog?.filter((story) => story.state !== "Completed") || [];
  const completedStories =
    backlog?.filter((story) => story.state === "Completed") || [];

  if (loading) {
    return (
      <Spinner size="large" className="mt-20 items-center justify-center" />
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh_-_theme(spacing.16))] w-[85%] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <h1 className="text-center text-3xl">Error loading backlog.</h1>
      </main>
    );
  }

  if (!backlog) {
    return (
      <main className="flex items-center">
        <h1 className="text-center text-3xl">No backlog data found.</h1>
      </main>
    );
  }

  if (backlog.length == 0) {
    return (
      <main className="items-center">
        <h1 className="text-center text-3xl">No user stories yet.</h1>
        <div className="mt-10 flex justify-center">
          <AddStory onAddStory={onAddStory} />
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Backlog</h1>
      </div>

      <DevBacklogV2Table backlog={activeStories} fetchBacklog={getBacklog} />

      <h2 className="mt-8 text-2xl font-semibold">Completed User Stories</h2>

      <BacklogTable
        backlog={completedStories}
        fetchBacklog={getBacklog}
        storyCompleted={storyCompleted}
      />
    </main>
  );
}
