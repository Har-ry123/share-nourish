import { Heart } from 'lucide-react';

const Footer = () => (
  <footer className="border-t bg-card py-8">
    <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Heart className="h-4 w-4 text-primary fill-primary" />
        <span className="font-semibold text-foreground">sharePlate</span>
      </div>
      <p>Reducing food waste, one plate at a time.</p>
      <p>© {new Date().getFullYear()} sharePlate. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
