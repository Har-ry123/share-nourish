import { Link } from 'react-router-dom';
import { Heart, Upload, Search, MapPin, Users, Gift, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const [profilesRes, foodRes, claimsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('food_items').select('id', { count: 'exact', head: true }),
        supabase.from('food_items').select('id', { count: 'exact', head: true }).eq('status', 'available'),
      ]);
      return {
        members: profilesRes.count ?? 0,
        totalItems: foodRes.count ?? 0,
        available: claimsRes.count ?? 0,
        donations: (foodRes.count ?? 0) - (claimsRes.count ?? 0),
      };
    },
  });

  const statCards = [
    { icon: Users, label: 'Community Members', value: stats?.members ?? 0 },
    { icon: Gift, label: 'Successful Donations', value: stats?.donations ?? 0 },
    { icon: Package, label: 'Available Items', value: stats?.available ?? 0 },
    { icon: TrendingUp, label: 'Total Items Shared', value: stats?.totalItems ?? 0 },
  ];

  const steps = [
    { icon: Upload, title: 'Post Food', desc: 'Share your surplus food with photos, details, and pickup location.' },
    { icon: Search, title: 'Browse & Claim', desc: 'Find available food nearby using the map or search filters.' },
    { icon: MapPin, title: 'Pick Up', desc: 'Coordinate with the donor and pick up your claimed items.' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Share Food,{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Build Community
              </span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Connect with neighbors to share surplus food, reduce waste, and strengthen your community — one plate at a time.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/browse">
                <Button size="lg" className="gap-2 text-base">
                  <Search className="h-5 w-5" /> Browse Available Food
                </Button>
              </Link>
              <Link to="/share">
                <Button size="lg" variant="outline" className="gap-2 text-base">
                  <Upload className="h-5 w-5" /> Share Your Food
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card py-10">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
          {statCards.map(({ icon: Icon, label, value }) => (
            <Card key={label} className="border-0 bg-muted/50 text-center shadow-none">
              <CardContent className="flex flex-col items-center gap-2 p-6">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold">{value}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {i + 1}
                </div>
                <Icon className="mb-2 h-6 w-6 text-primary" />
                <h3 className="mb-1 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Make a Difference?</h2>
          <p className="max-w-md text-primary-foreground/80">
            Join our growing community of food sharers and help reduce waste in your neighborhood.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-base">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
