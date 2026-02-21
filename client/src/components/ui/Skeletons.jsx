const ArticleCardSkeleton = () => (
    <div className="mb-20 last:mb-0 flex flex-col lg:flex-row gap-12 items-center">
        <div className="skeleton w-full lg:w-1/2 aspect-[16/10] rounded-[2.5rem]" />
        <div className="flex-1 w-full space-y-6">
            <div className="flex items-center gap-4">
                <div className="skeleton h-4 w-20 rounded-full" />
                <div className="skeleton h-[1px] w-8" />
                <div className="skeleton h-3 w-32" />
            </div>
            <div className="space-y-3">
                <div className="skeleton h-12 w-3/4" />
                <div className="skeleton h-12 w-1/2" />
            </div>
            <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-ink-ghost/30">
                <div className="flex items-center gap-3">
                    <div className="skeleton w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                        <div className="skeleton h-3 w-24" />
                        <div className="skeleton h-2 w-16" />
                    </div>
                </div>
                <div className="skeleton h-4 w-24" />
            </div>
        </div>
    </div>
);

const ArticleDetailSkeleton = () => (
    <div className="max-w-3xl mx-auto px-4 pt-24">
        <div className="skeleton h-8 w-3/4 mb-4" />
        <div className="skeleton h-6 w-1/2 mb-6" />
        <div className="flex items-center gap-3 mb-8">
            <div className="skeleton w-12 h-12 rounded-full" />
            <div>
                <div className="skeleton h-4 w-32 mb-2" />
                <div className="skeleton h-3 w-24" />
            </div>
        </div>
        <div className="skeleton h-72 w-full rounded-2xl mb-8" />
        <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-4 w-full" />
            ))}
            <div className="skeleton h-4 w-2/3" />
        </div>
    </div>
);

const ProfileSkeleton = () => (
    <div className="max-w-4xl mx-auto px-4 pt-24">
        <div className="flex items-center gap-6 mb-8">
            <div className="skeleton w-24 h-24 rounded-full" />
            <div>
                <div className="skeleton h-7 w-48 mb-2" />
                <div className="skeleton h-4 w-64 mb-2" />
                <div className="skeleton h-3 w-32" />
            </div>
        </div>
        <div className="flex flex-col">
            {[...Array(3)].map((_, i) => (
                <ArticleCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

export { ArticleCardSkeleton, ArticleDetailSkeleton, ProfileSkeleton };
