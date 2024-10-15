import { EditSprintForm } from "@/components/EditSprintForm";
import { Spinner } from "@/components/ui/spinner";
import { Sprint } from "@/types/types";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditSprint() {
  const { id } = useParams();
  const [sprint, setSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Add an error state
  const [isActiveSprintPresent, setIsActiveSprintPresent] = useState(false); // Track active sprint
  const navigate = useNavigate();

  async function onSubmit(data: Sprint) {
    setLoading(true);
    const { error } = await supabase
      .from("sprints")
      .update({
        name: data.sprintName,
        start_date: data.startDate,
        end_date: new Date(
          new Date(data.startDate).setDate(
            new Date(data.startDate).getDate() + 14,
          ),
        ),
        status: data.status,
      })
      .eq("id", id);

    if (error) {
      console.log(error);
      navigate("/sprints");
    }

    setLoading(false);
    navigate("/sprints");
  }

  async function getSprint(id: string | undefined) {
    try {
      const { data, error } = await supabase
        .from("sprints")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("No sprint data found.");
        console.log("Error from supabase:", error);
      } else {
        setSprint(data);
      }

      // Fetch all sprints to check if any sprint is active
      const { data: allSprints, error: fetchError } = await supabase
        .from("sprints")
        .select("*");

      if (fetchError) {
        console.error("Error fetching all sprints:", fetchError);
      } else {
        const activeSprint = allSprints.some(
          (sprint) => sprint.status === "Active",
        );
        setIsActiveSprintPresent(activeSprint); // Set true if any sprint is active
      }
    } catch (error) {
      setError("Error fetching sprint data.");
      console.error("Error fetching sprint data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getSprint(id);
  }, [id]);

  if (loading) {
    return (
      <Spinner size="large" className="mt-20 items-center justify-center" />
    );
  }

  if (error) {
    return (
      <main>
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
    <main className="m-auto mt-10 w-3/4 md:w-7/12 xl:w-5/12">
      <EditSprintForm
        initialValues={sprint}
        onSubmit={onSubmit}
        isActiveSprintPresent={isActiveSprintPresent}
      />
    </main>
  );
}
