import { Button }                                    from '../ui/Button';
import { Input }                                     from '../ui/Input';
import { useAuth }                                   from '../../context/AuthContext';
import { useEffect   , useState }                    from 'react';
import { createMemory, getUserDocument, uploadFile } from '../../lib/appwrite';

const MemoryForm = ({ onMemoryAdded, onClose }) => {
    const { user           , setUser }            = useAuth();
    const [userDocs        , setUserDocs]         = useState({});
    const [coverImage      , setCoverImage]       = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [loading         , setLoading]          = useState(false);
    const [error           , setError]            = useState('');
    const [form            , setForm]             = useState({
        title     : '',
        story     : '',
        memoryDate: '',
        place     : ''
    });

    useEffect(() => {
        const loadUserDocs = async () => {
            console.log("MEMORY FORM loding profile of",user)
            if (user) {
                try {
                    const docs = await getUserDocument(user.$id);
                    setUserDocs(docs);
                    console.log("MEMORY FORM user docs", docs)
                } catch (error) {
                    console.log(error);
                }
            }
        };
    
        loadUserDocs();
    }, [])
    
    const handleImageUpload = async (files, isCover = false) => {
        const uploadedFiles = [];
        console.log("uploading files")
        for (let file of files) {
            try {
                console.log("uploaading this file : ", file)
                const uploaded = await uploadFile(file);
                uploadedFiles.push(uploaded.$id);
                console.log("uploaded");
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }
        
        return uploadedFiles;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let coverImageId = null;
            let imageIds = [];

            // Upload cover image
            if (coverImage) {
                const [coverId] = await handleImageUpload([coverImage], true);
                coverImageId = coverId;
            }

            // Upload additional images
            if (additionalImages.length > 0) {
                imageIds = await handleImageUpload(Array.from(additionalImages));
            }

            // Create memory
            const memoryData = {
                ...form,
                coverImageId,
                imageIds,
                coupleId: userDocs?.coupleId || "", // This should come from user context
                createdById: user.$id // This should come from auth context
            };

            const newMemory = await createMemory(memoryData);
            
            if (newMemory) {
                onMemoryAdded(newMemory);
                onClose();
            }
        } catch (error) {
            setError(error.message || 'Failed to create memory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Memory Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What would you like to call this memory?"
                required
            />

            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                    Tell Your Story <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={form.story}
                    onChange={(e) => setForm({ ...form, story: e.target.value })}
                    placeholder="Share the story behind this memory..."
                    required
                    rows={4}
                    className="input-field resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Date"
                    type="date"
                    value={form.memoryDate}
                    onChange={(e) => setForm({ ...form, memoryDate: e.target.value })}
                    required
                />

                <Input
                    label="Place"
                    value={form.place}
                    onChange={(e) => setForm({ ...form, place: e.target.value })}
                    placeholder="Where did this happen?"
                />
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverImage(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Images
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setAdditionalImages(e.target.files)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary-50 file:text-secondary-700 hover:file:bg-secondary-100"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    loading={loading}
                    className="flex-1"
                >
                    Save Memory
                </Button>
            </div>
        </form>
    );
};

export default MemoryForm;