import supabase from "@/utils/supabase";
import * as React from "react";
import { useEffect, useState } from "react";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Spinner } from "@/components/ui/spinner";

export type UserStory = {
  id: number;
  name: string;
  tag: "Frontend" | "Backend" | "DevOps" | "UI" | "Database" | null;
  priority: "Low" | "Medium" | "High" | "None";
  state: "Backlog" | "Todo" | "In-Progress" | "Completed";
  story_points: number | null;
  developer_id: number | null;
  sprint_id: number | null;
  position: number | null;
};

export type Sprint = {
  id: number;
  sprintName: string;
  startDate: string;
  status: string;
};

export default function DevBacklogV2Table() {
  const [data, setData] = useState<UserStory[]>([]);
  const [sprintData, setSprintData] = useState<Sprint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);

  const fetchUserStories = async () => {
    try {
      const { data: user_stories, error } = await supabase
        .from("user_stories")
        .select("*")
        .eq("state", "Backlog");
      if (error) {
        setError("Error fetching backlog.");
        console.error("Error fetching user stories:", error);
      } else {
        setData(user_stories);
      }
    } catch (error) {
      setError("Error fetching backlog.");
      console.error("Error fetching user stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSprintData = async () => {
    try {
      const { data: sprints, error } = await supabase
        .from("sprints")
        .select("*");
      if (error) {
        console.error("Error fetching sprint data:", error);
      } else {
        setSprintData(sprints);
      }
    } catch (error) {
      console.error("Error fetching sprint data:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUserStories();
      await fetchSprintData();
      setLoading(false);
    };
    loadData();
  }, []);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "priority", desc: false },
  ]);

  const handleEditClick = (story: UserStory) => {
    setSelectedStory(story);
    setDialogOpen(true);
  };

  const onEditStory = () => {
    fetchUserStories();
    setDialogOpen(false);
    setSelectedStory(null);
  };

  const onAddStory = async (name: string) => {
    setLoading(true);
    const { error } = await supabase.from("user_stories").insert({
      name: name,
      state: "Backlog",
    });
    if (error) {
      console.error("Error adding story:", error);
    }
    await fetchUserStories();
    setLoading(false);
  };

  const columns: ColumnDef<UserStory>[] = [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: false,
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
      sortingFn: (a, b, columnId) => {
        const priorityOrder = {
          High: 3,
          Medium: 2,
          Low: 1,
          None: 0,
        };
        const aValue =
          a.getValue<keyof typeof priorityOrder>("priority") || "None";
        const bValue =
          b.getValue<keyof typeof priorityOrder>("priority") || "None";
        return priorityOrder[bValue] - priorityOrder[aValue];
      },
      enableSorting: true,
    },
    {
      accessorKey: "story_points",
      header: "Story Points",
      cell: ({ row }) => {
        const points = row.getValue<number>("story_points");
        return (
          <div className="text-left">{points !== null ? points : "N/A"}</div>
        );
      },
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
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
      <div className="flex justify-between"></div>
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
