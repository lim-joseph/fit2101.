import { Menu, SquareKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { navItems } from "../data/navItems";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium">
          <a href="/" className="flex items-center gap-2 text-lg font-semibold">
            <SquareKanban className="h-6 w-6" />
            <p>FIT2101</p>
            <span className="sr-only">FIT2101</span>
          </a>
          {navItems.map((item) => (
            <Link
              to={item.route}
              key={item.route}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
