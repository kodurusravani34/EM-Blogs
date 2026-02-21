import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI, articlesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ui/ArticleCard';
import { ProfileSkeleton } from '../components/ui/Skeletons';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiCalendar, FiEdit3, FiCamera, FiX, FiCheck, FiFileText, FiTag, FiLink, FiPlus, FiTrash2, FiGithub, FiLinkedin, FiGlobe } from 'react-icons/fi';
import { BASE_URL } from '../config';

const Profile = () => {
    const { id } = useParams();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [articles, setArticles] = useState([]);
    const [keywordStats, setKeywordStats] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editImage, setEditImage] = useState(null);
    const [editPreview, setEditPreview] = useState('');
    const [editLinks, setEditLinks] = useState([]);
    const [saving, setSaving] = useState(false);

    const isOwner = user && user._id === id;

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const [profileRes, articlesRes] = await Promise.all([
                    authAPI.getUserProfile(id),
                    articlesAPI.getByUser(id, selectedKeyword ? { keyword: selectedKeyword } : {})
                ]);
                setProfile(profileRes.data.user);
                setArticles(articlesRes.data.articles);
                setKeywordStats(articlesRes.data.keywordStats || []);
            } catch (error) {
                toast.error('Profile not found');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, selectedKeyword, navigate]);

    const handleStartEdit = () => {
        setEditName(profile.name);
        setEditBio(profile.bio || '');
        setEditPreview(profile.profilePicture ? `${BASE_URL}${profile.profilePicture}` : '');
        setEditLinks(profile.links || []);
        setEditing(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditImage(file);
            setEditPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editName);
            formData.append('bio', editBio);
            // Filter out links that have neither name nor URL
            const validLinks = editLinks.filter(l => l.name.trim() || l.url.trim());
            formData.append('links', JSON.stringify(validLinks));
            if (editImage) formData.append('profilePicture', editImage);
            const { data } = await authAPI.updateProfile(formData);
            setProfile(data.user);
            updateUser(data.user);
            setEditing(false);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <ProfileSkeleton />;
    if (!profile) return null;

    // Group articles by dominant keywords
    const groupedByKeyword = {};
    if (!selectedKeyword && keywordStats.length > 0) {
        // Get top 5 keywords
        const topKeywords = keywordStats.slice(0, 5).map(k => k.keyword);
        const assignedArticles = new Set();

        topKeywords.forEach(kw => {
            groupedByKeyword[kw] = articles.filter(a => {
                if (assignedArticles.has(a._id)) return false;
                if (a.keywords?.includes(kw)) {
                    assignedArticles.add(a._id);
                    return true;
                }
                return false;
            });
        });

        // Remaining articles
        const remaining = articles.filter(a => !assignedArticles.has(a._id));
        if (remaining.length > 0) {
            groupedByKeyword['other'] = remaining;
        }
    }

    const showGrouped = !selectedKeyword && keywordStats.length > 0 && Object.keys(groupedByKeyword).length > 0;

    return (
        <div className="min-h-screen pt-20 fade-in-up">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 pb-8 border-b border-ink-ghost">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-ink-ghost flex items-center justify-center overflow-hidden ring-4 ring-cream-dark">
                            {editing ? (
                                <>
                                    {editPreview ? (
                                        <img src={editPreview} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-ink-lighter">{editName?.charAt(0)}</span>
                                    )}
                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                        <FiCamera className="w-6 h-6 text-white" />
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                </>
                            ) : (
                                profile.profilePicture ? (
                                    <img src={`${BASE_URL}${profile.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-ink-lighter">{profile.name?.charAt(0)}</span>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        {editing ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="font-serif text-2xl font-bold bg-white px-3 py-1 rounded-lg border border-ink-ghost outline-none w-full"
                                />
                                <textarea
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                    maxLength={300}
                                    className="w-full px-3 py-2 bg-white rounded-lg border border-ink-ghost text-sm outline-none resize-none"
                                />

                                {/* Edit Links */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-muted">Websites & Links</label>
                                        <button
                                            onClick={() => setEditLinks([...editLinks, { name: '', url: '' }])}
                                            className="text-xs flex items-center gap-1 text-accent-warm hover:underline"
                                        >
                                            <FiPlus className="w-3 h-3" /> Add link
                                        </button>
                                    </div>
                                    {editLinks.map((link, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-cream-dark/30 p-3 rounded-xl border border-ink-ghost/20">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Label (e.g. GitHub)"
                                                    value={link.name}
                                                    onChange={(e) => {
                                                        const newLinks = [...editLinks];
                                                        newLinks[index].name = e.target.value;
                                                        setEditLinks(newLinks);
                                                    }}
                                                    className="w-full text-xs font-medium bg-white px-3 py-1.5 rounded-lg border border-ink-ghost outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="URL (https://...)"
                                                    value={link.url}
                                                    onChange={(e) => {
                                                        const newLinks = [...editLinks];
                                                        newLinks[index].url = e.target.value;
                                                        setEditLinks(newLinks);
                                                    }}
                                                    className="w-full text-xs bg-white px-3 py-1.5 rounded-lg border border-ink-ghost outline-none"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setEditLinks(editLinks.filter((_, i) => i !== index))}
                                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex items-center gap-1 px-4 py-1.5 bg-ink text-cream rounded-full text-sm font-medium hover:bg-ink-light transition-all disabled:opacity-50"
                                    >
                                        <FiCheck className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-4 py-1.5 border border-ink-ghost rounded-full text-sm hover:bg-cream-dark transition-all">
                                        <FiX className="w-4 h-4" /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="font-serif text-2xl md:text-3xl font-bold">{profile.name}</h1>
                                    {isOwner && (
                                        <button onClick={handleStartEdit} className="p-1.5 hover:bg-cream-dark rounded-lg transition-colors text-ink-lighter">
                                            <FiEdit3 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                {profile.bio && (
                                    <p className="text-ink-lighter leading-relaxed mb-3 max-w-lg">{profile.bio}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-ink-muted">
                                    <span className="flex items-center gap-1">
                                        <FiCalendar className="w-4 h-4" />
                                        Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiFileText className="w-4 h-4" />
                                        {articles.length} articles
                                    </span>
                                </div>

                                {/* External Links Display */}
                                {profile.links && profile.links.length > 0 && (
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        {profile.links.map((link, index) => {
                                            const getIcon = (name) => {
                                                const n = name.toLowerCase();
                                                if (n.includes('github')) return <FiGithub className="w-3.5 h-3.5" />;
                                                if (n.includes('linkedin')) return <FiLinkedin className="w-3.5 h-3.5" />;
                                                return <FiGlobe className="w-3.5 h-3.5" />;
                                            };

                                            return (
                                                <a
                                                    key={index}
                                                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-accent-warm hover:underline"
                                                >
                                                    {getIcon(link.name)}
                                                    {link.name}
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Keyword Stats */}
                {keywordStats.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <FiTag className="w-4 h-4 text-ink-muted" />
                            <span className="text-sm font-medium text-ink-muted uppercase tracking-wider">Most Written Topics</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedKeyword('')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${!selectedKeyword
                                    ? 'bg-ink text-cream shadow-lg'
                                    : 'bg-white text-ink-lighter border border-ink-ghost hover:border-ink-faint'
                                    }`}
                            >
                                All
                            </button>
                            {keywordStats.map(({ keyword, count }) => (
                                <button
                                    key={keyword}
                                    onClick={() => setSelectedKeyword(selectedKeyword === keyword ? '' : keyword)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${selectedKeyword === keyword
                                        ? 'bg-ink text-cream shadow-lg'
                                        : 'bg-white text-ink-lighter border border-ink-ghost hover:border-ink-faint hover:text-ink'
                                        }`}
                                >
                                    {keyword}
                                    <span className="ml-1.5 text-xs opacity-60">({count})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Articles */}
                {articles.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">✍️</div>
                        <h3 className="font-serif text-xl font-bold mb-2">No articles yet</h3>
                        <p className="text-ink-lighter text-sm">
                            {isOwner ? "Start writing your first article!" : "This writer hasn't published anything yet."}
                        </p>
                    </div>
                ) : showGrouped ? (
                    // Grouped by keyword
                    Object.entries(groupedByKeyword).map(([keyword, keyArticles]) => {
                        if (keyArticles.length === 0) return null;
                        return (
                            <div key={keyword} className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="font-serif text-xl font-bold capitalize">
                                        {keyword === 'other' ? 'Other Topics' : keyword}
                                    </h3>
                                    <span className="px-2.5 py-0.5 bg-cream-dark text-ink-lighter text-xs rounded-full font-medium">
                                        {keyArticles.length} {keyArticles.length === 1 ? 'article' : 'articles'}
                                    </span>
                                    {keyword !== 'other' && (
                                        <button
                                            onClick={() => setSelectedKeyword(keyword)}
                                            className="text-xs text-accent-warm hover:underline ml-auto"
                                        >
                                            Show more →
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-12">
                                    {keyArticles.slice(0, 4).map((article) => (
                                        <ArticleCard key={article._id} article={article} />
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Flat list (filtered or no keywords)
                    <div className="flex flex-col gap-12">
                        {articles.map((article) => (
                            <ArticleCard key={article._id} article={article} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
