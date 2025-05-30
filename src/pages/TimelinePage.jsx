import MemoryModal                    from '../components/memories/MemoryModal';
import        { getMemories }         from '../lib/appwrite';
import        { Heart, Plus, Images } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Mock data - replace with actual Appwrite service calls
const mockMemories = [
  {
    id: '1',
    title: 'Our First Date at iskon temple was lovely',
    story: '',
    // story: 'We went to that cozy little café downtown. I was so nervous but you made me feel comfortable instantly. The rain started pouring but we didn\'t care - we just talked for hours.',
    date: '2023-02-14',
    time: '19:00',
    place: 'Downtown Café',
    // coverImage: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&h=300&fit=crop',
    coverImage: '',
    images: [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=200&h=150&fit=crop'
    ],
    createdBy: 'John',
    createdAt: '2023-02-15T10:30:00Z'
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

const Timeline = ({onAddMemory, user, userDetails}) => {
    const [memories      , setMemories]       = useState([]);
    const [loading       , setLoading]        = useState(true);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [showAddForm   , setShowAddForm]    = useState(false);

    useEffect(() => {
        const loadMemory = async ()=>{
            try {
                const memory = await getMemories(user.$id, userDetails.coupleId)
                console.log("Found memory", memory)
                setMemories(memory)
            } catch (error) {
                console.log("error in findig memory", error)
            }
        }

        if(user && userDetails){
            setLoading(true);
            loadMemory();
            setLoading(false);
        }
    }, [user, userDetails]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            'date'  : date.getDate().toString(),
            'month' : date.toLocaleString('en-US', { month: 'short' }),
            'year'  : date.getFullYear(),
        }
    };

    const MemoryCard = ({onClick, memory, index }) => (
        <div 
        key={index}
        className="flex mb-8 last:mb-0">
            {/*Date on Timeline */}
            <div className="flex flex-col items-center mr-4">
                <div className="flex flex-col items-center bg-pink-500 bg-opacity-50 px-2 py-1 rounded-lg">
                    <div className='text-sm font-bold text-pink-100'>{formatDate(memory.memoryDate).month}</div>
                    <div className='text-2xl font-extrabold text-white'>{formatDate(memory.memoryDate).date}</div>
                    <div className='text-sm font-bold text-pink-100'>{formatDate(memory.memoryDate).year}</div>
                </div>
            </div>

            {/* Memory content Card*/}
            <div 
            className="group cursor-pointer flex-1 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            onClick={()=> onClick(memory)}
            >
                {/* Cover image */}
                {memory.coverImageId && <div className="relative h-48 bg-gray-200">
                <img
                    src={`https://fra.cloud.appwrite.io/v1/storage/buckets/683222bc0034ec7db170/files/${memory.coverImageId}/view?project=68321e8700289aad39cc`}
                    alt={memory.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm flex items-center">
                    <Images className="w-4 h-4 mr-1" />
                    {/*TODO: on timeline page how many image is not counting cover */}
                    {memory.imageIds?.length}
                </div>
                </div>}

                {/* Memory details */}
                <div className="p-4">   
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {memory.title}
                </h3>

                {/* Story */}
                <p className="text-gray-700 leading-relaxed">
                    {memory.story && (
                    <span
                        style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        }}
                        className="block"
                        title={memory.story}
                    >
                        {memory.story}
                    </span>
                    )}
                </p>
                </div>
            </div>
        </div>
    );

    const AddMemoryButton = () => (
        <button
        onClick={() => onAddMemory(true)}
        className="fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
            <Plus className="w-6 h-6" />
        </button>
    );

    if (loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your beautiful memories...</p>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-pink-100">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Love Story</h1>
                        <p className="text-gray-600">A timeline of our beautiful memories together</p>
                        <div className="flex items-center justify-center mt-4 text-pink-500">
                            <Heart className="w-5 h-5 mr-2 fill-current" />
                            <span className="font-medium">{memories?.length || 0} Precious Memories</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="max-w-lg mx-auto px-6 py-8">
                {memories?.length === 0 ? (
                <div className="text-center py-16">
                    <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No memories yet</h3>
                    <p className="text-gray-500 mb-6">Start creating your love story by adding your first memory!</p>
                    {/* TODO: on timeline page add first memory is shwing wrong modal remove that add corect one */}
                    <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Add First Memory
                    </button>
                </div>
                ) : (
                <div className="relative">
                    {memories?.map((memory, index) => (
                    <MemoryCard 
                        key={memory.$id}
                        memory={memory} 
                        index={index} 
                        onClick={setSelectedMemory}
                    />
                    ))}
                </div>
                )}
            </div>

            {/* Add memory button */}
            <AddMemoryButton />

            {/* selected memory modal */}
            {selectedMemory && (
                <MemoryModal
                memory={selectedMemory}
                onClose={() => setSelectedMemory(null)}
                />
            )}

            {/* Add memory form would go here */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-xl font-bold mb-4">Add New Memory</h3>
                    <p className="text-gray-600 mb-4">Memory form component would go here...</p>
                    <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors">
                        Save Memory
                    </button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default Timeline;