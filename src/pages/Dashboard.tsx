import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, ShoppingCart, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const statusColor: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  claimed: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-muted text-muted-foreground',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: myItems = [] } = useQuery({
    queryKey: ['my_items', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('food_items').select('*').eq('donor_id', user!.id).order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: myClaims = [] } = useQuery({
    queryKey: ['my_claims', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('claims').select('*, food_items(*)').eq('claimer_id', user!.id).order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const markCompleted = useMutation({
    mutationFn: async (itemId: string) => {
      await supabase.from('food_items').update({ status: 'completed' }).eq('id', itemId);
    },
    onSuccess: () => {
      toast({ title: 'Marked as completed!' });
      queryClient.invalidateQueries({ queryKey: ['my_items'] });
    },
  });

  // Profile editing
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const saveProfile = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ display_name: displayName }).eq('user_id', user.id);
    toast({ title: 'Profile updated!' });
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <Tabs defaultValue="items">
        <TabsList className="mb-6">
          <TabsTrigger value="items" className="gap-2"><Package className="h-4 w-4" /> My Items</TabsTrigger>
          <TabsTrigger value="claims" className="gap-2"><ShoppingCart className="h-4 w-4" /> My Claims</TabsTrigger>
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground">{myItems.length} item(s) shared</p>
            <Link to="/share"><Button size="sm">+ Share More</Button></Link>
          </div>
          {myItems.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">No items shared yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {myItems.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(item.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor[item.status] ?? ''}>{item.status}</Badge>
                      {item.status === 'claimed' && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => markCompleted.mutate(item.id)}>
                          <CheckCircle className="h-3 w-3" /> Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claims">
          {myClaims.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">No claims yet. <Link to="/browse" className="text-primary hover:underline">Browse food</Link></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {myClaims.map((claim: any) => (
                <Card key={claim.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold">{(claim.food_items as any)?.title ?? 'Unknown item'}</p>
                      <p className="text-sm text-muted-foreground">Claimed {format(new Date(claim.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <Badge className={statusColor[claim.status] ?? ''}>{claim.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveProfile}>Save</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <p><strong>Name:</strong> {profile?.display_name ?? '—'}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <Button variant="outline" onClick={() => { setDisplayName(profile?.display_name ?? ''); setEditing(true); }}>
                    Edit Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
