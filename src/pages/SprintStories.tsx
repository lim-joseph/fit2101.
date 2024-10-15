import { SprintBacklogTable } from "@/components/backlog/SprintBacklogTable";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UserStory } from "@/types/types";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function SprintStories() {
  const { id: sprintId } = useParams<{ id: string }>();
  const [backlog, setBacklog] = useState<UserStory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBacklog();
  }, [sprintId]);

  async function fetchBacklog() {
    try {
      const { data, error } = await supabase
        .from("user_stories")
        .select("*")
        .eq("sprint_id", Number(sprintId));

      if (error) {
        setError("No sprint data found."); // Set error message
        console.log("Error from supabase:", error);
      } else {
        setBacklog(data);
      }
    } catch (error) {
      setError("Error fetching sprint data."); // Set error message
      console.error("Error fetching sprint data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Spinner size="large" className="mt-20 items-center justify-center" />
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh_-_theme(spacing.16))] w-[85%] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <h1 className="text-center text-3xl">No backlog data found.</h1>
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

  return (
    <main className="flex flex-col gap-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Sprint Backlog</h1>
        <Button asChild>
          <Link to={`/sprint/${sprintId}`}>Back to Sprint</Link>
        </Button>
      </div>
      <section>
        <SprintBacklogTable id={sprintId} />
      </section>
    </main>
  );
}
