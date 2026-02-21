import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { format } from 'date-fns';

const ArticleCard = ({ article }) => {
    const { title, slug, excerpt, coverImage, author, keywords, createdAt } = article;

    return (
        <div className="group mb-20 last:mb-0 bg-white/40 border border-ink-ghost/10 hover:border-ink-ghost/30 -mx-4 md:-mx-8 px-6 md:px-10 py-10 md:py-14 rounded-[3rem] transition-all duration-700 hover:shadow-2xl hover:shadow-ink/5 hover:bg-white/60">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
                {/* Image Section - Large & Dramatic */}
                {coverImage && (
                    <Link to={`/article/${slug}`} className="w-full lg:w-1/2 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-ink/5 aspect-[16/10] relative">
                        <img
                            src={`http://localhost:5000${coverImage}`}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-ink/5 group-hover:bg-transparent transition-colors duration-500" />
                    </Link>
                )}

                {/* Content Section - Elegant & Spacious */}
                <div className="flex-1 flex flex-col items-start text-left w-full">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-warm px-3 py-1 bg-accent-warm/5 rounded-full">
                            {keywords?.[0] || 'Journal'}
                        </span>
                        <span className="w-8 h-[1px] bg-ink-ghost" />
                        <span className="text-[11px] font-medium text-ink-muted uppercase tracking-widest">
                            {format(new Date(createdAt), 'MMMM d, yyyy')}
                        </span>
                    </div>

                    <Link to={`/article/${slug}`} className="group/text block mb-6">
                        <h2 className="font-serif text-3xl md:text-5xl lg:text-5xl font-bold leading-[1.1] text-ink group-hover/text:text-accent-warm transition-all duration-500 break-words mb-4">
                            {title}
                        </h2>
                        <p className="text-ink-lighter text-lg md:text-xl leading-relaxed line-clamp-3 font-light tracking-wide max-w-xl">
                            {excerpt?.replace(/&nbsp;/g, ' ')
                                .replace(/&amp;/g, '&')
                                .replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>')
                                .replace(/&quot;/g, '"')
                                .replace(/&#39;/g, "'")}
                        </p>
                    </Link>

                    <div className="flex items-center justify-between w-full pt-6 border-t border-ink-ghost/50 mt-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center overflow-hidden ring-4 ring-cream shadow-lg">
                                {author?.profilePicture ? (
                                    <img src={`http://localhost:5000${author.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold text-cream">{author?.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-ink leading-none">{author?.name}</span>
                                <span className="text-[10px] text-ink-muted uppercase tracking-tighter mt-1 italic">Authorized Author</span>
                            </div>
                        </div>

                        <Link
                            to={`/article/${slug}`}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-ink group/link transition-all"
                        >
                            <span className="border-b-2 border-transparent group-hover/link:border-ink pb-1 transition-all">Read Journal</span>
                            <FiArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
