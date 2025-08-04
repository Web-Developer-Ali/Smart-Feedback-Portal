"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  Star,
  Briefcase,
  Calendar,
  DollarSign,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  total_projects: number;
  active_projects: number;
  total_spent: number;
  average_rating: number;
  last_project_date: string;
  status: "active" | "inactive" | "potential";
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@techcorp.com",
    phone: "+1 (555) 123-4567",
    company: "TechCorp Inc.",
    total_projects: 3,
    active_projects: 1,
    total_spent: 45000,
    average_rating: 4.8,
    last_project_date: "Jan 15, 2024",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@startupxyz.com",
    phone: "+1 (555) 234-5678",
    company: "StartupXYZ",
    total_projects: 2,
    active_projects: 0,
    total_spent: 32000,
    average_rating: 4.9,
    last_project_date: "Jan 10, 2024",
    status: "inactive",
  },
  {
    id: "3",
    name: "Mike Davis",
    email: "mike@creative.com",
    phone: "+1 (555) 345-6789",
    company: "Creative Agency",
    total_projects: 1,
    active_projects: 1,
    total_spent: 8000,
    average_rating: 5.0,
    last_project_date: "Jan 20, 2024",
    status: "active",
  },
  {
    id: "4",
    name: "Emily Chen",
    email: "emily@marketingpro.com",
    phone: "+1 (555) 456-7890",
    company: "Marketing Pro",
    total_projects: 2,
    active_projects: 1,
    total_spent: 28000,
    average_rating: 4.5,
    last_project_date: "Jan 18, 2024",
    status: "active",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "robert@smallbiz.com",
    phone: "+1 (555) 567-8901",
    company: "Small Business",
    total_projects: 1,
    active_projects: 0,
    total_spent: 3000,
    average_rating: 5.0,
    last_project_date: "Jan 5, 2024",
    status: "inactive",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    email: "lisa@potential.com",
    phone: "+1 (555) 678-9012",
    company: "Potential Client Co.",
    total_projects: 0,
    active_projects: 0,
    total_spent: 0,
    average_rating: 0,
    last_project_date: "",
    status: "potential",
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock user data
  const mockUser = {
    id: "1",
    email: "user@example.com",
    full_name: "John Doe",
    avatar_url: null,
    role: "agency" as const,
    company_name: "Design Agency",
    created_at: new Date().toISOString(),
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-red-400 to-red-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white";
      case "inactive":
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
      case "potential":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    inactive: clients.filter((c) => c.status === "inactive").length,
    potential: clients.filter((c) => c.status === "potential").length,
  };

  return (
    <SidebarProvider>
      <DashboardSidebar user={mockUser} onSignOut={() => {}} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white text-black shadow-lg">
          <SidebarTrigger className="-ml-1 text-black hover:bg-black/10" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-300" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-black/90 hover:text-black"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-black font-medium">
                  Clients
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto p-4 sm:p-6">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
              <Card className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 border-0 text-white shadow-2xl">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                        <Users className="h-8 w-8 sm:h-10 sm:w-10" />
                        Client Management
                      </h1>
                      <p className="text-pink-100 text-base sm:text-lg">
                        Manage your client relationships and track their
                        projects
                      </p>
                    </div>
                    <Button className="bg-white text-pink-600 hover:bg-pink-50 shadow-lg border-0 px-4 sm:px-6 py-2 sm:py-3 text-base font-semibold">
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Add Client
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-blue-100 text-sm">Total Clients</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <p className="text-emerald-100 text-sm">Active Clients</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.inactive}</div>
                  <p className="text-gray-100 text-sm">Inactive Clients</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.potential}</div>
                  <p className="text-amber-100 text-sm">Potential Clients</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search clients, companies, or emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="potential">Potential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={`h-12 w-12 ${getAvatarColor(
                            client.name
                          )} text-white shadow-lg`}
                        >
                          <AvatarFallback className="bg-transparent text-white font-semibold">
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg font-bold text-slate-800 truncate">
                            {client.name}
                          </CardTitle>
                          <CardDescription className="text-slate-600 truncate">
                            {client.company}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Call Client
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Briefcase className="h-4 w-4 mr-2" />
                            View Projects
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge
                      className={`${getStatusColor(client.status)} w-fit mt-2`}
                    >
                      {client.status.charAt(0).toUpperCase() +
                        client.status.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building className="h-4 w-4" />
                        <span className="truncate">{client.company}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-800">
                            {client.total_projects}
                          </div>
                          <div className="text-xs text-slate-600">
                            Total Projects
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-800">
                            {client.active_projects}
                          </div>
                          <div className="text-xs text-slate-600">
                            Active Projects
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-semibold">
                            ${client.total_spent.toLocaleString()}
                          </span>
                        </div>
                        {client.average_rating > 0 && (
                          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-sm font-medium">
                              {client.average_rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {client.last_project_date && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                          <Calendar className="h-3 w-3" />
                          <span>Last project: {client.last_project_date}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredClients.length === 0 && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No clients found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Client
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
