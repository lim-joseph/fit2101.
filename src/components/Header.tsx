import supabase from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import { useNavigate } from "react-router-dom";
import DesktopNav from "../components/DesktopNav";
import MobileNav from "../components/MobileNav";
import UserNavDropdown from "./UserNavDropdown";
import { Button } from "./ui/button";

export default function Header() {
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
      return;
    }
    setUser(user);
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
    } else {
      console.log("auth");
    }
  }
  async function handleOnIdle() {
    if (user) {
      //log the user out
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.log(error);
        //navigate('/');// even if there is an error singing out( them not being logged in or still being on the lanfing page) they get redirected to landing page(nothing happens)
      }
      //redirect it to landing page once merged with main, as currently, landing page isnt part of main. Rn it should direct to sprints
      setUser(null);
      navigate("/");
    }
  }
  useIdleTimer({
    timeout: 60 * 10 * 1000, //timed in milliseconds, thus this would equal 10 mins
    onIdle: handleOnIdle,
    debounce: 5000, // 5 seconds
  });
  return (
    <header className="sticky flex h-16 items-center border-b bg-white">
      <div className="mx-auto flex w-[85%] justify-between gap-4 md:px-6">
        <DesktopNav />
        <MobileNav />
        {user ? (
          <UserNavDropdown
            username={user.user_metadata.name}
            setUser={setUser}
          />
        ) : (
          <Button onClick={login}>Login</Button>
        )}
      </div>
    </header>
  );
}
