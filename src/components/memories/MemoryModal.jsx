import { useState } from 'react';
import { getFilePreview } from '../../lib/appwrite';
import { Modal } from '../ui/Modal';

const MemoryModal = ({ memory, onClose }) => {
    if(!memory) return null;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get all images (cover + additional)
    const allImages = [];
    if (memory.coverImage) {
        allImages.push(memory.coverImageId);
    }
    if (memory.imageIds && memory.imageIds.length > 0) {
        allImages.push(...memory.imageIds);
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="">
            <div className="space-y-6">
                {/* Image Gallery */}
                {allImages.length > 0 && (
                    <div className="relative">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={`https://fra.cloud.appwrite.io/v1/storage/buckets/683222bc0034ec7db170/files/${allImages[currentImageIndex]}/view?project=68321e8700289aad39cc`}
                                alt={memory.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {allImages.length}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Memory Details */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold font-serif text-gray-900 mb-2">
                            {memory.title}
                        </h1>
                        
                        <div className="flex items-center text-gray-600 space-x-4 text-sm">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(memory.memoryDate)}
                            </div>
                            
                            {memory.place && (
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {memory.place}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Story */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Story</h3>
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {memory.story}
                            </p>
                        </div>
                    </div>

                    {/* Image Thumbnails */}
                    {allImages.length > 1 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {allImages.map((imageId, index) => (
                                    <button
                                        key={imageId}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                            index === currentImageIndex 
                                                ? 'border-primary-500 ring-2 ring-primary-200' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <img
                                            src={`https://fra.cloud.appwrite.io/v1/storage/buckets/683222bc0034ec7db170/files/${imageId}/view?project=68321e8700289aad39cc`}
                                            alt={`Memory ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Information */}
                    <div className="border-t pt-4 text-sm text-gray-500">
                        <p>Added on {formatDate(memory.$createdAt)} at {formatTime(memory.$createdAt)}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default MemoryModal;