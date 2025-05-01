import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Video, Link as LinkIcon, FileUp, Trash2, Pencil, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Resource = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  contentType: string | null;
  content: string | null;
  url: string | null;
  fileName: string | null;
  filePath: string | null;
  fileSize: number | null;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags: string[];
  creator?: {
    id: number;
    username: string;
  };
};

type ResourceFormValues = Pick<Resource, 
  'title' | 'description' | 'type' | 'content' | 'url' | 'tags' | 'isPublic'
>;

export default function ResourceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [formValues, setFormValues] = useState<ResourceFormValues>({
    title: '',
    description: '',
    type: 'article',
    content: '',
    url: '',
    tags: [],
    isPublic: true
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      return data.resources as Resource[];
    }
  });

  const createResourceMutation = useMutation({
    mutationFn: async (resource: ResourceFormValues) => {
      const res = await apiRequest('POST', '/api/resources', resource);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Resource created",
        description: "Your resource has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create resource",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, resource }: { id: number, resource: Partial<ResourceFormValues> }) => {
      const res = await apiRequest('PUT', `/api/resources/${id}`, resource);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      setIsEditDialogOpen(false);
      setCurrentResource(null);
      toast({
        title: "Resource updated",
        description: "Your resource has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update resource",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/resources/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      toast({
        title: "Resource deleted",
        description: "Your resource has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete resource",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createResourceMutation.mutate(formValues);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentResource) {
      updateResourceMutation.mutate({ id: currentResource.id, resource: formValues });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate(id);
    }
  };

  const handleEdit = (resource: Resource) => {
    setCurrentResource(resource);
    setFormValues({
      title: resource.title,
      description: resource.description || '',
      type: resource.type,
      content: resource.content || '',
      url: resource.url || '',
      tags: resource.tags || [],
      isPublic: resource.isPublic
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormValues({
      title: '',
      description: '',
      type: 'article',
      content: '',
      url: '',
      tags: [],
      isPublic: true
    });
  };

  // Ensure the user is authenticated and has the role of 'curator' or 'admin'
  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user.role !== 'curator' && user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Only curators and administrators can manage learning resources.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      case 'file':
        return <FileUp className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resource Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Resource
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="mine">My Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : resources && resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  onEdit={() => handleEdit(resource)} 
                  onDelete={() => handleDelete(resource.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No resources found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : resources && resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources
                .filter(resource => resource.creatorId === user.id)
                .map((resource) => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource} 
                    onEdit={() => handleEdit(resource)} 
                    onDelete={() => handleDelete(resource.id)} 
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You haven't created any resources yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Resource Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Resource</DialogTitle>
            <DialogDescription>
              Add a new learning resource to the platform.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={formValues.title} 
                  onChange={(e) => setFormValues({...formValues, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formValues.description || ''} 
                  onChange={(e) => setFormValues({...formValues, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Resource Type</Label>
                <Select 
                  value={formValues.type} 
                  onValueChange={(value) => setFormValues({...formValues, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formValues.type === 'article' && (
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea 
                    id="content" 
                    value={formValues.content || ''} 
                    onChange={(e) => setFormValues({...formValues, content: e.target.value})}
                    rows={10}
                    placeholder="Write your article content here..."
                  />
                </div>
              )}
              
              {(formValues.type === 'video' || formValues.type === 'link') && (
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input 
                    id="url" 
                    type="url"
                    value={formValues.url || ''} 
                    onChange={(e) => setFormValues({...formValues, url: e.target.value})}
                    placeholder="https://"
                    required
                  />
                </div>
              )}
              
              {formValues.type === 'file' && (
                <div className="grid gap-2">
                  <Label htmlFor="file">File Upload</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    File upload functionality is currently disabled. Please use external link instead.
                  </p>
                  <Input
                    id="file"
                    type="file"
                    disabled
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createResourceMutation.isPending}
              >
                {createResourceMutation.isPending ? 'Creating...' : 'Create Resource'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update this learning resource.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  value={formValues.title} 
                  onChange={(e) => setFormValues({...formValues, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={formValues.description || ''} 
                  onChange={(e) => setFormValues({...formValues, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Resource Type</Label>
                <Select 
                  value={formValues.type} 
                  onValueChange={(value) => setFormValues({...formValues, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formValues.type === 'article' && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea 
                    id="edit-content" 
                    value={formValues.content || ''} 
                    onChange={(e) => setFormValues({...formValues, content: e.target.value})}
                    rows={10}
                  />
                </div>
              )}
              
              {(formValues.type === 'video' || formValues.type === 'link') && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-url">URL</Label>
                  <Input 
                    id="edit-url" 
                    type="url"
                    value={formValues.url || ''} 
                    onChange={(e) => setFormValues({...formValues, url: e.target.value})}
                    placeholder="https://"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateResourceMutation.isPending}
              >
                {updateResourceMutation.isPending ? 'Updating...' : 'Update Resource'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ResourceCardProps {
  resource: Resource;
  onEdit: () => void;
  onDelete: () => void;
}

function ResourceCard({ resource, onEdit, onDelete }: ResourceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="mr-2 bg-primary/10 p-2 rounded-md">
              {getResourceIcon(resource.type)}
            </div>
            <CardTitle className="text-lg">{resource.title}</CardTitle>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="mt-1">
          {new Date(resource.createdAt).toLocaleDateString()} • {resource.type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-3">
          {resource.description || "No description provided."}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
        Created by {resource.creator?.username || "Unknown user"}
      </CardFooter>
    </Card>
  );
}

function getResourceIcon(type: string) {
  switch (type) {
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'article':
      return <FileText className="h-5 w-5" />;
    case 'link':
      return <LinkIcon className="h-5 w-5" />;
    case 'file':
      return <FileUp className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
}