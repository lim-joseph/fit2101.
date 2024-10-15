import supabase from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { CircleUser } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function UserNavDropdown({
  username,
  setUser,
}: {
  username: string;
  setUser: (user: User | null) => void;
}) {
  const navigate = useNavigate();
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(`Error logging out: ${error.message}`);
    }
    setUser(null);
    navigate("/");
  }
  return (
    <div className="items-center gap-4 md:gap-2 lg:gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="flex gap-4 rounded-full">
            <p>{username}</p>
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
