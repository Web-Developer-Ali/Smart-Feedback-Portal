"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Briefcase,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronUp,
  LogOut,
  User,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useUser } from "../user-provider";
import { signOut } from "@/app/auth/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DashboardSidebar() {
  const { user, loading } = useUser();
  const route = useRouter();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      toast.success(result.message);
      route.push("/login");
    } catch (err) {
      console.error("Error during signout:", err);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home, color: "text-blue-500" },
    { title: "Projects", url: "/dashboard/projects", icon: Briefcase, color: "text-green-500" },
    { title: "Reviews", url: "/dashboard/reviews", icon: MessageSquare, color: "text-purple-500" },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, color: "text-orange-500" },
  ];

  const getRoleColor = (role: string) =>
    role === "agency"
      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";

  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-slate-50 to-white">
      {/* Static header - always rendered */}
      <SidebarHeader className="border-b border-slate-200/50">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
              Feedback Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Smart Reviews System
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation always rendered */}
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-semibold text-xs sm:text-sm">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 transition-all duration-200 h-10 sm:h-auto"
                  >
                    <a href={item.url} className="flex items-center gap-2 sm:gap-3">
                      <item.icon
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color} flex-shrink-0`}
                      />
                      <span className="font-medium text-slate-700 text-sm sm:text-base truncate">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Profile section with loading skeleton */}
      <SidebarFooter className="border-t border-slate-200/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {loading ? (
              // Loading state only for profile
              <div className="flex items-center gap-3 p-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-20 bg-slate-200 animate-pulse rounded" />
                  <div className="h-2 w-12 bg-slate-200 animate-pulse rounded" />
                </div>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 transition-all duration-200 p-2 sm:p-3 h-auto">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shadow-md flex-shrink-0">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-semibold text-xs sm:text-sm">
                        {user.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate w-full">
                        {user.name || user.email}
                      </span>
                      <Badge className={`text-xs ${getRoleColor("agency")} shadow-sm`}>
                        Agency
                      </Badge>
                    </div>
                    <ChevronUp className="ml-auto h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-(--radix-popper-anchor-width) bg-white/95 backdrop-blur-sm shadow-xl border-0"
                >
                  <DropdownMenuItem className="hover:bg-blue-50">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-purple-50">
                    <Settings className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="hover:bg-red-50 text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="text-sm text-slate-500 px-3 py-2">No user logged in</div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
