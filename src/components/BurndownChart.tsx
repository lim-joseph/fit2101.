import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BurndownChartSprint, UserStory } from "@/types/types";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function BurndownChart() {
  const [chartData, setChartData] = useState<
    { date: string; remainingPoints: number }[]
  >([]);
  const [sprints, setSprints] = useState<BurndownChartSprint[]>([]);
  const [selectedSprint, setSelectedSprint] =
    useState<BurndownChartSprint | null>(null);

  useEffect(() => {
    async function fetchSprints() {
      const { data, error } = await supabase.from("sprints").select("*");
      if (error) {
        console.error("Error fetching sprints:", error);
        return;
      }
      setSprints(data);
      // Set the active sprint as the default selected sprint
      const activeSprint = data.find(
        (s: BurndownChartSprint) => s.status === "Active",
      );
      if (activeSprint) {
        setSelectedSprint(activeSprint);
      }
    }
    fetchSprints();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!selectedSprint) return;

      // Fetch user stories
      const { data: userStories, error: userStoriesError } = await supabase
        .from("user_stories")
        .select("*")
        .eq("sprint_id", selectedSprint.id);

      if (userStoriesError) {
        console.error("Error fetching user stories:", userStoriesError);
        return;
      }

      // Calculate total story points
      const totalPoints = userStories.reduce(
        (sum: number, story: UserStory) => sum + story.story_points,
        0,
      );

      // Sort user stories by completed date
      const sortedStories = userStories
        .filter((story: UserStory) => story.completed_date)
        .sort(
          (a: UserStory, b: UserStory) =>
            new Date(a.completed_date!).getTime() -
            new Date(b.completed_date!).getTime(),
        );

      // Generate chart data
      const data = [];
      let remainingPoints = totalPoints;

      // Add initial point (sprint start date)
      data.push({
        date: selectedSprint.startDate,
        remainingPoints: remainingPoints,
      });

      // Add points for each completed story
      for (const story of sortedStories) {
        remainingPoints -= story.story_points;
        data.push({
          date: story.completed_date!.split("T")[0], // Remove time part
          remainingPoints: remainingPoints,
        });
      }

      setChartData(data);
    }

    fetchData();
  }, [selectedSprint]);

  const handleSprintChange = (sprintId: string) => {
    const sprint = sprints.find((s) => s.id.toString() === sprintId);
    setSelectedSprint(sprint || null);
  };

  if (sprints.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-3xl flex-1">
      <CardHeader>
        <CardTitle>Sprint Burndown Chart</CardTitle>
        <CardDescription>
          Select a sprint to view its burndown chart
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          onValueChange={handleSprintChange}
          defaultValue={selectedSprint?.id.toString()}
        >
          <SelectTrigger className="mb-4 w-[280px]">
            <SelectValue placeholder="Select a sprint" />
          </SelectTrigger>
          <SelectContent>
            {sprints.map((sprint) => (
              <SelectItem key={sprint.id} value={sprint.id.toString()}>
                {sprint.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSprint && chartData.length > 0 ? (
          <ChartContainer
            config={{
              remainingPoints: {
                label: "Remaining Story Points",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="linear"
                  dataKey="remainingPoints"
                  stroke="var(--color-remainingPoints)"
                  name="Remaining Story Points"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div>No data available for the selected sprint</div>
        )}
      </CardContent>
    </Card>
  );
}
