import { useState, useEffect } from 'react';
import MemoryCard from './MemoryCard';
import MemoryModal from './MemoryModal';
import  LoadingSpinner  from '../ui/LoadingSpinner';

const Timeline = ({ coupleId }) => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [error, setError] = useState('');

    const mockMemories = [
        {
          id: '1',
          title: 'Our First Date',
          story: 'We went to that cozy little café downtown. I was so nervous but you made me feel comfortable instantly. The rain started pouring but we didn\'t care - we just talked for hours.',
          date: '2025-02-14',
          time: '19:00',
          place: 'Downtown Café',
          coverImage: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=200&h=150&fit=crop',
            'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=200&h=150&fit=crop'
          ],
          createdBy: 'John',
          createdAt: '2025-02-15T10:30:00Z'
        },
        {
          id: '2', 
          title: 'Beach Weekend',
          story: 'Our spontaneous trip to the beach! We built sandcastles, watched the sunset, and made so many beautiful memories. This was when I knew you were special.',
          date: '2023-05-20',
          time: '14:30',
          place: 'Sunset Beach',
          coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=150&fit=crop',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=150&fit=crop',
            'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=200&h=150&fit=crop'
          ],
          createdBy: 'Sarah',
          createdAt: '2023-05-21T09:15:00Z'
        },
        {
          id: '3',
          title: 'Movie Night',
          story: 'Cozy night in watching our favorite movies. We made popcorn, grabbed all the blankets, and just enjoyed each other\'s company. Simple but perfect.',
          date: '2023-08-12',
          time: '20:00', 
          place: 'Our Home',
          coverImage: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=500&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=200&h=150&fit=crop'
          ],
          createdBy: 'John',
          createdAt: '2023-08-13T11:20:00Z'
        }
      ];

    useEffect(() => {
        fetchMemories();
    }, [coupleId]);

    const fetchMemories = async () => {
        try {
            setLoading(true);
            // const fetchedMemories = await getMemories(coupleId);
            setMemories(mockMemories);
        } catch (error) {
            setError('Failed to load memories');
            console.error('Error fetching memories:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupMemoriesByYear = (memories) => {
        return memories.reduce((groups, memory) => {
            const year = new Date(memory.memoryDate).getFullYear();
            if (!groups[year]) {
                groups[year] = [];
            }
            groups[year].push(memory);
            return groups;
        }, {});
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (memories.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Memories Yet</h3>
                    <p className="text-gray-600">Start building your love story by adding your first memory together!</p>
                </div>
            </div>
        );
    }

    const groupedMemories = groupMemoriesByYear(memories);
    const years = Object.keys(groupedMemories).sort((a, b) => b - a);

    return (
        <>
            <div className="relative">
                <div className="timeline-line h-full"></div>
                
                {years.map((year, yearIndex) => (
                    <div key={year} className="relative mb-12">
                        <div className="timeline-dot top-0"></div>
                        <div className="ml-8 md:ml-12">
                            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-6">{year}</h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {groupedMemories[year].map((memory) => (
                                    <MemoryCard
                                        key={memory.$id}
                                        memory={memory}
                                        onClick={setSelectedMemory}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedMemory && (
                <MemoryModal
                    memory={selectedMemory}
                    onClose={() => setSelectedMemory(null)}
                />
            )}
        </>
    );
};

export default Timeline;