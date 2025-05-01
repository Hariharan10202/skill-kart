import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Reply, ThumbsUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type CommunityPost = {
  id: number;
  author: {
    id: number;
    name: string;
    initials: string;
    avatar: string;
  };
  content: string;
  module: string;
  timeAgo: string;
  replyCount: number;
  likes: number;
  replies?: {
    id: number;
    author: {
      id: number;
      name: string;
      initials: string;
      avatar: string;
    };
    content: string;
    timeAgo: string;
  }[];
};

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [showReplies, setShowReplies] = useState<Record<number, boolean>>({});
  
  const { data: communityData } = useQuery<{ posts: CommunityPost[] }>({
    queryKey: ['/api/community/posts'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/community/posts", { content });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      setPostContent("");
      toast({
        title: "Post created",
        description: "Your post has been published to the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number, content: string }) => {
      const res = await apiRequest("POST", `/api/community/posts/${postId}/replies`, { content });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      setReplyContent("");
      setActivePostId(null);
      toast({
        title: "Reply posted",
        description: "Your reply has been added to the discussion.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("POST", `/api/community/posts/${postId}/like`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const posts: CommunityPost[] = communityData?.posts || [];

  const handleCreatePost = () => {
    if (postContent.trim()) {
      createPostMutation.mutate(postContent);
    }
  };

  const handleReply = (postId: number) => {
    if (replyContent.trim()) {
      replyMutation.mutate({ postId, content: replyContent });
    }
  };

  const toggleReplies = (postId: number) => {
    setShowReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="recent">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="your">Your Posts</TabsTrigger>
              </TabsList>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Post</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a new post</DialogTitle>
                    <DialogDescription>
                      Share your question or insight with the community.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea 
                    placeholder="What's on your mind?" 
                    className="min-h-[120px]"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending || !postContent.trim()}
                    >
                      {createPostMutation.isPending ? "Posting..." : "Post"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="recent" className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300">
                          <span>{post.author.initials}</span>
                        </div>
                        <div className="ml-2">
                          <p className="font-medium dark:text-white">{post.author.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {post.timeAgo} · {post.module}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => likeMutation.mutate(post.id)}
                        >
                          <ThumbsUp className="h-4 w-4" /> {post.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => toggleReplies(post.id)}
                        >
                          <MessageSquare className="h-4 w-4" /> {post.replyCount} replies
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setActivePostId(post.id)}
                        >
                          <Reply className="h-4 w-4" /> Reply
                        </Button>
                      </div>
                      
                      {activePostId === post.id && (
                        <div className="mt-4 mb-4">
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                              <span>{user ? getInitials(user.username) : ""}</span>
                            </div>
                            <div className="flex-1">
                              <Textarea 
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="min-h-[80px] mb-2"
                              />
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setActivePostId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleReply(post.id)}
                                  disabled={replyMutation.isPending || !replyContent.trim()}
                                >
                                  {replyMutation.isPending ? "Replying..." : "Reply"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {showReplies[post.id] && post.replies && post.replies.length > 0 && (
                        <div className="mt-4 pt-4 border-t dark:border-gray-800">
                          <h4 className="text-sm font-medium mb-4">Replies</h4>
                          <div className="space-y-4">
                            {post.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                                  <span>{reply.author.initials}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center mb-1">
                                    <p className="text-sm font-medium dark:text-white">{reply.author.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">{reply.timeAgo}</p>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium dark:text-white mb-2">No posts yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Be the first to start a discussion in the community.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Create a Post</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create a new post</DialogTitle>
                          <DialogDescription>
                            Share your question or insight with the community.
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea 
                          placeholder="What's on your mind?" 
                          className="min-h-[120px]"
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                        />
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            onClick={handleCreatePost}
                            disabled={createPostMutation.isPending}
                          >
                            {createPostMutation.isPending ? "Posting..." : "Post"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-4">
              {/* Similar structure as "recent" tab */}
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Popular posts will be shown here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="your" className="space-y-4">
              {/* Similar structure as "recent" tab */}
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Your posts will be shown here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm">Be respectful</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Treat others with kindness and respect. No personal attacks or harassment.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Stay on topic</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keep discussions relevant to learning and skill development.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Share knowledge</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Help others by sharing your experiences and insights.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">No spam</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Avoid repetitive or promotional content that doesn't add value.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">JavaScript</Badge>
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">HTML & CSS</Badge>
                <Badge variant="secondary">Career Advice</Badge>
                <Badge variant="secondary">Project Ideas</Badge>
                <Badge variant="secondary">Learning Tips</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
