"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useWaitlistAPI } from "@/hooks/api/useWaitlist";
import {
  Search,
  MoreVertical,
  Mail,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils/date";

function WaitlistContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { entries, loading, fetchEntries, updateStatus } = useWaitlistAPI();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filteredWaitlist = entries.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: entries.length,
    pending: entries.filter((e) => e.status === "pending").length,
    contacted: entries.filter((e) => e.status === "contacted").length,
    converted: entries.filter((e) => e.status === "converted").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Waitlist Management
          </h1>
          <p className="text-muted-foreground">
            Manage priority waitlist entries
          </p>
        </div>
        <Button onClick={fetchEntries} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contacted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search waitlist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries ({filteredWaitlist.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredWaitlist.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between border-b pb-4 last:border-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{entry.name}</p>
                    <Badge
                      variant={
                        entry.priority === "high"
                          ? "destructive"
                          : entry.priority === "medium"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {entry.priority}
                    </Badge>
                    <Badge
                      variant={
                        entry.status === "converted"
                          ? "default"
                          : entry.status === "contacted"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs capitalize"
                    >
                      {entry.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">Interest:</span>{" "}
                    {entry.interest}
                  </p>
                  {entry.message && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      "{entry.message}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Joined: {formatDate(entry.joinedAt || new Date())}
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
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus(entry.id, "contacted")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus(entry.id, "converted")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Converted
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Remove from List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <ProtectedRoute requireAdmin>
      <WaitlistContent />
    </ProtectedRoute>
  );
}
