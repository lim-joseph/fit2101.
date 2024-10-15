import KanbanBoard from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import supabase from "@/utils/supabase";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

interface Sprint {
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function Sprint() {
  const { id } = useParams<{ id: string }>();
  const [sprint, setSprint] = useState<Sprint>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Add an error state
  const navigate = useNavigate();

  async function getSprint(id: string | undefined) {
    try {
      const { data, error } = await supabase
        .from("sprints")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("No sprint data found."); // Set error message
        console.log("Error from supabase:", error);
      } else {
        setSprint(data);
      }
    } catch (error) {
      setError("Error fetching sprint data."); // Set error message
      console.error("Error fetching sprint data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getSprint(id);
  }, [id]);

  async function onDelete() {
    setLoading(true);
    const { error } = await supabase.from("sprints").delete().eq("id", id);
    if (error) {
      console.log(error);
    }
    setLoading(false);
    navigate("/sprints");
  }

  if (loading) {
    return (
      <Spinner size="large" className="mt-20 items-center justify-center" />
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh_-_theme(spacing.16))] w-[85%] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <h1 className="text-center text-3xl">No sprint data found.</h1>
      </main>
    );
  }

  if (!sprint) {
    return (
      <main className="flex items-center">
        <h1 className="text-center text-3xl">No sprint data found.</h1>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-12">
      <div>
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">{sprint.name}</h1>
          <div className="flex gap-4">
            <Button asChild>
              <Link to={`/sprint/${id}/backlog`}>Edit Stories</Link>
            </Button>
            <Button variant={"outline"} asChild>
              <Link to={`/sprint/${id}/edit`}>Edit Sprint</Link>
            </Button>
            {sprint.status !== "Active" && (
              <Button variant={"destructive"} onClick={onDelete}>
                Delete
              </Button>
            )}
            <Button variant={"outline"}>
              <Link to="/sprints">Back to Sprints</Link>
            </Button>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-1">
          <li>
            <span className="font-semibold">Start Date:</span>{" "}
            {format(new Date(sprint.start_date), "MMMM d, yyyy")}
          </li>
          <li>
            <span className="font-semibold">End Date:</span>{" "}
            {format(new Date(sprint.end_date), "MMMM d, yyyy")}
          </li>
          <li>
            <span className="font-semibold">Status:</span> {sprint.status}
          </li>
        </ul>
      </div>

      <section>
        <KanbanBoard id={id} />
      </section>
    </main>
  );
}
