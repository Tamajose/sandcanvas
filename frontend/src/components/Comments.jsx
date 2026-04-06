import React, { useState, useEffect } from "react";
import {
  getCommentsByCreation,
  addComment,
  updateComment,
  deleteComment,
} from "../api/comments";
import "../../styles/comments.css";

const API_URL = import.meta.env.VITE_API_URL;

const Comments = ({ creationId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (creationId) {
      fetchComments();
    }
  }, [creationId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const data = await getCommentsByCreation(creationId);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newText.trim() || !currentUser) return;
    try {
      const data = await addComment(creationId, newText.trim());
      setComments([data, ...comments]);
      setNewText("");
    } catch (error) {
      alert("Failed to post comment");
    }
  };

  const handleSaveEdit = async (id) => {
    if (!editingText.trim()) return;
    try {
      const data = await updateComment(id, editingText.trim());
      setComments((prev) =>
        prev.map((c) =>
          c._id.toString() === id.toString()
            ? { ...c, text: data.comment.text }
            : c,
        ),
      );
      setEditingId(null);
      setEditingText("");
    } catch (error) {
      alert("Failed to update comment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      await deleteComment(id);
      setComments((prev) =>
        prev.filter((c) => c._id.toString() !== id.toString()),
      );
    } catch (error) {
      alert("Failed to delete comment");
    }
  };

  const renderAvatar = (user) => {
    if (user?.profileImage?.url) {
      return (
        <img
          src={
            user.profileImage.url.startsWith("http")
              ? user.profileImage.url
              : `${API_URL}${user.profileImage.url}`
          }
          alt={user.name}
          className="comment-avatar"
        />
      );
    }
    return (
      <div className="comment-avatar comment-avatar-placeholder">
        {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
      </div>
    );
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">Comments</h3>

      {/* Input Area */}
      <div className="comment-input-container">
        {renderAvatar(currentUser)}
        <div className="comment-input-wrapper">
          <textarea
            className="comment-input"
            placeholder={currentUser ? "Add a comment" : "Sign in to comment"}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            disabled={!currentUser}
          />
          {currentUser && (
            <button
              className="comment-submit-btn"
              onClick={handlePostComment}
              disabled={!newText.trim()}
            >
              Post
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="no-comments">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="no-comments">No comments yet.</div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => {
            const isOwner =
              currentUser &&
              (comment.userID === currentUser._id ||
                comment.userID?._id === currentUser._id);

            return (
              <div key={comment._id} className="comment-item">
                {renderAvatar(comment.userID)}
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.userID?.name || "Unknown"}
                    </span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  {editingId === comment._id ? (
                    <div className="comment-input-wrapper">
                      <textarea
                        className="comment-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignSelf: "flex-end",
                        }}
                      >
                        <button
                          className="comment-action-btn"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="comment-submit-btn"
                          onClick={() => handleSaveEdit(comment._id)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="comment-text">{comment.text}</div>
                      {isOwner && (
                        <div className="comment-actions">
                          <button
                            className="comment-action-btn"
                            onClick={() => {
                              setEditingId(comment._id);
                              setEditingText(comment.text);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="comment-action-btn delete"
                            onClick={() => handleDelete(comment._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comments;
