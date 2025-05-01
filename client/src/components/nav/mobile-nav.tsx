import { Link, useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { HomeIcon, MapPin, Users2Icon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const isMobile = useMobile();
  const { user } = useAuth();
  const [location] = useLocation();

  if (!isMobile || !user) return null;

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t dark:border-gray-800 px-6 py-2">
      <div className="flex justify-around">
        <Link href="/dashboard">
          <a className={cn(
            "flex flex-col items-center py-2",
            isActive("/dashboard") ? "text-primary" : "text-gray-500 dark:text-gray-400"
          )}>
            <HomeIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/roadmap">
          <a className={cn(
            "flex flex-col items-center py-2",
            isActive("/roadmap") ? "text-primary" : "text-gray-500 dark:text-gray-400"
          )}>
            <MapPin className="h-5 w-5" />
            <span className="text-xs mt-1">Roadmap</span>
          </a>
        </Link>
        <Link href="/community">
          <a className={cn(
            "flex flex-col items-center py-2",
            isActive("/community") ? "text-primary" : "text-gray-500 dark:text-gray-400"
          )}>
            <Users2Icon className="h-5 w-5" />
            <span className="text-xs mt-1">Community</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={cn(
            "flex flex-col items-center py-2",
            isActive("/profile") ? "text-primary" : "text-gray-500 dark:text-gray-400"
          )}>
            <UserIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
