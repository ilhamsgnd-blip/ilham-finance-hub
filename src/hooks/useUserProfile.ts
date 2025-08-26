import { useState, useEffect } from 'react';
import { supabaseService, UserProfile } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Load user profile on mount and when user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated || !user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await supabaseService.getCurrentUserProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast({
          title: "Waduh! 😅",
          description: "Gagal memuat profil pengguna nih",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, isAuthenticated, toast]);

  const createProfile = async (name: string): Promise<void> => {
    if (!name || !name.trim()) {
      throw new Error('Name is required');
    }
    
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      const newProfile = await supabaseService.createUserProfile(name.trim());
      setProfile(newProfile);
      
      toast({
        title: "Yeay! 🎉",
        description: `Profil "${name.trim()}" berhasil dibuat!`,
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      toast({
        title: "Aduh! 😔",
        description: "Gagal membuat profil nih",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProfile = async (name: string): Promise<void> => {
    if (!name || !name.trim()) {
      throw new Error('Name is required');
    }
    
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      const updatedProfile = await supabaseService.updateUserProfile(name.trim());
      setProfile(updatedProfile);
      
      toast({
        title: "Mantap! 👍",
        description: `Profil berhasil diupdate jadi "${name.trim()}"!`,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Aduh! 😔",
        description: "Gagal update profil nih",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    hasProfile: !!profile
  };
};