import { Spinner } from "@/components/ui/spinner";
import supabase from "@/utils/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddSprintForm } from "../../components/AddSprintForm";

export default function AddSprint() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(data) {
    setLoading(true);
    const { error } = await supabase.from("sprints").insert({
      name: data.sprintName,
      start_date: data.startDate,
      end_date: data.endDate,
      status: "Inactive",
    });
    if (error) {
      console.log(error);
      navigate("/sprints");
    }
    setLoading(false);
    navigate("/sprints");
  }

  if (loading) {
    return (
      <Spinner size="large" className="mt-20 items-center justify-center" />
    );
  }

  return (
    <section>
      <h1 className="mb-5 text-3xl font-bold">Add Sprint</h1>
      <AddSprintForm onSubmit={onSubmit} />
    </section>
  );
}
