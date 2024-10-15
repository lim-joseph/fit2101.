import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.log("Error fetching user:", error);
    } else {
      setUser(user);
    }
  };

  async function login() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://fit2101-public.vercel.app/sprints",
      },
    });

    if (error) {
      console.error(`Error logging in: ${error.message}`);
    }
  }

  return (
    <main className="m-0 flex h-screen w-screen items-center justify-center bg-teal-500 p-0">
      <div className="flex flex-col items-center">
        <h1 className="mb-8 text-4xl font-bold text-white">
          Welcome to Project Management Tool
        </h1>
        <Button
          className="bg-gray-800 px-8 py-4 text-lg text-white hover:bg-gray-700"
          onClick={login}
        >
          Log In
        </Button>
      </div>
    </main>
  );
}
