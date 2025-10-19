import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import vanPlaceholder from "@/assets/van-placeholder.jpg";

interface Van {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface Schedule {
  id: string;
  location: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  van_id: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const VanLocations = () => {
  const { data: vans, isLoading: vansLoading } = useQuery({
    queryKey: ["ice-cream-vans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ice_cream_vans")
        .select("*")
        .eq("active", true);
      
      if (error) throw error;
      return data as Van[];
    },
  });

  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ["van-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("van_schedules")
        .select("*")
        .eq("active", true)
        .order("day_of_week", { ascending: true });
      
      if (error) throw error;
      return data as Schedule[];
    },
  });

  const getTodaySchedules = (vanId: string) => {
    const today = new Date().getDay();
    return schedules?.filter(s => s.van_id === vanId && s.day_of_week === today) || [];
  };

  const getWeekSchedules = (vanId: string) => {
    return schedules?.filter(s => s.van_id === vanId) || [];
  };

  if (vansLoading || schedulesLoading) {
    return (
      <section id="locations" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Loading...</h2>
        </div>
      </section>
    );
  }

  return (
    <section id="locations" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Find Us
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Check out where our vans will be this week
          </p>
        </div>

        {!vans || vans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No vans available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vans.map((van) => {
              const todaySchedules = getTodaySchedules(van.id);
              const weekSchedules = getWeekSchedules(van.id);

              return (
                <Card key={van.id} className="overflow-hidden hover:shadow-hover transition-all duration-300 hover:scale-105">
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                    <img
                      src={van.image_url || vanPlaceholder}
                      alt={van.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl">{van.name}</CardTitle>
                    {van.description && (
                      <CardDescription className="text-base">{van.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {todaySchedules.length > 0 && (
                      <div className="space-y-2">
                        <Badge className="bg-accent text-accent-foreground">Today's Locations</Badge>
                        {todaySchedules.map((schedule) => (
                          <div key={schedule.id} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{schedule.location}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{schedule.start_time} - {schedule.end_time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {weekSchedules.length > 0 && (
                      <div className="space-y-2">
                        <Badge variant="outline">Weekly Schedule</Badge>
                        <div className="space-y-1 text-sm">
                          {weekSchedules.map((schedule) => (
                            <div key={schedule.id} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                              <span className="text-muted-foreground">{DAYS[schedule.day_of_week]}</span>
                              <span className="font-medium">{schedule.location}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {weekSchedules.length === 0 && (
                      <p className="text-sm text-muted-foreground">No schedule available</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default VanLocations;
