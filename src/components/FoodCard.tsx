import { MapPin, Clock, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface FoodCardProps {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  expiry_date: string | null;
  address: string | null;
  status: string;
  donor_name?: string;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  meals: 'bg-orange-100 text-orange-700',
  produce: 'bg-green-100 text-green-700',
  'baked goods': 'bg-amber-100 text-amber-700',
  dairy: 'bg-blue-100 text-blue-700',
  beverages: 'bg-purple-100 text-purple-700',
  other: 'bg-muted text-muted-foreground',
};

const FoodCard = ({ title, category, image_url, expiry_date, address, status, donor_name, onClick }: FoodCardProps) => (
  <Card
    className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
      {image_url ? (
        <img src={image_url} alt={title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Tag className="h-10 w-10" />
        </div>
      )}
      <Badge className={`absolute left-2 top-2 ${categoryColors[category] ?? categoryColors.other}`}>
        {category}
      </Badge>
      {status !== 'available' && (
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
          <Badge variant="secondary" className="text-sm">{status === 'claimed' ? 'Claimed' : 'Completed'}</Badge>
        </div>
      )}
    </div>
    <CardContent className="p-4">
      <h3 className="mb-1 font-semibold leading-tight">{title}</h3>
      {donor_name && <p className="mb-1 text-xs text-muted-foreground">Shared by {donor_name}</p>}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {address && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {address}
          </span>
        )}
        {expiry_date && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Expires {format(new Date(expiry_date), 'MMM d')}
          </span>
        )}
      </div>
    </CardContent>
  </Card>
);

export default FoodCard;
