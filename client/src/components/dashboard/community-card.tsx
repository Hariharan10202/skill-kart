import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { MessageSquare, Reply } from "lucide-react";
import { Link } from "wouter";

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
};

export default function CommunityCard() {
  const { data: communityData } = useQuery({
    queryKey: ['/api/community/posts'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const posts: CommunityPost[] = communityData?.posts || [];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-white">Community Activity</h3>
          <Link href="/community">
            <Button variant="link" className="text-primary dark:text-primary p-0 h-auto">
              View all
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.slice(0, 2).map((post) => (
              <div key={post.id} className="p-4 border dark:border-gray-800 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300">
                    <span>{post.author.initials}</span>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium dark:text-white">{post.author.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {post.timeAgo} · {post.module}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{post.content}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {post.replyCount} replies
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center gap-1 hover:text-primary dark:hover:text-primary transition-colors p-0 h-auto text-xs"
                  >
                    <Reply className="h-3 w-3" /> Reply
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>No community posts yet.</p>
              <p className="text-sm">Be the first to start a discussion!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
