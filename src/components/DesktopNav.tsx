import { SquareKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { navItems } from "../data/navItems";

// This component is only visible when screen size >= md
export default function DesktopNav() {
  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <a
        href="/sprints"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <SquareKanban className="h-6 w-6" />
        <p>FIT2101</p>
        <span className="sr-only">FIT2101</span>
      </a>

      {navItems.map((item) => (
        <Link
          to={item.route}
          key={item.route}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
