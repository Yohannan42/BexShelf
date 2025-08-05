import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/MobileNav";
import MusicPlayer from "@/components/MusicPlayer";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  BookMarked,
  BookCopy,
  PenTool,
  Calendar,
  Moon,
  Sun,
  LogOut,
  User,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: BookOpen,
  },
  {
    title: "Library",
    href: "/library",
    icon: BookMarked,
  },
  {
    title: "Journals",
    href: "/journals",
    icon: BookCopy,
  },
  {
    title: "Writing",
    href: "/writing",
    icon: PenTool,
  },
  {
    title: "Planning",
    href: "/planning",
    icon: Calendar,
  },
];

export default function Navigation() {
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MobileNav items={navItems} />

        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">BexShelf</span>
          </Link>
          {isAuthenticated && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isAuthenticated && <MusicPlayer />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          {isAuthenticated && user && (
            <div className="flex items-center space-x-2 ml-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span className="hidden md:inline text-foreground/80">
                  {user.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Logout"
                className="text-foreground/60 hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
