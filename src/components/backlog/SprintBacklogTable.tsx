import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import supabase from "@/utils/supabase";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type UserStory = {
  id: number;
  name: string;
  tag: "Frontend" | "Backend" | "DevOps" | "UI" | "Database" | null;
  priority: "Low" | "Medium" | "High" | "None";
  state: "Backlog" | "Todo" | "In-Progress" | "Completed";
  story_points: number | null;
  estimated_time: number | null;
  time_taken: number | null;
  developer_id: number | null;
  sprint_id: number | null;
  position: number | null;
  subtasks?: Subtask[]; // Add this line for subtasks
};

export type Subtask = {
  id: number;
  name: string;
  state: "Todo" | "In-Progress" | "Completed"; // Subtask state
  user_story_id: number; // FK to user story
};

export type Developer = {
  id: number;
  name: string;
};

export function SprintBacklogTable({ id }) {
  const [data, setData] = useState<UserStory[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedStories, setEditedStories] = useState<{
    [key: number]: Partial<UserStory>;
  }>({});

  const fetchUserStories = async () => {
    try {
      const { data: user_stories, error } = await supabase
        .from("user_stories")
        .select("*")
        .eq("sprint_id", Number(id));

      if (error) {
        setError("Error fetching backlog.");
        console.error("Error fetching user stories:", error);
        return;
      }

      const storiesWithSubtasks = await Promise.all(
        user_stories.map(async (story) => {
          const { data: subtasks, error } = await supabase
            .from("sub_tasks")
            .select("*")
            .eq("user_story_id", story.id);

          if (error) {
            console.error("Error fetching subtasks:", error);
          }

          return { ...story, subtasks: subtasks || [] };
        }),
      );

      setData(storiesWithSubtasks);
    } catch (error) {
      setError("Error fetching backlog.");
      console.error("Error fetching user stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const { data: developersList, error } = await supabase
        .from("developers")
        .select("*");
      if (error) {
        setError("Error fetching developers.");
        console.error("Error fetching developers:", error);
      } else {
        setDevelopers(developersList);
      }
    } catch (error) {
      setError("Error fetching developers.");
      console.error("Error fetching developers:", error);
    }
  };

  useEffect(() => {
    fetchUserStories();
    fetchDevelopers();
  }, [id]);

  const handleFieldChange = useCallback(
    (storyId: number, field: keyof UserStory, value: number | null) => {
      setEditedStories((prev) => ({
        ...prev,
        [storyId]: {
          ...prev[storyId],
          [field]: value,
        },
      }));
    },
    [],
  );

  const handleSubmit = async (storyId: number) => {
    const updatedData = editedStories[storyId];

    if (updatedData) {
      setLoading(true);
      const { error } = await supabase
        .from("user_stories")
        .update(updatedData)
        .eq("id", storyId);

      if (error) {
        console.error("Error updating story:", error);
      } else {
        await fetchUserStories(); // Refresh data after update
      }
      setLoading(false);
      setEditedStories((prev) => {
        const newState = { ...prev };
        delete newState[storyId]; // Remove edited story from state
        return newState;
      });
    }
  };

  const handleSubtaskStateChange = async (
    subtaskId: number,
    newState: string,
  ) => {
    try {
      setLoading(true); // Show loading state
      const { error } = await supabase
        .from("sub_tasks")
        .update({ state: newState })
        .eq("id", subtaskId);

      if (error) {
        console.error(`Error updating subtask ${subtaskId}:`, error);
      } else {
        await fetchUserStories(); // Refresh to show updated subtasks
      }
    } catch (error) {
      console.error("Error updating subtask state:", error);
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const columns: ColumnDef<UserStory>[] = [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: false,
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      sortingFn: (a, b) => {
        const priorityOrder = {
          High: 3,
          Medium: 2,
          Low: 1,
          None: 0,
        };
        const aValue = a.getValue("priority") || "None";
        const bValue = b.getValue("priority") || "None";
        return priorityOrder[bValue] - priorityOrder[aValue];
      },
      enableSorting: true,
    },
    {
      accessorKey: "tag",
      header: "Tag",
      enableSorting: false,
      cell: ({ row }) => {
        const tag = row.getValue<string>("tag");
        return <div>{tag || "N/A"}</div>;
      },
    },
    {
      accessorKey: "story_points",
      header: "Story Points",
      cell: ({ row }) => {
        const points = row.getValue<number>("story_points");
        return (
          <select
            value={editedStories[row.original.id]?.story_points || points || ""}
            onChange={(e) =>
              handleFieldChange(
                row.original.id,
                "story_points",
                Number(e.target.value) || null,
              )
            }
          >
            <option value="">N/A</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="8">8</option>
            <option value="13">13</option>
            <option value="21">21</option>
          </select>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "estimated_time",
      header: "Estimated Time (hours)",
      cell: ({ row }) => {
        const estimatedTime = row.getValue<number>("estimated_time");
        return (
          <input
            type="number"
            value={
              editedStories[row.original.id]?.estimated_time ||
              estimatedTime ||
              ""
            }
            onChange={(e) =>
              handleFieldChange(
                row.original.id,
                "estimated_time",
                Number(e.target.value) || null,
              )
            }
            placeholder="Estimated Time"
            className="w-full"
          />
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "time_taken",
      header: "Time Taken (hours)",
      cell: ({ row }) => {
        const timeTaken = row.getValue<number>("time_taken");
        return (
          <input
            type="number"
            value={
              editedStories[row.original.id]?.time_taken || timeTaken || ""
            }
            onChange={(e) =>
              handleFieldChange(
                row.original.id,
                "time_taken",
                Number(e.target.value) || null,
              )
            }
            placeholder="Time Taken"
            className="w-full"
          />
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "developer_id",
      header: "Assign Developer",
      cell: ({ row }) => {
        const developerId = row.getValue<number>("developer_id");
        return (
          <select
            value={
              editedStories[row.original.id]?.developer_id || developerId || ""
            }
            onChange={(e) =>
              handleFieldChange(
                row.original.id,
                "developer_id",
                Number(e.target.value) || null,
              )
            }
          >
            <option value="">Unassigned</option>
            {developers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name}
              </option>
            ))}
          </select>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSubmit(row.original.id)}
        >
          Submit
        </Button>
      ),
      enableSorting: false,
    },
    {
      id: "subtasks",
      header: "Subtasks",
      cell: ({ row }) => {
        const subtasks = row.original.subtasks || [];
        return (
          <div className="flex flex-col space-y-1">
            {subtasks.length > 0 ? (
              subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between rounded-md border p-1"
                >
                  <span>{subtask.name}</span>
                  <select
                    value={subtask.state}
                    onChange={(e) =>
                      handleSubtaskStateChange(subtask.id, e.target.value)
                    }
                  >
                    <option value="Todo">Todo</option>
                    <option value="In-Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              ))
            ) : (
              <span>No Subtasks</span>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <Spinner size="large" className="mt-20 items-center justify-center" />
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh_-_theme(spacing.16))] w-[85%] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <h1 className="text-center text-3xl">{error}</h1>
      </main>
    );
  }

  return (
    <main>
      <div className="mt-5 w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="divide-x">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="divide-x">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
