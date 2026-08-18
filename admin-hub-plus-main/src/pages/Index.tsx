import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Package, BarChart3, MessageSquare } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="admin-header py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Sundar Corporation
          </h1>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Industrial Packaging Solutions - Admin Management System
          </p>
          <Link to="/admin-login">
            <Button size="lg" variant="secondary" className="font-semibold">
              <Shield className="w-5 h-5 mr-2" />
              Access Admin Panel
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-12">Admin Panel Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="w-14 h-14 bg-stat-products/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-stat-products" />
            </div>
            <h3 className="font-semibold mb-2">Product Management</h3>
            <p className="text-sm text-muted-foreground">
              Full CRUD operations with image upload and size/price management
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Size distribution, price analysis with charts and CSV export
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="w-14 h-14 bg-stat-inquiries/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-stat-inquiries" />
            </div>
            <h3 className="font-semibold mb-2">Inquiry Management</h3>
            <p className="text-sm text-muted-foreground">
              Track, filter, and respond to customer inquiries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
