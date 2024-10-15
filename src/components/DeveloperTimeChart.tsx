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
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface Developer {
  id: number;
  name: string;
}

interface ChartData {
  developer: string;
  timeSpent: number;
}

export default function DeveloperTimeChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [sprints, setSprints] = useState<BurndownChartSprint[]>([]);
  const [selectedSprint, setSelectedSprint] =
    useState<BurndownChartSprint | null>(null);
  const [developers, setDevelopers] = useState<Developer[]>([]);

  useEffect(() => {
    async function fetchInitialData() {
      // Fetch sprints
      const { data: sprintsData, error: sprintsError } = await supabase
        .from("sprints")
        .select("*");

      if (sprintsError) {
        console.error("Error fetching sprints:", sprintsError);
        return;
      }
      setSprints(sprintsData);

      // Set the active sprint as the default selected sprint
      const activeSprint = sprintsData.find(
        (s: BurndownChartSprint) => s.status === "Active",
      );
      if (activeSprint) {
        setSelectedSprint(activeSprint);
      }

      // Fetch developers
      const { data: developersData, error: developersError } = await supabase
        .from("developers")
        .select("*");

      if (developersError) {
        console.error("Error fetching developers:", developersError);
        return;
      }
      setDevelopers(developersData);
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!selectedSprint) return;

      // Fetch user stories for the selected sprint
      const { data: userStories, error: userStoriesError } = await supabase
        .from("user_stories")
        .select("*")
        .eq("sprint_id", selectedSprint.id);

      if (userStoriesError) {
        console.error("Error fetching user stories:", userStoriesError);
        return;
      }

      // Calculate time spent by each developer
      const developerTimeMap = new Map<number, number>();
      userStories.forEach((story: UserStory) => {
        if (story.time_taken !== null) {
          const currentTime = developerTimeMap.get(story.developer_id) || 0;
          developerTimeMap.set(
            story.developer_id,
            currentTime + story.time_taken,
          );
        }
      });

      // Generate chart data
      const data: ChartData[] = developers.map((dev) => ({
        developer: dev.name,
        timeSpent: developerTimeMap.get(dev.id) || 0,
      }));

      setChartData(data);
    }

    fetchData();
  }, [selectedSprint, developers]);

  const handleSprintChange = (sprintId: string) => {
    const sprint = sprints.find((s) => s.id.toString() === sprintId);
    setSelectedSprint(sprint || null);
  };

  if (sprints.length === 0 || developers.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-3xl flex-1">
      <CardHeader>
        <CardTitle>Developer Time Spent Chart</CardTitle>
        <CardDescription>
          Select a sprint to view time spent by each developer
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
              timeSpent: {
                label: "Time Spent (hours)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="developer" />
                <YAxis
                  label={{
                    value: "Time Spent (hours)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="timeSpent"
                  fill="var(--color-timeSpent)"
                  name="Time Spent"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div>No data available for the selected sprint</div>
        )}
      </CardContent>
    </Card>
  );
}
