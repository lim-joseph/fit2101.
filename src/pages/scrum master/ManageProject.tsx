import MembersTable from "@/components/MembersTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  email: string;
  name: string;
  role: string;
  exampleRequired: string;
};

export default function ManageProject() {
  const [members, setMembers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    addMember(data.email, data.name, selectedRole);
    setSelectedRole("");
  };

  useEffect(() => {
    getMembers();
  }, []);

  async function getMembers() {
    try {
      const { data: members, error } = await supabase
        .from("developers")
        .select();
      if (error) {
        console.log(error);
      } else {
        setMembers(members);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function addMember(email: string, name: string, role: string) {
    // get the name of member from users table
    console.log(role);
    const { error } = await supabase
      .from("developers")
      .insert([{ email: email, name: name, role: role }])
      .select();

    if (error) {
      console.log("error", error);
      return;
    }
    setMembers([...members, { email, name, role }]);
  }

  return (
    <section className="flex flex-col gap-4">
      {/* left nav */}
      <div className="mx-auto grid w-full gap-2">
        <h1 className="text-3xl font-semibold">Settings ⚙️</h1>
      </div>
      <div className="mx-auto grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav
          className="grid gap-4 text-sm text-muted-foreground"
          x-chunk="dashboard-04-chunk-0"
        >
          <a className="font-semibold text-primary">
            Manage Project Memebers 👥
          </a>
        </nav>

        {/* right card */}
        <div className="grid gap-6">
          <Card x-chunk="dashboard-04-chunk-1">
            <CardHeader>
              <CardTitle>Team members</CardTitle>
              <CardDescription>
                List of all developers in your project
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
              <div>
                <Label htmlFor="name">Add a new member</Label>
                {errors.email && (
                  <span className="ml-2 text-xs text-red-500">
                    Please fill out both fields.
                  </span>
                )}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex justify-between gap-4"
                >
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="w-full"
                    {...register("name", { required: true })}
                  />
                  <Input
                    id="email"
                    placeholder="someone@example.com"
                    className="w-full"
                    {...register("email", { required: true })}
                  />
                  <Select
                    required
                    onValueChange={setSelectedRole}
                    value={selectedRole}
                  >
                    <SelectTrigger className="w-1/3">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SM">Scrum Master</SelectItem>
                      <SelectItem value="D">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit">Add member</Button>
                </form>
              </div>

              {/* table */}
              <MembersTable members={members} setMembers={setMembers} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
