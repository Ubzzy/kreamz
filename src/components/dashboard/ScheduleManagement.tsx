import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import LocationPicker from "@/components/dashboard/LocationPicker";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Van {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  van_id: string;
  location: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: boolean;
  latitude: number | null;
  longitude: number | null;
  ice_cream_vans?: { name: string };
}

const ScheduleManagement = () => {
  const [newSchedule, setNewSchedule] = useState({
    vanId: "",
    location: "",
    dayOfWeek: "0",
    startTime: "",
    endTime: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vans } = useQuery({
    queryKey: ["vans-for-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ice_cream_vans").select("id, name").eq("active", true);
      if (error) throw error;
      return data as Van[];
    },
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["all-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("van_schedules")
        .select("*, ice_cream_vans(name)")
        .order("day_of_week", { ascending: true });
      if (error) throw error;
      return data as Schedule[];
    },
  });

  const createSchedule = useMutation({
    mutationFn: async (schedule: {
      van_id: string;
      location: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      latitude: number | null;
      longitude: number | null;
    }) => {
      const { error } = await supabase.from("van_schedules").insert(schedule);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["van-schedules"] });
      toast({ title: "Schedule added successfully!" });
      setNewSchedule({ vanId: "", location: "", dayOfWeek: "0", startTime: "", endTime: "", latitude: null, longitude: null });
      setIsAdding(false);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to add schedule", description: error.message });
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("van_schedules").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["van-schedules"] });
      toast({ title: "Schedule updated successfully!" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to update schedule", description: error.message });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("van_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["van-schedules"] });
      toast({ title: "Schedule deleted successfully!" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to delete schedule", description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.vanId || !newSchedule.location || !newSchedule.startTime || !newSchedule.endTime) {
      toast({ variant: "destructive", title: "All fields are required" });
      return;
    }
    createSchedule.mutate({
      van_id: newSchedule.vanId,
      location: newSchedule.location,
      day_of_week: parseInt(newSchedule.dayOfWeek),
      start_time: newSchedule.startTime,
      end_time: newSchedule.endTime,
      latitude: newSchedule.latitude,
      longitude: newSchedule.longitude,
    });
  };

  if (isLoading) {
    return <div>Loading schedules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Van Schedules</h2>
        <Button onClick={() => setIsAdding(!isAdding)} disabled={!vans || vans.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {(!vans || vans.length === 0) && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Please add at least one ice cream van before creating schedules.
            </p>
          </CardContent>
        </Card>
      )}

      {isAdding && vans && vans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Schedule</CardTitle>
            <CardDescription>Create a new schedule for a van</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="van">Ice Cream Van *</Label>
                <Select value={newSchedule.vanId} onValueChange={(value) => setNewSchedule({ ...newSchedule, vanId: value })}>
                  <SelectTrigger id="van">
                    <SelectValue placeholder="Select a van" />
                  </SelectTrigger>
                  <SelectContent>
                    {vans.map((van) => (
                      <SelectItem key={van.id} value={van.id}>
                        {van.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <LocationPicker
                  value={newSchedule.location}
                  onChange={({ location, lat, lng }) =>
                    setNewSchedule({ ...newSchedule, location, latitude: lat, longitude: lng })
                  }
                  placeholder="e.g., Manda Hill Shopping Mall"
                />
                {newSchedule.latitude != null && (
                  <p className="text-xs text-muted-foreground">
                    Pinned at {newSchedule.latitude.toFixed(4)}, {newSchedule.longitude!.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="day">Day of Week *</Label>
                <Select value={newSchedule.dayOfWeek} onValueChange={(value) => setNewSchedule({ ...newSchedule, dayOfWeek: value })}>
                  <SelectTrigger id="day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createSchedule.isPending}>
                  {createSchedule.isPending ? "Adding..." : "Add Schedule"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {schedules?.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{schedule.ice_cream_vans?.name}</h3>
                    <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                      {DAYS[schedule.day_of_week]}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{schedule.location}</p>
                  <p className="text-sm">
                    {schedule.start_time} - {schedule.end_time}
                  </p>
                  {schedule.latitude != null && schedule.longitude != null && (
                    <p className="text-xs text-muted-foreground">
                      📍 {Number(schedule.latitude).toFixed(4)}, {Number(schedule.longitude).toFixed(4)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${schedule.id}`}>Active</Label>
                    <Switch
                      id={`active-${schedule.id}`}
                      checked={schedule.active}
                      onCheckedChange={(checked) => updateSchedule.mutate({ id: schedule.id, active: checked })}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this schedule?")) {
                        deleteSchedule.mutate(schedule.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!schedules || schedules.length === 0) && !isAdding && vans && vans.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No schedules yet. Add your first schedule to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduleManagement;
