import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import ArticleCard from '../components/ui/ArticleCard';
import { ArticleCardSkeleton } from '../components/ui/Skeletons';
import { FiSearch } from 'react-icons/fi';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setQuery(q);
            performSearch(q);
        }
    }, [searchParams]);

    const performSearch = async (q) => {
        setLoading(true);
        setSearched(true);
        try {
            const { data } = await articlesAPI.search(q);
            setArticles(data.articles);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ q: query.trim() });
        }
    };

    return (
        <div className="min-h-screen pt-24 fade-in-up">
            <div className="container-center py-8">
                <h1 className="font-serif text-3xl font-bold mb-8">Search</h1>

                <form onSubmit={handleSubmit} className="mb-10">
                    <div className="relative">
                        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-muted w-5 h-5" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by title, content, author, or keyword..."
                            autoFocus
                            className="input-field pl-14 text-lg"
                        />
                    </div>
                </form>

                {loading ? (
                    <div className="flex flex-col gap-6">
                        {[...Array(4)].map((_, i) => <ArticleCardSkeleton key={i} />)}
                    </div>
                ) : searched && articles.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="font-serif text-xl font-bold mb-2">No results found</h3>
                        <p className="text-ink-lighter text-sm">Try different keywords or a broader search term</p>
                    </div>
                ) : (
                    <>
                        {searched && (
                            <p className="text-sm text-ink-muted mb-6">{articles.length} result{articles.length !== 1 ? 's' : ''} found</p>
                        )}
                        <div className="flex flex-col">
                            {articles.map((article) => (
                                <ArticleCard key={article._id} article={article} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Search;
