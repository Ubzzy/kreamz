import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import VanLocations from "@/components/VanLocations";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <VanLocations />
      
      <footer className="bg-muted/50 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2026 KreamM's. Premium ice cream vans serving Zambia.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
