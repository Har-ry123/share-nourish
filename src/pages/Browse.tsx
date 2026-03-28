import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FoodCard from '@/components/FoodCard';
import FoodMap from '@/components/FoodMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, MapIcon, Grid3X3, MapPin, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const categories = ['all', 'meals', 'produce', 'baked goods', 'dairy', 'beverages', 'other'];

const Browse = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['food_items', search, category],
    queryFn: async () => {
      let query = supabase
        .from('food_items')
        .select('*, profiles!food_items_donor_id_fkey(display_name)')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (category !== 'all') query = query.eq('category', category);
      if (search) query = query.ilike('title', `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error: claimError } = await supabase.from('claims').insert({ item_id: itemId, claimer_id: user!.id });
      if (claimError) throw claimError;
      const { error: updateError } = await supabase.from('food_items').update({ status: 'claimed' }).eq('id', itemId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast({ title: 'Item Claimed!', description: 'Contact the donor for pickup details.' });
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ['food_items'] });
    },
    onError: (err: any) => {
      toast({ title: 'Claim failed', description: err.message, variant: 'destructive' });
    },
  });

  const openDetail = (id: string) => {
    const item = items.find((i: any) => i.id === id);
    if (item) setSelectedItem(item);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Browse Available Food</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search food items…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'map' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('map')}>
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : viewMode === 'grid' ? (
        items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item: any) => (
              <FoodCard
                key={item.id}
                {...item}
                donor_name={(item.profiles as any)?.display_name}
                onClick={() => openDetail(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg">No food items found.</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )
      ) : (
        <FoodMap items={items} onItemClick={openDetail} className="h-[500px] w-full rounded-lg" />
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          {selectedItem && (
            <>
              {selectedItem.image_url && (
                <img src={selectedItem.image_url} alt={selectedItem.title} className="aspect-video w-full rounded-lg object-cover" />
              )}
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedItem.title}</DialogTitle>
                <DialogDescription>{selectedItem.description || 'No description provided.'}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge>{selectedItem.category}</Badge>
                {selectedItem.quantity && <Badge variant="outline">Qty: {selectedItem.quantity}</Badge>}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {selectedItem.address && (
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedItem.address}</p>
                )}
                {selectedItem.expiry_date && (
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> Expires {format(new Date(selectedItem.expiry_date), 'MMM d, yyyy')}</p>
                )}
                {(selectedItem.profiles as any)?.display_name && (
                  <p className="flex items-center gap-2"><User className="h-4 w-4" /> Shared by {(selectedItem.profiles as any).display_name}</p>
                )}
              </div>
              <DialogFooter>
                {user ? (
                  user.id !== selectedItem.donor_id ? (
                    <Button onClick={() => claimMutation.mutate(selectedItem.id)} disabled={claimMutation.isPending} className="w-full">
                      {claimMutation.isPending ? 'Claiming…' : 'Claim This Item'}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">This is your item.</p>
                  )
                ) : (
                  <Button asChild className="w-full">
                    <a href="/login">Log in to claim</a>
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Browse;
