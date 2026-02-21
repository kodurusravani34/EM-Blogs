import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articlesAPI, commentsAPI, bookmarksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArticleDetailSkeleton } from '../components/ui/Skeletons';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
    FiHeart, FiMessageCircle, FiBookmark, FiShare2,
    FiClock, FiCalendar, FiEdit3, FiTrash2, FiSend,
    FiCornerDownRight, FiX
} from 'react-icons/fi';

const ArticleDetail = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const { data } = await articlesAPI.getBySlug(slug);
                setArticle(data.article);
                setIsLiked(data.isLiked);
                setLikesCount(data.article.likes?.length || 0);
            } catch (error) {
                toast.error('Article not found');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug, navigate]);

    useEffect(() => {
        if (article) {
            const fetchComments = async () => {
                try {
                    const { data } = await commentsAPI.getByArticle(article._id);
                    setComments(data.comments);
                } catch (error) {
                    console.error(error);
                }
            };
            fetchComments();

            if (user) {
                const checkBookmark = async () => {
                    try {
                        const { data } = await bookmarksAPI.check(article._id);
                        setIsBookmarked(data.isBookmarked);
                    } catch (error) {
                        console.error(error);
                    }
                };
                checkBookmark();
            }
        }
    }, [article, user]);

    const handleLike = async () => {
        if (!user) { toast.error('Please sign in to like'); return; }
        try {
            const { data } = await articlesAPI.toggleLike(article._id);
            setIsLiked(data.isLiked);
            setLikesCount(data.likes);
        } catch (error) {
            toast.error('Failed to like');
        }
    };

    const handleBookmark = async () => {
        if (!user) { toast.error('Please sign in to bookmark'); return; }
        try {
            const { data } = await bookmarksAPI.toggle(article._id);
            setIsBookmarked(data.isBookmarked);
            toast.success(data.isBookmarked ? 'Bookmarked!' : 'Removed from bookmarks');
        } catch (error) {
            toast.error('Failed to bookmark');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    const handleAddComment = async () => {
        if (!user) { toast.error('Please sign in to comment'); return; }
        if (!newComment.trim()) return;
        try {
            const { data } = await commentsAPI.create({ content: newComment, articleId: article._id });
            setComments([{ ...data.comment, replies: [] }, ...comments]);
            setNewComment('');
            toast.success('Comment added!');
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const handleReply = async (commentId) => {
        if (!replyContent.trim()) return;
        try {
            const { data } = await commentsAPI.create({
                content: replyContent,
                articleId: article._id,
                parentCommentId: commentId
            });
            setComments(comments.map(c =>
                c._id === commentId
                    ? { ...c, replies: [...(c.replies || []), data.comment] }
                    : c
            ));
            setReplyingTo(null);
            setReplyContent('');
        } catch (error) {
            toast.error('Failed to reply');
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim()) return;
        try {
            await commentsAPI.update(commentId, { content: editContent });
            setComments(comments.map(c =>
                c._id === commentId
                    ? { ...c, content: editContent }
                    : { ...c, replies: c.replies?.map(r => r._id === commentId ? { ...r, content: editContent } : r) }
            ));
            setEditingComment(null);
            setEditContent('');
            toast.success('Comment updated');
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await commentsAPI.delete(commentId);
            setComments(comments.filter(c => c._id !== commentId).map(c => ({
                ...c,
                replies: c.replies?.filter(r => r._id !== commentId)
            })));
            toast.success('Comment deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleDeleteArticle = async () => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;
        try {
            await articlesAPI.delete(article._id);
            toast.success('Article deleted');
            navigate('/');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <ArticleDetailSkeleton />;
    if (!article) return null;

    const isOwner = user && user._id === article.author?._id;

    return (
        <div className="min-h-screen pt-24 fade-in-up">
            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {/* Keywords */}
                {article.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {article.keywords.map((kw) => (
                            <Link
                                key={kw}
                                to={`/?keyword=${kw}`}
                                className="px-3 py-1 bg-cream-dark text-ink-lighter text-xs rounded-full font-medium hover:bg-cream-darker transition-colors"
                            >
                                {kw}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                    {article.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-ink-ghost">
                    <Link to={`/profile/${article.author?._id}`} className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-full bg-ink-ghost flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-ink-faint transition-all">
                            {article.author?.profilePicture ? (
                                <img src={`http://localhost:5000${article.author.profilePicture}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg font-bold text-ink-lighter">{article.author?.name?.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold group-hover:text-accent-warm transition-colors">{article.author?.name}</p>
                            <div className="flex items-center gap-3 text-sm text-ink-muted">
                                <span className="flex items-center gap-1">
                                    <FiCalendar className="w-3 h-3" />
                                    {format(new Date(article.createdAt), 'MMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FiClock className="w-3 h-3" />
                                    {article.readingTime} min read
                                </span>
                            </div>
                        </div>
                    </Link>
                    {isOwner && (
                        <div className="flex items-center gap-2">
                            <Link
                                to={`/write/${article._id}`}
                                className="p-2 hover:bg-cream-dark rounded-lg transition-colors text-ink-lighter"
                                title="Edit"
                            >
                                <FiEdit3 className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={handleDeleteArticle}
                                className="p-2 hover:bg-cream-dark rounded-lg transition-colors text-danger"
                                title="Delete"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Cover Image */}
                {article.coverImage && (
                    <div className="rounded-2xl overflow-hidden mb-10 shadow-lg">
                        <img
                            src={`http://localhost:5000${article.coverImage}`}
                            alt={article.title}
                            className="w-full max-h-[500px] object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="article-content mb-12"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Action bar */}
                <div className="flex items-center justify-between py-6 border-t border-b border-ink-ghost mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isLiked
                                ? 'bg-red-50 text-red-500 border border-red-200'
                                : 'hover:bg-cream-dark border border-transparent'
                                }`}
                        >
                            <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="text-sm font-medium">{likesCount}</span>
                        </button>
                        <a href="#comments" className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-cream-dark transition-all">
                            <FiMessageCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">{comments.length}</span>
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBookmark}
                            className={`p-2 rounded-full transition-all ${isBookmarked ? 'text-accent-warm bg-cream-dark' : 'hover:bg-cream-dark'}`}
                        >
                            <FiBookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-cream-dark transition-all">
                            <FiShare2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                <div id="comments">
                    <h3 className="font-serif text-2xl font-bold mb-6">
                        Comments ({comments.length})
                    </h3>

                    {/* Add comment */}
                    {user ? (
                        <div className="flex gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-ink-ghost flex items-center justify-center overflow-hidden flex-shrink-0">
                                {user.profilePicture ? (
                                    <img src={`http://localhost:5000${user.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-semibold text-ink-lighter">{user.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={3}
                                    className="w-full p-4 bg-white rounded-xl border border-ink-ghost/50 text-sm outline-none resize-none focus:border-ink-faint transition-all"
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="flex items-center gap-2 px-4 py-2 bg-ink text-cream rounded-full text-sm font-medium hover:bg-ink-light transition-all disabled:opacity-30"
                                    >
                                        <FiSend className="w-4 h-4" /> Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 mb-8 bg-white rounded-xl border border-ink-ghost/50">
                            <p className="text-ink-lighter text-sm">
                                <Link to="/login" className="font-medium text-ink hover:text-accent-warm transition-colors">Sign in</Link> to join the conversation
                            </p>
                        </div>
                    )}

                    {/* Comments list */}
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment._id} className="group">
                                <div className="flex gap-3">
                                    <Link to={`/profile/${comment.author?._id}`} className="w-9 h-9 rounded-full bg-ink-ghost flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {comment.author?.profilePicture ? (
                                            <img src={`http://localhost:5000${comment.author.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-semibold text-ink-lighter">{comment.author?.name?.charAt(0)}</span>
                                        )}
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link to={`/profile/${comment.author?._id}`} className="text-sm font-semibold hover:text-accent-warm transition-colors">
                                                {comment.author?.name}
                                            </Link>
                                            <span className="text-xs text-ink-muted">{format(new Date(comment.createdAt), 'MMM d, yyyy')}</span>
                                        </div>
                                        {editingComment === comment._id ? (
                                            <div>
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    rows={2}
                                                    className="w-full p-3 bg-white rounded-lg border border-ink-ghost text-sm outline-none resize-none"
                                                />
                                                <div className="flex gap-2 mt-1">
                                                    <button onClick={() => handleEditComment(comment._id)} className="text-xs text-ink font-medium hover:text-accent-warm">Save</button>
                                                    <button onClick={() => setEditingComment(null)} className="text-xs text-ink-muted hover:text-ink">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-ink-light leading-relaxed">{comment.content}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {user && (
                                                <button
                                                    onClick={() => { setReplyingTo(replyingTo === comment._id ? null : comment._id); setReplyContent(''); }}
                                                    className="text-xs text-ink-muted hover:text-ink transition-colors"
                                                >
                                                    Reply
                                                </button>
                                            )}
                                            {user && (user._id === comment.author?._id || user.role === 'admin') && (
                                                <>
                                                    <button
                                                        onClick={() => { setEditingComment(comment._id); setEditContent(comment.content); }}
                                                        className="text-xs text-ink-muted hover:text-ink transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteComment(comment._id)} className="text-xs text-ink-muted hover:text-danger transition-colors">
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {replyingTo === comment._id && (
                                            <div className="flex items-start gap-2 mt-3">
                                                <FiCornerDownRight className="w-4 h-4 text-ink-muted mt-2 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <textarea
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder="Write a reply..."
                                                        rows={2}
                                                        className="w-full p-3 bg-cream-dark rounded-lg text-sm outline-none resize-none"
                                                    />
                                                    <div className="flex gap-2 mt-1">
                                                        <button onClick={() => handleReply(comment._id)} className="text-xs font-medium text-ink hover:text-accent-warm">Reply</button>
                                                        <button onClick={() => setReplyingTo(null)} className="text-xs text-ink-muted hover:text-ink">Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Replies */}
                                        {comment.replies?.length > 0 && (
                                            <div className="mt-4 space-y-4 pl-4 border-l-2 border-ink-ghost/50">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply._id} className="flex gap-3 group/reply">
                                                        <div className="w-7 h-7 rounded-full bg-ink-ghost flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {reply.author?.profilePicture ? (
                                                                <img src={`http://localhost:5000${reply.author.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs font-semibold text-ink-lighter">{reply.author?.name?.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-semibold">{reply.author?.name}</span>
                                                                <span className="text-xs text-ink-muted">{format(new Date(reply.createdAt), 'MMM d')}</span>
                                                            </div>
                                                            <p className="text-sm text-ink-light">{reply.content}</p>
                                                            {user && (user._id === reply.author?._id || user.role === 'admin') && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(reply._id)}
                                                                    className="text-xs text-ink-muted hover:text-danger mt-1 opacity-0 group-hover/reply:opacity-100 transition-opacity"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default ArticleDetail;
