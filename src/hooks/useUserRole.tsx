import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  flat_number?: string;
  phone?: string;
}

export interface SocietyMembership {
  id: string;
  society_id: string;
  role: string;
  status: string;
  society_name?: string;
}

export interface UserRoleData {
  profile: UserProfile | null;
  societyMemberships: SocietyMembership[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isSocietyAdmin: boolean;
  currentSocietyRole: string | null;
}

export const useUserRole = (user: User | null): UserRoleData => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [societyMemberships, setSocietyMemberships] = useState<SocietyMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoleData = async () => {
      if (!user) {
        setProfile(null);
        setSocietyMemberships([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        setProfile(profileData);

        // Fetch society memberships with society names
        const { data: membershipsData, error: membershipsError } = await supabase
          .from('society_members')
          .select(`
            *,
            societies!inner(name)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (membershipsError) {
          throw membershipsError;
        }

        const formattedMemberships = membershipsData?.map(membership => ({
          id: membership.id,
          society_id: membership.society_id,
          role: membership.role,
          status: membership.status,
          society_name: membership.societies?.name
        })) || [];

        setSocietyMemberships(formattedMemberships);

      } catch (err) {
        console.error('Error fetching user role data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleData();
  }, [user]);

  // Determine if user is a global admin
  const isAdmin = profile?.role === 'admin';

  // Determine if user is admin in any society
  const isSocietyAdmin = societyMemberships.some(membership => 
    ['admin', 'secretary', 'treasurer'].includes(membership.role)
  );

  // Get the current society role (for now, we'll use the first society membership)
  // In a real app, you might want to implement society switching
  const currentSocietyRole = societyMemberships.length > 0 ? societyMemberships[0].role : null;

  return {
    profile,
    societyMemberships,
    loading,
    error,
    isAdmin,
    isSocietyAdmin,
    currentSocietyRole
  };
};