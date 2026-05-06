"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  FileText, 
  MoreVertical,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/date";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TherapistRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/therapists/requests");
      setRequests(res.data.data);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to fetch requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async () => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      const res = await apiClient.patch(`/admin/therapists/requests/${selectedRequest._id}`, {
        action: actionType,
        adminNotes
      });
      
      if (res.data.success) {
        toast({ 
          title: `Request ${actionType === "approve" ? "Approved" : "Rejected"}`, 
          description: res.data.message 
        });
        setIsModalOpen(false);
        fetchRequests();
      }
    } catch (err: any) {
      toast({ 
        title: "Action failed", 
        description: err.response?.data?.error || "An error occurred", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (request: any, type: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(type);
    setAdminNotes("");
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Therapist Onboarding</h1>
        <p className="text-muted-foreground">Review and manage professional applications</p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
        ) : requests.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <CardTitle className="text-muted-foreground">No pending requests</CardTitle>
            <p className="text-sm text-muted-foreground">New applications will appear here.</p>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req._id} className="overflow-hidden border-2">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{req.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" /> {req.email}
                      </div>
                    </div>
                  </div>
                  <Badge variant={req.status === "pending" ? "secondary" : req.status === "approved" ? "default" : "destructive"}>
                    {req.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Specialization</p>
                    <p className="text-sm font-medium">{req.specialization}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">License</p>
                    <p className="text-sm font-medium font-mono">{req.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Experience</p>
                    <p className="text-sm font-medium">{req.experience} Years</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Professional Bio</p>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{req.bio}"</p>
                </div>

                {req.status === "pending" && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => openModal(req, "reject")}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button 
                      onClick={() => openModal(req, "approve")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve & Create Account
                    </Button>
                  </div>
                )}

                {req.adminNotes && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 border flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <strong>Admin Notes:</strong> {req.adminNotes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Application" : "Reject Application"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "This will create a therapist account and send a welcome email with credentials." 
                : "This will reject the application and notify the applicant."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="notes">Internal Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Add reasoning or notes..." 
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
