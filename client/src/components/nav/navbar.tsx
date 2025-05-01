import { Link } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import ThemeToggle from "@/components/ui/theme-toggle";
import UserDropdown from "@/components/ui/user-dropdown";
import { useAuth } from "@/hooks/use-auth";
import { MapPin } from "lucide-react";

export default function Navbar() {
  const isMobile = useMobile();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="text-primary h-6 w-6" />
          <Link href="/">
            <span className="font-bold text-xl dark:text-white cursor-pointer">
              SkillKart
            </span>
          </Link>
        </div>
        
        {!isMobile && (
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/roadmap" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              My Roadmap
            </Link>
            <Link href="/community" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Community
            </Link>
            <Link href="/profile" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              Profile
            </Link>
            {(user.role === 'curator' || user.role === 'admin') && (
              <Link href="/resources" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                Resources
              </Link>
            )}
          </nav>
        )}
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
