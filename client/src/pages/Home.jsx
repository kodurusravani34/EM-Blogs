import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import ArticleCard from '../components/ui/ArticleCard';
import { ArticleCardSkeleton } from '../components/ui/Skeletons';
import { FiTrendingUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Home = () => {
    const [articles, setArticles] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [keywordsLoading, setKeywordsLoading] = useState(true);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (selectedKeyword) params.keyword = selectedKeyword;
            const { data } = await articlesAPI.getAll(params);
            setArticles(data.articles);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, selectedKeyword]);

    const fetchKeywords = async () => {
        try {
            const { data } = await articlesAPI.getKeywords();
            setKeywords(data);
        } catch (error) {
            console.error(error);
        } finally {
            setKeywordsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    useEffect(() => {
        fetchKeywords();
    }, []);

    const handleKeywordClick = (keyword) => {
        setSelectedKeyword(selectedKeyword === keyword ? '' : keyword);
        setPage(1);
    };

    return (
        <div className="min-h-screen pt-20 fade-in-up">
            {/* Sticky Category Bar - Provides room below Navbar */}
            <div className="sticky top-20 z-40 bg-cream/80 backdrop-blur-md border-b border-ink-ghost/20 mb-16">
                <div className="container-center">
                    <div className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <button className="py-5 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-ink text-ink">Discover</button>
                        <button className="py-5 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted hover:text-ink transition-colors">Following</button>
                        <button className="py-5 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted hover:text-ink transition-colors">Design</button>
                        <button className="py-5 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted hover:text-ink transition-colors">Technology</button>
                        <button className="py-5 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted hover:text-ink transition-colors">Philosophy</button>
                    </div>
                </div>
            </div>

            <div className="container-center pb-24">
                <div className="flex flex-col">
                    {/* Main Feed */}
                    <main className="max-w-6xl mx-auto w-full">
                        {loading ? (
                            <div className="space-y-32">
                                {[...Array(3)].map((_, i) => <ArticleCardSkeleton key={i} />)}
                            </div>
                        ) : articles.length === 0 ? (
                            <div className="text-center py-20 grayscale opacity-50">
                                <div className="text-8xl mb-6">📜</div>
                                <h3 className="font-serif text-3xl font-bold mb-3">The archives are empty</h3>
                                <p className="text-ink-lighter mb-8 italic">Your story is the missing piece.</p>
                                <Link to="/write" className="btn-primary">
                                    Begin Writing
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-12">
                                    {articles.map((article) => (
                                        <ArticleCard key={article._id} article={article} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-12 py-8">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-2 rounded-full border border-ink-ghost hover:bg-white disabled:opacity-30 transition-all"
                                        >
                                            <FiChevronLeft className="w-5 h-5" />
                                        </button>
                                        <div className="flex items-center gap-2">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setPage(i + 1)}
                                                    className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${page === i + 1
                                                        ? 'bg-ink text-cream'
                                                        : 'hover:bg-cream-dark text-ink-lighter'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                                        </div>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="p-2 rounded-full border border-ink-ghost hover:bg-white disabled:opacity-30 transition-all"
                                        >
                                            <FiChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
};

export default Home;
