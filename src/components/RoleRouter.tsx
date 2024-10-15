import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

async function authenticate(user) {
  if (user == null) {
    return false;
  }
  const email = user.email;

  try {
    const { data, error } = await supabase
      .from("developers")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (error) {
      console.log(error);
      return false;
    }

    if (data.length < 1) {
      return false;
    }

    const role = data[0].role;
    if (role == "D") {
      return "D";
    } else if (role == "SM") {
      return "SM";
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export default function RoleRouter({ user, smElement, dElement }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    async function checkUser() {
      const role = await authenticate(user);
      if (role == false) {
        setAuthenticated(false);
      } else {
        setAuthenticated(true);
      }
      setRole(role);
      setLoading(false);
    }
    checkUser();
  }, []);

  if (loading) {
    return (
      <Spinner size="large" className="mt-20 items-center justify-center" />
    );
  }

  console.log(role);

  if (role === "SM") {
    return smElement;
  } else if (role === "D") {
    return dElement;
  } else {
    return (
      <h1 className="text-center text-5xl font-bold">401 - Unauthorized</h1>
    );
  }
}
