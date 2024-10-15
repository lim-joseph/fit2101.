import supabase from "@/utils/supabase";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function MembersTable({ members, setMembers }) {
  async function deleteMember(email: string) {
    console.log(email);
    const { error } = await supabase
      .from("developers")
      .delete()
      .eq("email", email);

    if (error) {
      console.log("error", error);
      return;
    }
    setMembers(members.filter((member) => member.email !== email));
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members &&
          members.map((member) => (
            <TableRow key={crypto.randomUUID()}>
              <TableCell className="w-1/6 font-medium">{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                {member.role === "SM"
                  ? "Scrum Master"
                  : member.role === "D"
                    ? "Developer"
                    : member.role}
              </TableCell>
              <TableCell>
                <Button onClick={() => deleteMember(member.email)}>
                  Delete user
                </Button>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
