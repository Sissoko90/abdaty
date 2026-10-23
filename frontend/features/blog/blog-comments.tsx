'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, ThumbsUp, Reply } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
}

const INPUT_CLS =
  'w-full rounded-xl border border-gray-300 bg-white px-4 text-ink placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder-gray-400';

/** Initiales d'un nom (« Jean Dupont » -> « JD »). */
function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export function BlogComments() {
  const t = useTranslations('blog.comments');
  const locale = useLocale();
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
      author: authorName || t('anonymous'),
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

  const formatDate = (d: string) => {
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <section className="mx-auto mt-16 max-w-3xl">
      <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-ink dark:text-white">
        <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        {t('title', { count: comments.length })}
      </h2>

      {/* Nouveau commentaire */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitComment();
        }}
        className="mb-10 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <h3 className="font-semibold text-ink dark:text-white">{t('leave')}</h3>
        <div>
          <label htmlFor="authorName" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('name')}
          </label>
          <input
            id="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className={`h-12 ${INPUT_CLS}`}
          />
        </div>
        <div>
          <label htmlFor="comment" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('comment')}
          </label>
          <textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('commentPlaceholder')}
            rows={4}
            className={`py-3 ${INPUT_CLS}`}
          />
        </div>
        <Button type="submit">
          <Send className="mr-2 h-4 w-4" />
          {t('publish')}
        </Button>
      </form>

      {/* Liste des commentaires */}
      <ul className="divide-y divide-gray-200 dark:divide-white/10">
        {comments.map((comment) => (
          <li key={comment.id} className="flex items-start gap-4 py-6 first:pt-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
              {initials(comment.author)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-baseline gap-x-3">
                <span className="font-semibold text-ink dark:text-white">{comment.author}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.date)}</span>
              </div>
              <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">{comment.content}</p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleLike(comment.id)}
                  aria-label={t('like')}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-white/10"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {comment.likes}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyingTo(comment.id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-white/10"
                >
                  <Reply className="h-4 w-4" />
                  {t('reply')}
                </button>
              </div>

              {/* Formulaire de réponse */}
              {replyingTo === comment.id && (
                <div className="mt-4 space-y-3 rounded-2xl bg-paper p-4 ring-1 ring-gray-200 dark:ring-white/10">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={t('replyPlaceholder')}
                    rows={3}
                    aria-label={t('replyPlaceholder')}
                    className={`py-3 ${INPUT_CLS}`}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                      {t('reply')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Réponses */}
              {comment.replies && comment.replies.length > 0 && (
                <ul className="mt-5 space-y-5 border-l-2 border-ochre/60 pl-5">
                  {comment.replies.map((reply) => (
                    <li key={reply.id} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ochre text-xs font-bold text-ink">
                        {initials(reply.author)}
                      </span>
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-semibold text-ink dark:text-white">{reply.author}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(reply.date)}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{reply.content}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
