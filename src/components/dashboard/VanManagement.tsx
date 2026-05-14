import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createVan as createVanDb,
  updateVan as updateVanDb,
  deleteVan as deleteVanDb,
  getVans,
  IceCreamVan,
} from "@/integrations/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import vanPlaceholder from "@/assets/van-placeholder.jpg";

const VanManagement = () => {
  const [newVan, setNewVan] = useState({ name: "", phone: "", status: "active" as const });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vans, isLoading } = useQuery({
    queryKey: ["dashboard-vans"],
    queryFn: getVans,
  });

  const createVan = useMutation({
    mutationFn: async (van: Omit<IceCreamVan, "id" | "createdAt" | "updatedAt">) => {
      await createVanDb(van);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-vans"] });
      queryClient.invalidateQueries({ queryKey: ["ice-cream-vans"] });
      toast({ title: "Van added successfully!" });
      setNewVan({ name: "", phone: "", status: "active" });
      setIsAdding(false);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to add van", description: error.message });
    },
  });

  const updateVan = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateVanDb(id, { status: status as "active" | "inactive" | "maintenance" });
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
      await deleteVanDb(id);
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
    if (!newVan.name.trim() || !newVan.phone.trim()) {
      toast({ variant: "destructive", title: "Van name and phone are required" });
      return;
    }
    createVan.mutate({
      name: newVan.name,
      phone: newVan.phone,
      status: newVan.status as "active" | "inactive" | "maintenance",
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
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={newVan.phone}
                  onChange={(e) => setNewVan({ ...newVan, phone: e.target.value })}
                  placeholder="e.g., +260 97 123 4567"
                  required
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
                src={vanPlaceholder}
                alt={van.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{van.name}</CardTitle>
              <CardDescription>{van.phone}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={`status-${van.id}`}>Status</Label>
                <Switch
                  id={`status-${van.id}`}
                  checked={van.status === "active"}
                  onCheckedChange={(checked) =>
                    updateVan.mutate({
                      id: van.id!,
                      status: checked ? "active" : "inactive",
                    })
                  }
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this van?")) {
                    deleteVan.mutate(van.id!);
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
