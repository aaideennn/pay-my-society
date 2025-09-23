import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  flat_number?: string;
  phone?: string;
  role: string;
  created_at: string;
}

export const PendingApprovals = () => {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPendingMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingMembers(data || []);
    } catch (error: any) {
      console.error('Error loading pending members:', error);
      toast({
        title: "Error",
        description: "Failed to load pending approvals.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (member: PendingMember) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('user_id', member.user_id);

      if (error) throw error;

      toast({
        title: "Member Approved",
        description: `${member.name} has been approved and is now an active member.`,
      });
      
      loadPendingMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve member.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (member: PendingMember) => {
    if (window.confirm(`Are you sure you want to reject ${member.name}'s membership request?`)) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ status: 'inactive' })
          .eq('user_id', member.user_id);

        if (error) throw error;

        toast({
          title: "Member Rejected",
          description: `${member.name}'s membership request has been rejected.`,
        });
        
        loadPendingMembers();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to reject member.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    loadPendingMembers();

    // Set up real-time subscription for pending approvals
    const channel = supabase
      .channel('pending-approvals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: 'status=eq.pending'
      }, () => {
        loadPendingMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 animate-spin text-primary" />
          <h3 className="text-lg font-semibold">Loading pending approvals...</h3>
        </div>
      </Card>
    );
  }

  if (pendingMembers.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-success" />
          <h3 className="text-lg font-semibold">No Pending Approvals</h3>
        </div>
        <p className="text-muted-foreground">All member requests have been processed.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-warning rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pending Approvals</h3>
              <p className="text-sm text-muted-foreground">{pendingMembers.length} members waiting for approval</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            {pendingMembers.length} Pending
          </Badge>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {pendingMembers.map((member) => (
          <div key={member.user_id} className="p-6 hover:bg-muted/50 transition-smooth">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{member.name.charAt(0)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">{member.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </div>
                    {member.flat_number && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Flat {member.flat_number}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered: {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleApprove(member)}
                  className="bg-gradient-success hover:shadow-success"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleReject(member)}
                  className="text-danger hover:bg-danger/10"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};