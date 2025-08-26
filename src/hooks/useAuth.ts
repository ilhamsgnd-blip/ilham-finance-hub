import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    if (!email || !password || !name) {
      toast({
        title: "Waduh! 😅",
        description: "Semua field harus diisi ya!",
        variant: "destructive"
      });
      return { error: new Error('All fields are required') };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });

    if (error) {
      toast({
        title: "Waduh! 😅",
        description: error.message === 'User already registered' 
          ? "Email ini udah terdaftar nih, coba login aja!"
          : "Gagal daftar akun, coba lagi ya!",
        variant: "destructive"
      });
      return { error };
    }

    toast({
      title: "Mantap! 🎉",
      description: "Akun berhasil dibuat! Cek email untuk verifikasi ya.",
    });

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      toast({
        title: "Ups! 😔",
        description: "Email dan password harus diisi!",
        variant: "destructive"
      });
      return { error: new Error('Email and password are required') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Ups! 😔",
        description: error.message === 'Invalid login credentials'
          ? "Email atau password salah nih!"
          : "Gagal login, coba lagi ya!",
        variant: "destructive"
      });
      return { error };
    }

    toast({
      title: "Halo! 👋",
      description: "Selamat datang kembali!",
    });

    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Waduh! 😅",
        description: "Gagal logout nih, coba lagi!",
        variant: "destructive"
      });
      return { error };
    }

    toast({
      title: "Sampai jumpa! 👋",
      description: "Logout berhasil, hati-hati ya!",
    });

    return { error: null };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };
};