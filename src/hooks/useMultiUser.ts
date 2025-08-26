
import { useState, useEffect } from 'react';
import { supabaseService, User } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

export const useMultiUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load users and current user from localStorage on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await supabaseService.getUsers();
        setUsers(usersData);

        // Check if there's a current user in localStorage
        const savedUserId = localStorage.getItem('currentUserId');
        if (savedUserId) {
          const savedUser = usersData.find(u => u.id === savedUserId);
          if (savedUser) {
            setCurrentUser(savedUser);
          } else {
            localStorage.removeItem('currentUserId');
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Waduh! 😅",
          description: "Gagal memuat daftar pengguna nih",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  const createUser = async (name: string): Promise<void> => {
    try {
      const newUser = await supabaseService.createUser(name);
      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      localStorage.setItem('currentUserId', newUser.id);
      
      toast({
        title: "Yeay! 🎉",
        description: `Akun "${name}" udah jadi nih!`,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Aduh! 😔",
        description: "Gagal bikin akun baru nih",
        variant: "destructive"
      });
      throw error;
    }
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUserId', user.id);
    
    toast({
      title: "Oke sip! 👍",
      description: `Sekarang pakai akun "${user.name}"`,
    });
  };

  const clearCurrentUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  return {
    users,
    currentUser,
    loading,
    createUser,
    switchUser,
    clearCurrentUser
  };
};
