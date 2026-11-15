import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";
import { ShieldCheck, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout, navigateToLogin } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (path) => currentPath === path;

  return (
    <header className="border-b border-border/80 sticky top-0 bg-background/95 backdrop-blur z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-mono font-bold text-sm tracking-tight">
          <span className="w-5 h-5 rounded bg-foreground text-background flex items-center justify-center text-xs font-black">m</span>
          minicaptcha
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 text-xs font-medium">
          <Link
            to="/solve"
            className={`transition-colors ${
              isActive("/solve") ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Solve
          </Link>
          <Link
            to="/embed"
            className={`transition-colors ${
              isActive("/embed") ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Embed
          </Link>
          <Link
            to="/account"
            className={`px-3 py-1.5 rounded border transition-colors font-mono flex items-center gap-1.5 ${
              isActive("/account")
                ? "bg-foreground text-background border-foreground"
                : "border-border bg-card hover:bg-muted text-foreground"
            }`}
          >
            <User className="w-3 h-3" />
            <span>Account</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border text-xs">
              <span className="text-muted-foreground hidden md:inline truncate max-w-[120px] font-mono text-[11px]">
                {user?.email}
              </span>
              <button
                onClick={() => logout()}
                title="Sign out"
                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigateToLogin()}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}