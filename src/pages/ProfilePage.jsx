// src/pages/ProfilePage.js
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import { Button }              from '../components/ui/Button';
import { Input }               from '../components/ui/Input';
import { User, Heart, Calendar, ArrowLeft, Camera, Edit3, Save, X, Plus } from 'lucide-react';
import { updateUserDocument, uploadFile, deleteFile, getCurrentUser, getUserDocument, createUserDocument } from '../lib/appwrite';

const ProfilePage = () => {
    const navigate                              = useNavigate();
    const { user          , setUser }           = useAuth();
    const [loading        , setLoading]         = useState(false);
    const [editing        , setEditing]         = useState(false);
    const [error          , setError]           = useState('');
    const [success        , setSuccess]         = useState('');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [profile        , setProfile]         = useState({
        name: '',
        email: '',
        bio: '',
        partnerName: '',
        relationshipStart: '',
        location: '',
        anniversary: '',
        avatarUrl: '',
        avatarId: ''
    });

    useEffect(() => {
        const loadUserProfile = async () => {
            console.log("loding profile of",user)
            if (user) {
                try {
                    const userDocs = await getUserDocument(user.$id);
                    setProfile(userDocs);
                    console.log("user docs", userDocs)
                } catch (error) {
                    console.log(error);
                    try {
                        const newUserDoc = await createUserDocument(user.$id, user.email, user.name);
                        setProfile(newUserDoc);
                        console.log("new docs", newUserDoc)
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        };

        loadUserProfile();
    }, []);

    const handleInputChange = (field, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // TODO: dekhna esa hai bhi ki nhi ya mere browser me problem thi,
    // loook into avatar, after geting new upload it sets to previous avatr before saving the data
    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        setUploadingAvatar(true);
        setError('');

        try {
            // Delete old avatar if exists
            if (profile.avatarId) {
                await deleteFile(profile.avatarId);
                console.log('deleted prev pic')
            }

            // Upload new avatar
            const uploadedFile = await uploadFile(file);
            const avatarUrl = `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
            
            setProfile(prev => ({
                ...prev,
                avatarUrl: avatarUrl,
                avatarId: uploadedFile.$id
            }));

            setSuccess('Avatar updated successfully!');
        } catch (error) {
            setError('Failed to upload avatar. Please try again.');
            console.error('Avatar upload error:', error);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log(profile.avatarUrl)
            console.log(profile.avatarId)
            const updatedUser = await updateUserDocument(user.$id, {
                name: profile.name,
                bio: profile.bio,
                partnerName: profile.partnerName,
                relationshipStart: profile.relationshipStart,
                location: profile.location,
                anniversary: profile.anniversary,
                avatarUrl: profile.avatarUrl,
                avatarId: profile.avatarId
            });

            // Refresh user data
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            
            setEditing(false);
            setSuccess('Profile updated successfully!');
        } catch (error) {
            setError('Failed to update profile. Please try again.');
            console.error('Profile update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset to original values
        if (user) {
            setProfile({
                name             : user.name              || '',
                email            : user.email             || '',
                bio              : user.bio               || '',
                partnerName      : user.partnerName       || '',
                relationshipStart: user.relationshipStart || '',
                location         : user.location          || '',
                anniversary      : user.anniversary       || '',
                avatarUrl        : user.avatarUrl         || '',
                avatarId         : user.avatarId          || ''
            });
        }
        setEditing(false);
        setError('');
        setSuccess('');
    };

    const calculateRelationshipDuration = () => {
        if (!profile.relationshipStart) return '';
        
        const startDate = new Date(profile.relationshipStart);
        const today     = new Date();
        const diffTime  = Math.abs(today - startDate);
        const diffDays  = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const years  = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        const days   = diffDays % 30;
        
        let duration = '';
        if (years  > 0) duration += `${years}  year${years > 1 ? 's' : ''}, `;
        if (months > 0) duration += `${months} month${months > 1 ? 's' : ''}, `;
        duration += `${days} day${days > 1 ? 's' : ''}`;
        
        return duration;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            <button
                                type="button"
                                onClick={()=>{navigate('timeline')}}
                                className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium mr-3"
                                aria-label="Back"
                            >
                                <ArrowLeft/>
                            </button>
                            Profile Settings
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your account and relationship details</p>
                    </div>
                    
                    <div className="flex self-end gap-3">
                        {editing ? (
                            <>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    loading={loading}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl p-6 text-center">
                            {/* Avatar */}
                            <div className="relative inline-block mb-4">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center overflow-hidden">
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-white" />
                                    )}
                                </div>
                                
                                {editing && (
                                    <div className="absolute -bottom-2 -right-2">
                                        <label htmlFor="avatar-upload" className="cursor-pointer">
                                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                                                {uploadingAvatar ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                ) : (
                                                    <Camera className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            disabled={uploadingAvatar}
                                        />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile.name}</h2>
                            <p className="text-gray-600 mb-4">{profile.email}</p>
                            
                            {profile.bio && (
                                <p className="text-gray-700 text-sm italic mb-4">"{profile.bio}"</p>
                            )}

                            <div className="mb-4"
                                onClick={() => navigate('/connection')}
                            >
                                {/* TODO: after 2 users are conencted its dhould not show connect to partner, in profile   */}
                                <a
                                    href="#connection"
                                    className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200"
                                >
                                    Connect to Partner
                                </a>
                            </div>

                            {/* TODO: look into profilr->relationship detail */}
                            {/* Relationship Stats */}
                            {profile.relationshipStart && (
                                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 mb-4">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        <span className="text-sm font-medium text-gray-700">Together for</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-800">{calculateRelationshipDuration()}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2">
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    value={profile.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    disabled={!editing}
                                    placeholder="Enter your full name"
                                />

                                <Input
                                    label="Email"
                                    value={profile.email}
                                    disabled={true}
                                    placeholder="Email cannot be changed"
                                />

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        disabled={!editing}
                                        placeholder="Tell us a bit about yourself..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Relationship Information */}
                        <div className="glass-card rounded-2xl p-6 mt-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-red-500" />
                                Relationship Details
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Partner's Name"
                                    value={profile.partnerName}
                                    onChange={(e) => handleInputChange('partnerName', e.target.value)}
                                    disabled={!editing}
                                    placeholder="Your partner's name"
                                />

                                <Input
                                    label="Relationship Started"
                                    type="date"
                                    value={profile.relationshipStart}
                                    onChange={(e) => handleInputChange('relationshipStart', e.target.value)}
                                    disabled={!editing}
                                />

                                <Input
                                    label="Anniversary Date"
                                    type="date"
                                    value={profile.anniversary}
                                    onChange={(e) => handleInputChange('anniversary', e.target.value)}
                                    disabled={!editing}
                                />

                                <Input
                                    label="Location"
                                    value={profile.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    disabled={!editing}
                                    placeholder="Where are you based?"
                                />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="glass-card rounded-2xl p-6 mt-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button
                                    onClick={() => navigate('/timeline')}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    View Timeline
                                </Button>
                                
                                <Button
                                    // TODO: add memory buton not working in profile section
                                    // TODO: add addmemory 
                                    onClick={() => {}}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Memory
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;