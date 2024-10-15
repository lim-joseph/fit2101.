export type UserStory = {
  id: number;
  name: string;
  tag: "Frontend" | "Backend" | "Devops" | "UI" | "Database";
  priority: "Low" | "Medium" | "High";
  state: "Backlog" | "Todo" | "In-Progress" | "Completed";
  story_points: number;
  developer_id: number;
  sprint_id: number;
  position: number;
  time_taken: number | null;
  completed_date?: string | null;
};

export interface Sprint {
  sprintName: string;
  startDate: string;
  status: string;
}

export interface BurndownChartSprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Completed" | "Inactive";
}
