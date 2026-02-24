"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useUsersAPI } from "@/hooks/api/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreVertical, UserX, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils/date";

function UsersContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const { users, loading } = useUsersAPI();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor platform users
          </p>
        </div>
        <Button>Add User</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading
              ? [1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              : filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {user.role === "admin" && (
                            <Badge variant="destructive" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex flex-col items-end">
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {user.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className="hidden lg:inline-flex capitalize"
                      >
                        {user.subscription}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <UsersContent />
    </ProtectedRoute>
  );
}
