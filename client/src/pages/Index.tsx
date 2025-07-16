import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Users, BarChart3, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Truck,
      title: "Fleet Management",
      description: "Comprehensive vehicle tracking and management system for your entire fleet."
    },
    {
      icon: Users,
      title: "Driver Management",
      description: "Manage driver profiles, licenses, certifications, and performance metrics."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Real-time insights and detailed reports on fleet performance and costs."
    },
    {
      icon: Shield,
      title: "Compliance & Safety",
      description: "Stay compliant with regulations and maintain the highest safety standards."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">LogiSimple</h1>
              <p className="text-xs text-muted-foreground">Fleet Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Streamline Your 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              {" "}Fleet Operations
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comprehensive fleet management platform that helps you track vehicles, manage drivers, 
            optimize routes, and reduce operational costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="fleet-button-primary" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="fleet-card fleet-transition hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-large)] mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Trusted by Fleet Managers</h2>
            <p className="text-muted-foreground">
              Join thousands of companies optimizing their fleet operations
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Vehicles Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">25%</div>
              <div className="text-muted-foreground">Cost Reduction</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Transform your fleet management today with LogiSimple
          </p>
          <Button size="lg" className="fleet-button-primary" asChild>
            <Link to="/auth" className="flex items-center gap-2">
              Create Your Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 LogiSimple. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
