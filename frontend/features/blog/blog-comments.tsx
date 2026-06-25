'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageSquare, Send, User, Clock, ThumbsUp, Reply } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
}

export function BlogComments() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Jean Dupont',
      content: 'Excellent article ! J\'ai beaucoup appris sur l\'API SMS. Merci pour le partage.',
      date: '2024-05-08',
      likes: 12,
      replies: [
        {
          id: '1-1',
          author: 'Marie Martin',
          content: 'Je suis d\'accord ! Très instructif.',
          date: '2024-05-08',
          likes: 3,
        },
      ],
    },
    {
      id: '2',
      author: 'Fatoumata Touré',
      content: 'C\'est exactement ce que je cherchais. L\'intégration était simple et rapide.',
      date: '2024-05-07',
      likes: 8,
    },
    {
      id: '3',
      author: 'Mamadou Keita',
      content: 'Est-ce que vous avez un exemple en Python ?',
      date: '2024-05-06',
      likes: 5,
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = () => {
    if (!newComment.trim() || !authorName.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: authorName,
      content: newComment,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };

    setComments((prev) => [newCommentObj, ...prev]);
    setNewComment('');
    setAuthorName('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const newReply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: authorName || 'Anonyme',
      content: replyContent,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === parentId
          ? {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          : comment
      )
    );

    setReplyContent('');
    setReplyingTo(null);
  };

  const handleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Commentaires ({comments.length})
        </h2>
      </div>

      {/* New Comment Form */}
      <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
            Laisser un commentaire
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="authorName">Nom</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Votre nom"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
          </div>
          <div>
            <Label htmlFor="comment">Commentaire</Label>
            <Textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez vos pensées..."
              rows={4}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
          </div>
          <Button onClick={handleSubmitComment}>
            <Send className="w-4 h-4 mr-2" />
            Publier
          </Button>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <Card key={comment.id} className="dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                      {comment.author}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      <Clock className="w-3 h-3" />
                      {comment.date}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-300">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(comment.id)}
                      className="dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-300"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {comment.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(comment.id)}
                      className="dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-300"
                    >
                      <Reply className="w-4 h-4 mr-1" />
                      Répondre
                    </Button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Votre réponse..."
                        rows={3}
                        className="dark:bg-gray-600 dark:border-gray-500 dark:text-white mb-2 transition-colors duration-300"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                          Répondre
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingTo(null)}
                          className="dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500 transition-colors duration-300"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-8 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-900 dark:text-white transition-colors duration-300">
                                {reply.author}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {reply.date}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
