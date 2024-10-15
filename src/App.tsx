import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header.tsx";
import RoleRouter from "./components/RoleRouter.tsx";
import { Spinner } from "./components/ui/spinner.tsx";
import UnauthorizedRoute from "./components/UnauthorizedRoute.tsx";
import DevBacklog from "./pages/developer/DevBacklog.tsx";
import DevSprint from "./pages/developer/DevSprint.tsx";
import DevSprints from "./pages/developer/DevSprints.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import Backlog from "./pages/scrum master/Backlog.tsx";
import EditSprint from "./pages/scrum master/EditSprint.tsx";
import ManageProject from "./pages/scrum master/ManageProject.tsx";
import Sprint from "./pages/scrum master/Sprint.tsx";
import Sprints from "./pages/scrum master/Sprints.tsx";
import SprintBacklog from "./pages/SprintStories.tsx";
import Statistics from "./pages/Statistics.tsx";

async function fetchUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user || null;
}

function AppWrapped() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const user = await fetchUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <Spinner size="large" className="mt-20 items-center justify-center" />
    );
  }

  return (
    <>
      {!isLandingPage && user && <Header />}
      {isLandingPage ? (
        <LandingPage />
      ) : (
        <div className="mx-auto flex min-h-[calc(100vh_-_theme(spacing.16))] w-[85%] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          <Routes>
            <Route
              path="/sprints"
              element={
                <RoleRouter
                  user={user}
                  smElement={<Sprints />}
                  dElement={<DevSprints />}
                />
              }
            />
            <Route
              path="/sprint/:id"
              element={
                <RoleRouter
                  user={user}
                  smElement={<Sprint />}
                  dElement={<DevSprint />}
                />
              }
            />
            <Route
              path="/sprint/:id/backlog"
              element={
                <RoleRouter
                  user={user}
                  smElement={<SprintBacklog />}
                  dElement={<SprintBacklog />}
                />
              }
            />
            <Route
              path="/sprint/:id/edit"
              element={
                <RoleRouter
                  user={user}
                  smElement={<EditSprint />}
                  dElement={<UnauthorizedRoute />}
                />
              }
            />
            <Route
              path="/manage-project"
              element={
                <RoleRouter
                  user={user}
                  smElement={<ManageProject />}
                  dElement={<UnauthorizedRoute />}
                />
              }
            />
            <Route
              path="/product-backlog"
              element={
                <RoleRouter
                  user={user}
                  smElement={<Backlog />}
                  dElement={<DevBacklog />}
                />
              }
            />
            <Route
              path="/statistics"
              element={
                <RoleRouter
                  user={user}
                  smElement={<Statistics />}
                  dElement={<Statistics />}
                />
              }
            />
            <Route
              path="*"
              element={
                <h1 className="text-center text-5xl font-bold">
                  404 - Not Found
                </h1>
              }
            />
          </Routes>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapped />
    </Router>
  );
}
