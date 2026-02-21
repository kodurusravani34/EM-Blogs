import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { articlesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiImage, FiX, FiSave, FiSend, FiTag } from 'react-icons/fi';

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
    ]
};

const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block', 'list',
    'link', 'image'
];

const WriteArticle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [keywordInput, setKeywordInput] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const autoSaveTimer = useRef(null);

    // Load article for editing
    useEffect(() => {
        if (id) {
            const loadArticle = async () => {
                try {
                    const { data } = await articlesAPI.getById(id);
                    const article = data.article;
                    setTitle(article.title);
                    setContent(article.content);
                    setExcerpt(article.excerpt || '');
                    setKeywords(article.keywords || []);
                    if (article.coverImage) {
                        setCoverPreview(`http://localhost:5000${article.coverImage}`);
                    }
                } catch (error) {
                    toast.error('Failed to load article');
                    navigate('/');
                }
            };
            loadArticle();
        }
    }, [id, navigate]);

    // Auto-save draft
    const autoSaveDraft = useCallback(async () => {
        if (!title.trim() || !content.trim()) return;
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('excerpt', excerpt);
            formData.append('keywords', JSON.stringify(keywords));
            formData.append('status', 'draft');

            if (id) {
                await articlesAPI.update(id, formData);
            }
            setLastSaved(new Date());
        } catch {
            // Silently fail auto-save
        }
    }, [title, content, excerpt, keywords, id]);

    useEffect(() => {
        if (id && title && content) {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
            autoSaveTimer.current = setTimeout(autoSaveDraft, 30000);
        }
        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        };
    }, [title, content, excerpt, keywords, autoSaveDraft, id]);

    const handleCoverImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const addKeyword = () => {
        const kw = keywordInput.trim().toLowerCase();
        if (kw && !keywords.includes(kw) && keywords.length < 5) {
            setKeywords([...keywords, kw]);
            setKeywordInput('');
        }
    };

    const handleKeywordKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword();
        }
    };

    const removeKeyword = (kw) => {
        setKeywords(keywords.filter(k => k !== kw));
    };

    const handleSave = async (status) => {
        if (!title.trim()) {
            toast.error('Please add a title');
            return;
        }
        if (status === 'published' && !content.trim()) {
            toast.error('Please add some content');
            return;
        }

        const isPublishing = status === 'published';
        isPublishing ? setPublishing(true) : setSaving(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('excerpt', excerpt);
            formData.append('keywords', JSON.stringify(keywords));
            formData.append('status', status);
            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            let response;
            if (id) {
                response = await articlesAPI.update(id, formData);
            } else {
                response = await articlesAPI.create(formData);
            }

            toast.success(isPublishing ? 'Article published!' : 'Draft saved!');
            if (isPublishing) {
                navigate(`/article/${response.data.article.slug}`);
            } else if (!id) {
                navigate(`/write/${response.data.article._id}`);
            }
            setLastSaved(new Date());
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
            setPublishing(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 fade-in-up">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {/* Top actions */}
                <div className="flex items-center justify-between mb-8 sticky top-16 bg-cream/90 backdrop-blur-sm py-4 z-10 border-b border-ink-ghost/50">
                    <div className="flex items-center gap-2">
                        {lastSaved && (
                            <span className="text-xs text-ink-muted">
                                Last saved {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-ink-ghost hover:bg-white transition-all disabled:opacity-50"
                        >
                            <FiSave className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save draft'}
                        </button>
                        <button
                            onClick={() => handleSave('published')}
                            disabled={publishing}
                            className="flex items-center gap-2 px-5 py-2 bg-ink text-cream rounded-full text-sm font-medium hover:bg-ink-light transition-all disabled:opacity-50"
                        >
                            <FiSend className="w-4 h-4" />
                            {publishing ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>

                {/* Cover Image */}
                <div className="mb-8">
                    {coverPreview ? (
                        <div className="relative rounded-2xl overflow-hidden group">
                            <img src={coverPreview} alt="Cover" className="w-full h-64 object-cover" />
                            <button
                                onClick={() => { setCoverImage(null); setCoverPreview(''); }}
                                className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex items-center gap-3 px-6 py-4 border-2 border-dashed border-ink-ghost rounded-2xl cursor-pointer hover:border-ink-faint hover:bg-cream-dark/30 transition-all text-ink-muted">
                            <FiImage className="w-5 h-5" />
                            <span className="text-sm font-medium">Add cover image</span>
                            <input type="file" accept="image/*" onChange={handleCoverImage} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Title */}
                <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Article title..."
                    rows={1}
                    className="w-full font-serif text-3xl md:text-4xl font-bold bg-transparent outline-none resize-none placeholder:text-ink-faint mb-4 leading-snug"
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />

                {/* Excerpt */}
                <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Write a brief excerpt..."
                    rows={2}
                    className="w-full text-ink-lighter bg-transparent outline-none resize-none placeholder:text-ink-faint mb-6 text-lg leading-relaxed"
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />

                {/* Keywords */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <FiTag className="w-4 h-4 text-ink-muted" />
                        <span className="text-sm font-medium text-ink-lighter">Keywords</span>
                        <span className="text-xs text-ink-muted">({keywords.length}/5)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {keywords.map((kw) => (
                            <span key={kw} className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-sm border border-ink-ghost">
                                {kw}
                                <button onClick={() => removeKeyword(kw)} className="text-ink-muted hover:text-danger transition-colors">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        {keywords.length < 5 && (
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={handleKeywordKeyDown}
                                onBlur={addKeyword}
                                placeholder="Add keyword..."
                                className="px-3 py-1 bg-transparent outline-none text-sm placeholder:text-ink-faint min-w-[120px]"
                            />
                        )}
                    </div>
                </div>

                {/* Editor */}
                <div className="mb-12">
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        placeholder="Tell your story..."
                    />
                </div>
            </div>
        </div>
    );
};

export default WriteArticle;
