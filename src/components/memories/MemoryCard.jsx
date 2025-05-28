
const MemoryCard = ({ memory, onClick }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
                
                {/* <p className="text-gray-600 line-clamp-3 mb-4">
                    {memory.story}
                </p> */}
                
                {/* {memory.place && (
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {memory.place}
                    </div>
                )} */}
                
                {/* {memory.images && memory.images.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {memory.images.length + 1} photos
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default MemoryCard;