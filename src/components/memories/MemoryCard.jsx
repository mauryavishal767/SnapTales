const MemoryCard = ({ memory, onClick }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year : 'numeric',
            month: 'long',
            day  : 'numeric'
        });
    };

    return (
        
        <div 
        className="memory-card cursor-pointer group"
        onClick={() => onClick(memory)}
        >
            {memory.coverImage && (
                <div className="aspect-video overflow-hidden">
                    <img
                    src={memory.coverImage}
                    alt={memory.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}
            
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {memory.title}
                    </h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(memory.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MemoryCard;