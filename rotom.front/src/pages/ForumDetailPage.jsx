import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function ForumDetailPage() {
  const { forum_id } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const user_id = localStorage.getItem('user_id');
  const [forumCreator, setForumCreator] = useState(null);

  const fetchComments = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/forums/${forum_id}/comments`);
    setComments(res.data);
    if (res.data.length > 0) setForumCreator(res.data[0].forum_manager);
  };

  useEffect(() => {
    fetchComments();
  }, [forum_id]);

  const postComment = async (reply_to = null) => {
    if (!newComment.trim()) return;
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/forums/comment`, {
      forum_id, comment_text: newComment, commentor: user_id, reply_to
    });
    setNewComment('');
    fetchComments();
  };

  const deleteComment = async (comment_id) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/forums/comment`, {
      data: { comment_id, forum_id, user_id }
    });
    fetchComments();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl mb-4">Forum Comments</h1>
      {comments.map(c => (
        <div key={c.comment_id} className="border p-3 mb-3 rounded">
          <p className="font-semibold">{c.username}</p>
          <p className="mb-1">{c.comment_text}</p>
          <p className="text-xs text-gray-500">{c.comment_time}</p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => setNewComment(`@${c.username} `)} className="text-blue-500 text-sm">Reply</button>
            {forumCreator === parseInt(user_id) && (
              <button onClick={() => deleteComment(c.comment_id)} className="text-red-500 text-sm">Delete</button>
            )}
          </div>
        </div>
      ))}
      <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Type your comment..." className="border p-2 w-full mb-2" />
      <button onClick={() => postComment()} className="bg-green-500 text-white px-4 py-2 rounded">Post</button>
    </div>
  );
}
