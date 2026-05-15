import heroImage from "@/assets/hero-icecream.jpg";

const Hero = () => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                KreaM's
              </span>
              <br />
              <span className="text-foreground">Premium Ice Cream</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-lg">
              Find our colorful ice cream vans across Zambia. Fresh, delicious treats at your favorite places!
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#locations" className="inline-block">
                <button className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-full hover:shadow-hover transition-all duration-300 hover:scale-105">
                  Find Our Vans
                </button>
              </a>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="rounded-3xl overflow-hidden shadow-soft hover:shadow-hover transition-shadow duration-300">
              <img 
                src={heroImage} 
                alt="Colorful ice cream cones" 
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/30 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
