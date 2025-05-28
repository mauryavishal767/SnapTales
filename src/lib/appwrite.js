// src/lib/appwrite.js
import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';

// Appwrite configuration
const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Your Appwrite Endpoint
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Your project ID from Appwrite console
    

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and Collection IDs (you'll create these in Appwrite console)
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COUPLES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COUPLES_COLLECTION_ID;
const MEMORIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MEMORIES_COLLECTION_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID;

// Helper functions
export const appwriteConfig = {
    databaseId: DATABASE_ID,
    couplesCollectionId: COUPLES_COLLECTION_ID,
    memoriesCollectionId: MEMORIES_COLLECTION_ID,
    usersCollectionId: USERS_COLLECTION_ID,
    storageId: STORAGE_BUCKET_ID,
};

export const deleteSession = async (sessionID) => {
    const result = await account.deleteSession(sessionID);
    return result;
}


// Authentication functions
export const createUserAccount = async (email, password, name) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name);
        const session = await account.createEmailPasswordSession(email, password);
        const link = await account.createVerification('http://localhost:5173/verify')
        return newAccount;
    } catch (error) {
        throw error;
    }
};

export const signInUser = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        return currentAccount;
    } catch (error) {
        return null;
    }
};

export const signOutUser = async () => {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error) {
        throw error;
    }
};

// Database functions
export const createUserDocument = async (userId, email, name) => {
    try {
        const document = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            {
                userId: userId,
                email: email,
                name: name,
                coupleId: '',
                partnerId: '',
                bio: '',
                partnerName: '',
                relationshipStart: '',
                location: '',
                anniversary: '',
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`,
                avatarId: '',
            },
            [
                Permission.read(Role.user(userId)),
                Permission.write(Role.user(userId)),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
            ]
        );
        return document;
    } catch (error) {
        throw error;
    }
};

export const getUserDocument = async (userId) => {
    try {
        const document = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            []
        );
        return document;
    } catch (error) {
        throw error;
    }
};


export const updateUserDocument = async (userId, data) => {
    try {
        // First, try to get the existing document
        const existingDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId
        );
        
        // If document exists, update it
        return await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            data
        );
    } catch (error) {
        // If document doesn't exist, create it
        if (error.code === 404) {
            try {
                const currentUser = await getCurrentUser();
                return await databases.createDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    userId,
                    {
                        userId: userId,
                        email: currentUser.email,
                        name: currentUser.name,
                        ...data
                    }
                );
            } catch (createError) {
                console.error('Error creating user document:', createError);
                throw createError;
            }
        }
        console.error('Error updating user document:', error);
        throw error;
    }
};

export const createCouple = async (user1Id, user2Email, coupleName) => {
    try {
        const couple = await databases.createDocument(
            DATABASE_ID,
            COUPLES_COLLECTION_ID,
            ID.unique(),
            {
                user1Id,
                user2Email,
                coupleName,
                status: 'pending', // pending, active
                createdAt: new Date().toISOString(),
            }
        );
        return couple;
    } catch (error) {
        throw error;
    }
};

export const createMemory = async (memoryData) => {
    try {
        const memory = await databases.createDocument(
            DATABASE_ID,
            MEMORIES_COLLECTION_ID,
            ID.unique(),
            {
                ...memoryData,
            },
            [
                Permission.read(Role.any()),
                Permission.write(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ]
        );
        return memory;
    } catch (error) {
        throw error;
    }
};

export const getMemories = async (coupleId) => {
    try {
        const memories = await databases.listDocuments(
            DATABASE_ID,
            MEMORIES_COLLECTION_ID,
            [
                Query.equal('coupleId', coupleId),
                Query.orderDesc('memoryDate')
            ]
        );
        return memories.documents;
    } catch (error) {
        throw error;
    }
};

// Storage functions
export const uploadFile = async (file) => {
    try {
        const uploadedFile = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        throw error;
    }
};

export const getFilePreview = (fileId) => {
    return storage.getFilePreview(STORAGE_BUCKET_ID, fileId);
};

export const deleteFile = async (fileId) => {
    try {
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
        return { status: 'ok' };
    } catch (error) {
        throw error;
    }
};

export { ID, Query };