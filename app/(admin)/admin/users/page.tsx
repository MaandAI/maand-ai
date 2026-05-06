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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useUsersAPI } from "@/hooks/api/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Search, MoreVertical, UserX, Mail, Shield, UserPlus, Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils/date";
import { useToast } from "@/hooks/use-toast";

function UsersContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const { users, loading, updateUser, deleteUser, createUser, batchCreateUsers } = useUsersAPI();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New user state
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [bulkJson, setBulkJson] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createUser(newUser);
    if (res.success) {
      toast({ title: "User created", description: "Welcome email sent successfully." });
      setIsCreateModalOpen(false);
      setNewUser({ name: "", email: "", role: "user" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleBulkUpload = async () => {
    try {
      setIsSubmitting(true);
      const data = JSON.parse(bulkJson);
      if (!Array.isArray(data)) throw new Error("Input must be a JSON array");
      
      const res = await batchCreateUsers(data);
      if (res.success) {
        toast({ title: "Bulk upload successful", description: res.message });
        setIsBulkModalOpen(false);
        setBulkJson("");
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Invalid JSON", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await updateUser(userId, { role: newRole });
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await updateUser(userId, { status: newStatus });
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage roles and monitor platform users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Batch Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batch User Import</DialogTitle>
                <DialogDescription>
                  Paste a JSON array of users. Format: [{"name": "...", "email": "...", "role": "user"}]
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="bulk-json" className="mb-2 block">JSON Content</Label>
                <Textarea 
                  id="bulk-json" 
                  className="font-mono text-xs min-h-[200px]" 
                  placeholder='[{"name": "John Doe", "email": "john@example.com", "role": "user"}]'
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
                <Button onClick={handleBulkUpload} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import Users
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Individual User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user manually. They will receive an email with credentials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    required 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Initial Role</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(val) => setNewUser({...newUser, role: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Regular User</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                          <Badge variant={user.role === "admin" ? "destructive" : user.role === "therapist" ? "default" : "secondary"} className="text-[10px] h-4">
                            {user.role}
                          </Badge>
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

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.role)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className={user.status === "active" ? "text-destructive" : "text-primary"}
                            onClick={() => handleStatusChange(user.id, user.status)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            {user.status === "active" ? "Suspend User" : "Activate User"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(user.id)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Delete User
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
