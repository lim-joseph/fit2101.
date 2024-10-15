import { AddSprintForm } from "@/components/AddSprintForm";
import { Card } from "@/components/ui/card";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sprints() {
  interface Sprint {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
  }

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSprints();
  }, []);

  async function getSprints() {
    try {
      const { data, error } = await supabase.from("sprints").select("*");
      if (error) {
        console.log(error);
      } else {
        setSprints(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function openSprint(sprint: Sprint) {
    navigate(`/sprint/${sprint.id}`, { state: { sprint } });
  }

  // seperated complete from active sprints
  const activeSprint = sprints.filter(
    (sprint) => sprint.status !== "Completed",
  );
  const completedSprint = sprints.filter(
    (sprint) => sprint.status === "Completed",
  );

  return (
    <main>
      <section>
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Sprints</h1>
          <AddSprintForm getSprints={getSprints} />
        </div>
        <div className="mt-5 grid min-h-60 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeSprint.map((sprint) => {
            const startDate = new Date(sprint.start_date);
            const endDate = new Date(sprint.end_date);

            const options = { year: "numeric", month: "long", day: "numeric" };
            const formattedStartDate = startDate.toLocaleDateString(
              "en-US",
              options,
            );
            const formattedEndDate = endDate.toLocaleDateString(
              "en-US",
              options,
            );

            return (
              <Card
                onClick={() => openSprint(sprint)}
                key={sprint.id}
                className="rounded-md border p-4 shadow-sm transition-shadow duration-300 hover:cursor-pointer hover:shadow-md"
              >
                <h2 className="mb-3 text-2xl font-bold">{sprint.name}</h2>
                <h3 className="text-xl">Start: {formattedStartDate}</h3>
                <h3 className="text-xl">End: {formattedEndDate}</h3>
                <h4 className="mt-4 text-xl">Status: {sprint.status}</h4>
              </Card>
            );
          })}
        </div>
      </section>
      <section>
        <div className="justify-between, mt-5 flex">
          <h1 className="text-3xl font-bold">Completed Sprints</h1>
        </div>
        <div className="mt-5 grid min-h-60 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {completedSprint.map((sprint) => {
            const startDate = new Date(sprint.start_date);
            const endDate = new Date(sprint.end_date);

            const options = { year: "numeric", month: "long", day: "numeric" };
            const formattedStartDate = startDate.toLocaleDateString(
              "en-US",
              options,
            );
            const formattedEndDate = endDate.toLocaleDateString(
              "en-US",
              options,
            );

            return (
              <Card
                onClick={() => openSprint(sprint)}
                key={sprint.id}
                className="rounded-md border p-4 shadow-sm transition-shadow duration-300 hover:cursor-pointer hover:shadow-md"
              >
                <h2 className="mb-3 text-2xl font-bold">{sprint.name}</h2>
                <h3 className="text-xl">Start: {formattedStartDate}</h3>
                <h3 className="text-xl">End: {formattedEndDate}</h3>
                <h4 className="mt-4 text-xl">Status: {sprint.status}</h4>
              </Card>
            );
          })}
        </div>
      </section>

      {/* <div className="mt-8 grid min-h-60 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sprints.map((sprint) => {
          const startDate = new Date(sprint.start_date);
          const endDate = new Date(sprint.end_date);

          const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
          };
          const formattedStartDate = startDate.toLocaleDateString(
            "en-US",
            options,
          );
          const formattedEndDate = endDate.toLocaleDateString("en-US", options);

          return (
            <Card
              onClick={() => openSprint(sprint)}
              key={sprint.id}
              className="transition-shadow duration-300 hover:cursor-pointer hover:shadow-md"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  {sprint.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Start: {formattedStartDate}</CardDescription>
                <CardDescription>End: {formattedEndDate}</CardDescription>
              </CardContent>
              <CardFooter>
                <CardDescription>Status: {sprint.status}</CardDescription>
              </CardFooter>
            </Card>
          );
        })}
      </div> */}
    </main>
  );
}
