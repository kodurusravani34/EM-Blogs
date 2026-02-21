import { useState, useEffect } from 'react';
import { bookmarksAPI } from '../services/api';
import ArticleCard from '../components/ui/ArticleCard';
import { ArticleCardSkeleton } from '../components/ui/Skeletons';
import { FiBookmark } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Bookmarks = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const { data } = await bookmarksAPI.getAll();
                setBookmarks(data.bookmarks);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarks();
    }, []);

    return (
        <div className="min-h-screen pt-24 fade-in-up">
            <div className="container-center py-8">
                <div className="flex items-center gap-3 mb-8">
                    <FiBookmark className="w-6 h-6" />
                    <h1 className="font-serif text-3xl font-bold">Your Bookmarks</h1>
                </div>

                {loading ? (
                    <div className="flex flex-col gap-6">
                        {[...Array(4)].map((_, i) => <ArticleCardSkeleton key={i} />)}
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔖</div>
                        <h3 className="font-serif text-2xl font-bold mb-2">No bookmarks yet</h3>
                        <p className="text-ink-lighter mb-6">Save articles you'd like to read later</p>
                        <Link to="/" className="btn-primary">
                            Explore articles
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {bookmarks.map(({ article }) => (
                            <ArticleCard key={article._id} article={article} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookmarks;
