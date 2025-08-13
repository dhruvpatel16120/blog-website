'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

// Move CommentForm outside to prevent recreation on every render
const CommentForm = React.memo(({ onSubmit, value, onChange, placeholder, buttonText, onCancel, maxLength = 1000, isReply = false, submitting = false }) => {
  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isAtLimit = characterCount > maxLength * 0.9;
  
  return (
    <form onSubmit={onSubmit} className="mb-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={isReply ? 2 : 3}
          required
          maxLength={maxLength}
          disabled={submitting}
        />
        <div className={`absolute bottom-2 right-2 text-xs ${
          isAtLimit ? 'text-red-500' : 
          isNearLimit ? 'text-yellow-500' : 'text-gray-400'
        }`}>
          {characterCount}/{maxLength}
          {isAtLimit && (
            <div className="absolute bottom-6 right-0 text-red-500 bg-white px-1 rounded">
              Character limit approaching!
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <Button type="submit" disabled={submitting || !value.trim()}>
          {submitting ? 'Posting...' : buttonText}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
});
CommentForm.displayName = 'CommentForm';

const Comments = ({ postId, postSlug }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [commentCount, setCommentCount] = useState(0);
  const [lastCommentTime, setLastCommentTime] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Reset comment count every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCommentCount(0);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // Check comment length
    if (newComment.trim().length < 3) {
      alert('Comment must be at least 3 characters long');
      return;
    }
    
    if (newComment.trim().length > 1000) {
      alert('Comment cannot exceed 1000 characters');
      return;
    }
    
    // Rate limiting: max 5 comments per minute
    const now = Date.now();
    if (now - lastCommentTime < 60000 && commentCount >= 5) {
      alert('You can only post 5 comments per minute. Please wait a bit before posting another comment.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          postId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        setCommentCount(prev => prev + 1);
        setLastCommentTime(Date.now());
      } else {
        const error = await response.json();
        if (response.status === 401) {
          router.push(`/auth/signin?callbackUrl=/blog/${postSlug}`);
        } else {
          alert(error.error || 'Failed to post comment');
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }, [newComment, lastCommentTime, commentCount, postId, router, postSlug]);

  const handleReply = useCallback(async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    // Check reply length
    if (replyContent.trim().length < 3) {
      alert('Reply must be at least 3 characters long');
      return;
    }
    
    if (replyContent.trim().length > 500) {
      alert('Reply cannot exceed 500 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent.trim(),
          postId,
          parentId: replyingTo.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the comments to include the new reply
        setComments(prev => prev.map(comment => 
          comment.id === replyingTo.id 
            ? { ...comment, replies: [...(comment.replies || []), data.comment] }
            : comment
        ));
        setReplyContent('');
        setReplyingTo(null);
      } else {
        const error = await response.json();
        if (response.status === 401) {
          router.push(`/auth/signin?callbackUrl=/blog/${postSlug}`);
        } else {
          alert(error.error || 'Failed to post reply');
        }
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  }, [replyContent, replyingTo, postId, router, postSlug]);

  const handleEditComment = useCallback(async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    
    // Check comment length
    const maxLength = editingComment.parentId ? 500 : 1000;
    if (editContent.trim().length < 3) {
      alert('Comment must be at least 3 characters long');
      return;
    }
    
    if (editContent.trim().length > maxLength) {
      alert(`Comment cannot exceed ${maxLength} characters`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment.id === editingComment.id 
            ? { ...comment, content: data.comment.content, updatedAt: data.comment.updatedAt }
            : comment
        ));
        setEditContent('');
        setEditingComment(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  }, [editContent, editingComment]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  }, []);

  const CommentItem = React.memo(({ comment, isReply = false }) => {
    const isAuthor = session?.user?.id === comment.author.id;
    const isEditing = editingComment?.id === comment.id;
    const replyCount = comment.replies?.length || 0;
    const canReply = !isReply && replyCount < 3;

    return (
      <div className={`border-l-2 border-gray-200 pl-4 mb-4 ${isReply ? 'ml-8' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {comment.author.avatar ? (
              <Image
                src={comment.author.avatar}
                alt={comment.author.fullName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {comment.author.fullName?.charAt(0) || comment.author.username?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {comment.author.fullName || comment.author.username}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
                {comment.updatedAt !== comment.createdAt && ' (edited)'}
              </span>
            </div>
            
            {isEditing ? (
              <CommentForm
                onSubmit={handleEditComment}
                value={editContent}
                onChange={setEditContent}
                placeholder="Edit your comment..."
                buttonText="Update"
                onCancel={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
                maxLength={isReply ? 500 : 1000}
                isReply={isReply}
                submitting={submitting}
              />
            ) : (
              <div className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                {comment.content}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs">
              {canReply && (
                <button
                  onClick={() => setReplyingTo(comment)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Reply to this comment (max 3 replies per comment)"
                >
                  Reply ({replyCount}/3)
                </button>
              )}
              {!canReply && !isReply && (
                <span className="text-gray-400" title="Maximum replies reached">
                  Max replies reached
                </span>
              )}
              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment);
                      setEditContent(comment.content);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {replyingTo?.id === comment.id && (
              <div className="mt-3">
                <CommentForm
                  onSubmit={handleReply}
                  value={replyContent}
                  onChange={setReplyContent}
                  placeholder={`Reply to ${comment.author.fullName || comment.author.username}...`}
                  buttonText="Reply"
                  onCancel={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  maxLength={500}
                  isReply={true}
                  submitting={submitting}
                />
              </div>
            )}

            {/* Render replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
  CommentItem.displayName = 'CommentItem';

  if (loading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">
        Comments ({comments.length})
        {comments.length > 0 && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            • {comments.reduce((total, comment) => total + (comment.replies?.length || 0), 0)} replies
          </span>
        )}
      </h3>

      {/* Comment Form */}
      {session ? (
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-3">Leave a comment</h4>
          {commentCount >= 5 && Date.now() - lastCommentTime < 60000 && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Rate limit reached. You can post 5 comments per minute. Please wait before posting another comment.
              </p>
            </div>
          )}
          <CommentForm
            onSubmit={handleSubmitComment}
            value={newComment}
            onChange={setNewComment}
            placeholder="Share your thoughts..."
            buttonText="Post Comment"
            maxLength={1000}
            submitting={submitting}
          />
          <div className="mt-3 text-xs text-gray-500">
            <p>• Comments must be 3-1000 characters long</p>
            <p>• Maximum 5 comments per minute</p>
            <p>• Maximum 3 replies per comment</p>
            <p>• Replies must be 3-500 characters long</p>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-3">
            Please sign in to leave a comment.
          </p>
          <Link href={`/auth/signin?callbackUrl=/blog/${postSlug}`}>
            <Button>Sign In</Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
