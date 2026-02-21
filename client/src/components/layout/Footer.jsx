import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-cream-dark border-t border-ink-ghost mt-20">
            <div className="container-center py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-ink rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-cream font-serif font-bold text-xl">EM</span>
                            </div>
                            <span className="font-serif text-2xl font-bold italic">em blogs</span>
                        </Link>
                        <p className="text-ink-lighter text-sm leading-relaxed max-w-sm">
                            A handcrafted digital space for personal storytelling and thoughtful insights.
                            Preserve your legacy and share your journey with the world.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-ink-lighter">Explore</h4>
                        <ul className="space-y-2.5">
                            <li><Link to="/" className="text-sm text-ink-lighter hover:text-ink transition-colors">Home</Link></li>
                            <li><Link to="/write" className="text-sm text-ink-lighter hover:text-ink transition-colors">Write</Link></li>
                            <li><Link to="/search" className="text-sm text-ink-lighter hover:text-ink transition-colors">Search</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-ink-lighter">Account</h4>
                        <ul className="space-y-2.5">
                            <li><Link to="/login" className="text-sm text-ink-lighter hover:text-ink transition-colors">Sign in</Link></li>
                            <li><Link to="/register" className="text-sm text-ink-lighter hover:text-ink transition-colors">Create account</Link></li>
                            <li><Link to="/bookmarks" className="text-sm text-ink-lighter hover:text-ink transition-colors">Bookmarks</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-ink-ghost flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-ink-muted">© {new Date().getFullYear()} EM Blogs. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
