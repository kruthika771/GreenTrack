import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Leaf, Menu, X, Sun, Moon, LogIn, UserPlus, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/calculator", label: "Calculator" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/tips", label: "Tips" },
  { path: "/about", label: "About" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const { user, displayName, signOut } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  const userName = displayName || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 glass-card border-b rounded-none">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary">
            <Leaf className="w-6 h-6" />
            GreenTrack
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={() => setDark(!dark)}
              className="ml-2 p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={dark ? "sun" : "moon"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <div className="ml-2 flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-secondary-foreground">
                    <User className="w-3.5 h-3.5" />
                    {userName}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                    <LogOut className="w-4 h-4 mr-1" /> Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setAuthModal("login")} className="text-muted-foreground hover:text-foreground">
                    <LogIn className="w-4 h-4 mr-1" /> Login
                  </Button>
                  <Button size="sm" onClick={() => setAuthModal("register")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <UserPlus className="w-4 h-4 mr-1" /> Register
                  </Button>
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="p-4 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-border mt-2 pt-3 flex flex-col gap-2">
                  {user ? (
                    <>
                      <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                        <User className="w-4 h-4 text-primary" /> {userName}
                      </span>
                      <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-secondary text-left">
                        <LogOut className="w-4 h-4 inline mr-2" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setAuthModal("login"); setMobileOpen(false); }} className="px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-secondary text-left">
                        <LogIn className="w-4 h-4 inline mr-2" /> Login
                      </button>
                      <button onClick={() => { setAuthModal("register"); setMobileOpen(false); }} className="px-4 py-3 rounded-lg text-sm bg-primary text-primary-foreground text-left">
                        <UserPlus className="w-4 h-4 inline mr-2" /> Register
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>🌍 GreenTrack — Track your carbon footprint. Save the planet.</p>
        </div>
      </footer>

      <AuthModal open={authModal !== null} onClose={() => setAuthModal(null)} defaultTab={authModal || "login"} />
    </div>
  );
}
