import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
    FiUsers, FiFileText, FiMessageSquare, FiTrendingUp,
    FiTrash2, FiSlash, FiCheckCircle, FiActivity
} from 'react-icons/fi';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/admin/login');
            return;
        }
        fetchStats();
    }, [user, navigate]);

    const fetchStats = async () => {
        try {
            const { data } = await adminAPI.getStats();
            setStats(data);
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await adminAPI.getUsers();
            setUsers(data.users);
        } catch (error) {
            toast.error('Failed to load users');
        }
    };

    const fetchArticles = async () => {
        try {
            const { data } = await adminAPI.getArticles();
            setArticles(data.articles);
        } catch (error) {
            toast.error('Failed to load articles');
        }
    };

    const fetchComments = async () => {
        try {
            const { data } = await adminAPI.getComments();
            setComments(data.comments);
        } catch (error) {
            toast.error('Failed to load comments');
        }
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'articles') fetchArticles();
        if (activeTab === 'comments') fetchComments();
    }, [activeTab]);

    const handleBlockUser = async (userId) => {
        try {
            const { data } = await adminAPI.blockUser(userId);
            setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: data.user.isBlocked } : u));
            toast.success(data.message);
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Delete this user and all their content?')) return;
        try {
            await adminAPI.deleteUser(userId);
            setUsers(users.filter(u => u._id !== userId));
            toast.success('User deleted');
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleDeleteArticle = async (articleId) => {
        if (!window.confirm('Delete this article?')) return;
        try {
            await adminAPI.deleteArticle(articleId);
            setArticles(articles.filter(a => a._id !== articleId));
            toast.success('Article deleted');
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete article');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await adminAPI.deleteComment(commentId);
            setComments(comments.filter(c => c._id !== commentId));
            toast.success('Comment deleted');
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-ink border-t-transparent rounded-full" />
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiActivity },
        { id: 'users', label: 'Users', icon: FiUsers },
        { id: 'articles', label: 'Articles', icon: FiFileText },
        { id: 'comments', label: 'Comments', icon: FiMessageSquare },
    ];

    return (
        <div className="min-h-screen pt-24 fade-in-up">
            <div className="container-center py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-ink-lighter text-sm mt-1">Manage your platform</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                        <FiTrendingUp className="w-5 h-5 text-cream" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-cream-dark rounded-xl p-1 overflow-x-auto">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === id
                                ? 'bg-white shadow-sm text-ink'
                                : 'text-ink-lighter hover:text-ink'
                                }`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {/* Overview */}
                {activeTab === 'overview' && stats && (
                    <>
                        {/* Stats cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                            <div className="card-premium p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <FiUsers className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-ink-lighter font-medium">Total Users</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                            </div>
                            <div className="card-premium p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                        <FiFileText className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-sm text-ink-lighter font-medium">Published Articles</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.totalArticles}</p>
                            </div>
                            <div className="card-premium p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                        <FiMessageSquare className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="text-sm text-ink-lighter font-medium">Total Comments</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.totalComments}</p>
                            </div>
                        </div>

                        {/* Recent Users & Articles */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card-premium p-6">
                                <h3 className="font-serif text-lg font-bold mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {stats.recentUsers?.map((u) => (
                                        <div key={u._id} className="flex items-center justify-between py-2 border-b border-ink-ghost/30 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{u.name}</p>
                                                <p className="text-xs text-ink-muted">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {u.isBlocked && (
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">Blocked</span>
                                                )}
                                                <span className="text-xs text-ink-muted">{format(new Date(u.createdAt), 'MMM d')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card-premium p-6">
                                <h3 className="font-serif text-lg font-bold mb-4">Recent Articles</h3>
                                <div className="space-y-3">
                                    {stats.recentArticles?.map((a) => (
                                        <div key={a._id} className="flex items-center justify-between py-2 border-b border-ink-ghost/30 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium line-clamp-1">{a.title}</p>
                                                <p className="text-xs text-ink-muted">by {a.author?.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-ink-muted">{a.likes?.length || 0} ❤️</span>
                                                <span className="text-xs text-ink-muted">{format(new Date(a.createdAt), 'MMM d')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl border border-ink-ghost/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-cream-dark">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">User</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Email</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Joined</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink-ghost/30">
                                    {users.map((u) => (
                                        <tr key={u._id} className="hover:bg-cream/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-ink-ghost flex items-center justify-center">
                                                        <span className="text-xs font-semibold">{u.name?.charAt(0)}</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-ink-lighter">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                                    }`}>
                                                    {u.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-ink-muted">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleBlockUser(u._id)}
                                                        className={`p-1.5 rounded-lg transition-colors ${u.isBlocked ? 'hover:bg-green-50 text-green-600' : 'hover:bg-amber-50 text-amber-600'
                                                            }`}
                                                        title={u.isBlocked ? 'Unblock' : 'Block'}
                                                    >
                                                        {u.isBlocked ? <FiCheckCircle className="w-4 h-4" /> : <FiSlash className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {users.length === 0 && (
                            <div className="text-center py-10 text-ink-muted text-sm">No users found</div>
                        )}
                    </div>
                )}

                {/* Articles Tab */}
                {activeTab === 'articles' && (
                    <div className="bg-white rounded-2xl border border-ink-ghost/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-cream-dark">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Title</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Author</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Date</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink-ghost/30">
                                    {articles.map((a) => (
                                        <tr key={a._id} className="hover:bg-cream/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium max-w-xs truncate">{a.title}</td>
                                            <td className="px-6 py-4 text-sm text-ink-lighter">{a.author?.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${a.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-ink-muted">{format(new Date(a.createdAt), 'MMM d, yyyy')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteArticle(a._id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {articles.length === 0 && (
                            <div className="text-center py-10 text-ink-muted text-sm">No articles found</div>
                        )}
                    </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                    <div className="bg-white rounded-2xl border border-ink-ghost/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-cream-dark">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Comment</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Author</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Article</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Date</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-ink-lighter uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink-ghost/30">
                                    {comments.map((c) => (
                                        <tr key={c._id} className="hover:bg-cream/50 transition-colors">
                                            <td className="px-6 py-4 text-sm max-w-xs truncate">{c.content}</td>
                                            <td className="px-6 py-4 text-sm text-ink-lighter">{c.author?.name}</td>
                                            <td className="px-6 py-4 text-sm text-ink-lighter truncate max-w-[150px]">{c.article?.title || 'Deleted'}</td>
                                            <td className="px-6 py-4 text-sm text-ink-muted">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteComment(c._id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {comments.length === 0 && (
                            <div className="text-center py-10 text-ink-muted text-sm">No comments found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
