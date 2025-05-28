import React, { useState, useEffect } from 'react';
import Header from './Header';
import MemoryForm from '../memories/MemoryForm';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { createUserDocument, getUserDocument } from '../../lib/appwrite';

const Layout = ({ children, onNavigate, showAddMemory, setShowAddMemory }) => {
    const {user,setUser} = useAuth();
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const loadUserDetails = async () => {
            console.log("LAYOUT loding profile of",user)
            if (user) {
                try {
                    const userDocs = await getUserDocument(user.$id);
                    setUserDetails(userDocs);
                    console.log("LAYOUT user docs", userDocs)
                } catch (error) {
                    console.log(error);
                    try {
                        const newUserDoc = await createUserDocument(user.$id, user.email, user.name);
                        setUserDetails(newUserDoc);
                        console.log("LAYOUT new docs", newUserDoc)
                    } catch (err) {
                        console.log("LAYOUT ",err)
                    }
                }
            }
        };

        loadUserDetails();
    }, []);
    

    const handleMemoryAdded = (newMemory) => {
        console.log('New memory added:', newMemory);
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <Header 
                onNavigate={onNavigate}
            />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children && React.cloneElement(children, { user, userDetails })}
            </main>

            {/* Add Memory Modal */}
            {showAddMemory && (
                <Modal
                    isOpen={showAddMemory}
                    onClose={() => setShowAddMemory(false)}
                    title="Add New Memory"
                >
                    <MemoryForm
                        onMemoryAdded={handleMemoryAdded}
                        onClose={() => setShowAddMemory(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default Layout;