
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, User } from 'lucide-react';
import { User as UserType } from '@/services/supabaseService';

interface UserSelectorProps {
  users: UserType[];
  currentUser: UserType | null;
  onCreateUser: (name: string) => Promise<void>;
  onSwitchUser: (user: UserType) => void;
  onClearUser: () => void;
}

export const UserSelector = ({ 
  users, 
  currentUser, 
  onCreateUser, 
  onSwitchUser, 
  onClearUser 
}: UserSelectorProps) => {
  const [newUserName, setNewUserName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateUser(newUserName.trim());
      setNewUserName('');
      setDialogOpen(false);
    } catch (error) {
      // Error handled in parent component
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentUser) {
    return (
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pilih atau Bikin Akun Dulu Yuk! 😊
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {users.length > 0 && (
              <div>
                <Label>Pilih Akun yang Udah Ada</Label>
                <Select onValueChange={(userId) => {
                  const user = users.find(u => u.id === userId);
                  if (user) onSwitchUser(user);
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih akun..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="text-center">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Bikin Akun Baru
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bikin Akun Baru Yuk! 🎉</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <Label htmlFor="userName">Nama Kamu</Label>
                      <Input
                        id="userName"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Tulis nama kamu..."
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isCreating || !newUserName.trim()}
                    >
                      {isCreating ? 'Bentar ya...' : 'Gas Bikin!'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-between bg-gradient-hero text-white p-4 rounded-lg shadow-medium">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-full">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">Halo!</p>
          <p className="text-lg font-bold">{currentUser.name} 👋</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        onClick={onClearUser}
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        Ganti Akun
      </Button>
    </div>
  );
};
