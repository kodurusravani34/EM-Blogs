import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiEdit3, FiBookmark, FiUser, FiLogOut, FiMenu, FiX, FiShield, FiBell } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowDropdown(false);
    };

    return (
        <nav className="glass-nav">
            <div className="container-center">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-ink rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6 shadow-sm">
                            <span className="text-cream font-serif font-bold text-xl">EM</span>
                        </div>
                        <span className="font-serif text-2xl font-bold tracking-tight hidden sm:block italic">blogs</span>
                    </Link>

                    {/* Search - Desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-4 h-4" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search articles..."
                                className="w-full pl-10 pr-4 py-2 bg-cream-dark rounded-full text-sm border border-transparent focus:border-ink-ghost focus:bg-white outline-none transition-all duration-300"
                            />
                        </div>
                    </form>

                    {/* Right side - Desktop */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <>
                                <Link
                                    to="/write"
                                    className="flex items-center gap-2 text-ink-lighter hover:text-ink transition-colors group/nav"
                                >
                                    <FiEdit3 className="w-5 h-5" />
                                    <span className="text-[0.9rem]">Write</span>
                                </Link>
                                <div className="flex items-center gap-4 text-ink-lighter border-l border-ink-ghost pl-6">
                                    <button className="hover:text-ink transition-colors" title="Notifications">
                                        <FiBell className="w-5 h-5" />
                                    </button>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="w-8 h-8 rounded-full bg-ink-ghost flex items-center justify-center overflow-hidden hover:opacity-80 transition-all duration-200 ring-1 ring-ink-ghost/50"
                                        >
                                            {user.profilePicture ? (
                                                <img src={`http://localhost:5000${user.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-ink-lighter">{user.name?.charAt(0).toUpperCase()}</span>
                                            )}
                                        </button>
                                        {showDropdown && (
                                            <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-ink-ghost/50 py-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                <div className="px-5 py-3 border-b border-ink-ghost/50 mb-1">
                                                    <p className="font-bold text-sm text-ink truncate">{user.name}</p>
                                                    <p className="text-xs text-ink-muted truncate mt-0.5">{user.email}</p>
                                                </div>
                                                <Link to={`/profile/${user._id}`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-ink-lighter hover:text-ink hover:bg-cream-dark transition-all">
                                                    <FiUser className="w-4 h-4" /> Profile
                                                </Link>
                                                <Link to="/bookmarks" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-ink-lighter hover:text-ink hover:bg-cream-dark transition-all">
                                                    <FiBookmark className="w-4 h-4" /> Library
                                                </Link>
                                                {user.role === 'admin' && (
                                                    <Link to="/admin" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-accent-warm hover:bg-cream-dark transition-all">
                                                        <FiShield className="w-4 h-4" /> Admin Console
                                                    </Link>
                                                )}
                                                <hr className="my-2 border-ink-ghost/50" />
                                                <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full text-left">
                                                    <FiLogOut className="w-4 h-4" /> Sign out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/login" className="text-sm font-medium text-ink-lighter hover:text-ink transition-colors">
                                    Sign in
                                </Link>
                                <Link to="/register" className="btn-primary scale-90">
                                    Get started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-cream-dark rounded-lg transition-colors">
                        {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-ink-ghost animate-in slide-in-from-top duration-200">
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search articles..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-cream-dark rounded-full text-sm border border-transparent focus:border-ink-ghost outline-none"
                                />
                            </div>
                        </form>
                        {user ? (
                            <div className="space-y-1">
                                <Link to="/write" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream-dark text-sm font-medium">
                                    <FiEdit3 className="w-4 h-4" /> Write Article
                                </Link>
                                <Link to={`/profile/${user._id}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream-dark text-sm">
                                    <FiUser className="w-4 h-4" /> Profile
                                </Link>
                                <Link to="/bookmarks" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream-dark text-sm">
                                    <FiBookmark className="w-4 h-4" /> Bookmarks
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream-dark text-sm text-accent-warm">
                                        <FiShield className="w-4 h-4" /> Admin Dashboard
                                    </Link>
                                )}
                                <hr className="border-ink-ghost" />
                                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream-dark text-sm text-danger w-full">
                                    <FiLogOut className="w-4 h-4" /> Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium border border-ink-ghost rounded-full hover:bg-cream-dark transition-colors">
                                    Sign in
                                </Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium bg-ink text-cream rounded-full hover:bg-ink-light transition-colors">
                                    Get started
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
