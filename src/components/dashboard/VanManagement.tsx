import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import vanPlaceholder from "@/assets/van-placeholder.jpg";

interface Van {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
}

const VanManagement = () => {
  const [newVan, setNewVan] = useState({ name: "", description: "", imageUrl: "" });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vans, isLoading } = useQuery({
    queryKey: ["dashboard-vans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ice_cream_vans")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Van[];
    },
  });

  const createVan = useMutation({
    mutationFn: async (van: { name: string; description: string; image_url: string }) => {
      const { error } = await supabase.from("ice_cream_vans").insert(van);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-vans"] });
      queryClient.invalidateQueries({ queryKey: ["ice-cream-vans"] });
      toast({ title: "Van added successfully!" });
      setNewVan({ name: "", description: "", imageUrl: "" });
      setIsAdding(false);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to add van", description: error.message });
    },
  });

  const updateVan = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("ice_cream_vans")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-vans"] });
      queryClient.invalidateQueries({ queryKey: ["ice-cream-vans"] });
      toast({ title: "Van updated successfully!" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to update van", description: error.message });
    },
  });

  const deleteVan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ice_cream_vans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-vans"] });
      queryClient.invalidateQueries({ queryKey: ["ice-cream-vans"] });
      toast({ title: "Van deleted successfully!" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to delete van", description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVan.name.trim()) {
      toast({ variant: "destructive", title: "Van name is required" });
      return;
    }
    createVan.mutate({
      name: newVan.name,
      description: newVan.description,
      image_url: newVan.imageUrl || "",
    });
  };

  if (isLoading) {
    return <div>Loading vans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ice Cream Vans</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Van
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Van</CardTitle>
            <CardDescription>Create a new ice cream van entry</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Van Name *</Label>
                <Input
                  id="name"
                  value={newVan.name}
                  onChange={(e) => setNewVan({ ...newVan, name: e.target.value })}
                  placeholder="e.g., Van #1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newVan.description}
                  onChange={(e) => setNewVan({ ...newVan, description: e.target.value })}
                  placeholder="Brief description of the van"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={newVan.imageUrl}
                  onChange={(e) => setNewVan({ ...newVan, imageUrl: e.target.value })}
                  placeholder="https://example.com/van-image.jpg"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createVan.isPending}>
                  {createVan.isPending ? "Adding..." : "Add Van"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vans?.map((van) => (
          <Card key={van.id}>
            <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
              <img
                src={van.image_url || vanPlaceholder}
                alt={van.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{van.name}</CardTitle>
              {van.description && <CardDescription>{van.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={`active-${van.id}`}>Active</Label>
                <Switch
                  id={`active-${van.id}`}
                  checked={van.active}
                  onCheckedChange={(checked) => updateVan.mutate({ id: van.id, active: checked })}
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this van?")) {
                    deleteVan.mutate(van.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!vans || vans.length === 0) && !isAdding && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No vans yet. Add your first van to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VanManagement;
