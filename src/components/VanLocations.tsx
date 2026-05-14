import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVans, getSchedules } from "@/integrations/firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Map as MapIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import VanLocationsMap from "@/components/VanLocationsMap";
import vanPlaceholder from "@/assets/van-placeholder.jpg";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Schedule {
  id?: string;
  vanId: string;
  dayOfWeek: string;
  location: string;
  startTime: string;
  endTime: string;
  longitude?: number;
  latitude?: number;
}

const VanLocations = () => {
  const [view, setView] = useState<"list" | "map">("map");

  const { data: vans, isLoading: vansLoading } = useQuery({
    queryKey: ["ice-cream-vans"],
    queryFn: async () => {
      const allVans = await getVans();
      return allVans.filter((v) => v.status === "active");
    },
  });

  const { data: schedules, isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: ["van-schedules"],
    queryFn: () => getSchedules(),
  });

  const getTodaySchedules = (vanId: string) => {
    const today = new Date().getDay();
    return schedules ? schedules.filter(s => s.vanId === vanId && parseInt(s.dayOfWeek) === today) : [];
  };

  const getWeekSchedules = (vanId: string) => {
    return schedules?.filter(s => s.vanId === vanId) || [];
  };

  const today = new Date().getDay();
  const todayMapPoints = ((schedules as Schedule[]) ?? [])
    .filter((s) => parseInt(s.dayOfWeek) === today)
    .map((s) => ({
      id: s.id,
      location: s.location,
      start_time: s.startTime,
      end_time: s.endTime,
      latitude: s.latitude ?? null,
      longitude: s.longitude ?? null,
      van_name: vans?.find((v) => v.id === s.vanId)?.name ?? "Van",
    }));

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
          <div className="inline-flex rounded-lg border border-border p-1 bg-background">
            <Button
              size="sm"
              variant={view === "map" ? "default" : "ghost"}
              onClick={() => setView("map")}
            >
              <MapIcon className="h-4 w-4 mr-2" /> Map
            </Button> 
            <Button
              size="sm"
              variant={view === "list" ? "default" : "ghost"}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4 mr-2" /> List
            </Button>
          </div>
        </div>

        {view === "map" ? (
          <VanLocationsMap schedules={todayMapPoints} />
        ) : !vans || vans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No vans available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vans.map((van) => {
              const todaySchedules = getTodaySchedules(van.id!);
              const weekSchedules = getWeekSchedules(van.id!);

              return (
                <Card key={van.id} className="overflow-hidden hover:shadow-hover transition-all duration-300 hover:scale-105">
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                    <img
                      src={vanPlaceholder}
                      alt={van.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl">{van.name}</CardTitle>
                    <CardDescription className="text-base">{van.phone}</CardDescription>
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
                                <span>{schedule.startTime} - {schedule.endTime}</span>
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
                              <span className="text-muted-foreground">{DAYS[parseInt(schedule.dayOfWeek)]}</span>
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
