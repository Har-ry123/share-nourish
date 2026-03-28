import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, MapPin } from 'lucide-react';

const categories = ['meals', 'produce', 'baked goods', 'dairy', 'beverages', 'other'];

const ShareFood = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    quantity: '',
    expiry_date: '',
    address: '',
    lat: '',
    lng: '',
  });

  const updateForm = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let image_url: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('food-images').upload(path, imageFile);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('food-images').getPublicUrl(path);
        image_url = urlData.publicUrl;
      }

      const { error } = await supabase.from('food_items').insert({
        donor_id: user.id,
        title: form.title,
        description: form.description || null,
        category: form.category,
        quantity: form.quantity || null,
        expiry_date: form.expiry_date || null,
        image_url,
        address: form.address || null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
      });

      if (error) throw error;
      toast({ title: 'Food shared!', description: 'Your item is now available for others to claim.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Share Food</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Food Name *</Label>
              <Input id="title" value={form.title} onChange={(e) => updateForm('title', e.target.value)} required placeholder="e.g. Homemade Pasta" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Describe the food, any allergens, etc." rows={3} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => updateForm('category', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" value={form.quantity} onChange={(e) => updateForm('quantity', e.target.value)} placeholder="e.g. 3 servings" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" type="date" value={form.expiry_date} onChange={(e) => updateForm('expiry_date', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" className="gap-2" onClick={() => document.getElementById('photo-input')?.click()}>
                  <Upload className="h-4 w-4" /> {imageFile ? imageFile.name : 'Upload Photo'}
                </Button>
                <input id="photo-input" type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Pickup Location
              </Label>
              <Input value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Address or landmark" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={form.lat} onChange={(e) => updateForm('lat', e.target.value)} placeholder="Latitude" type="number" step="any" />
                <Input value={form.lng} onChange={(e) => updateForm('lng', e.target.value)} placeholder="Longitude" type="number" step="any" />
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Right-click on Google Maps and copy coordinates.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sharing…' : 'Share This Food'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareFood;
