// src/lib/appwrite.js
import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';

// Appwrite configuration
const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Your Appwrite Endpoint
    .setProject (import.meta.env.VITE_APPWRITE_PROJECT_ID); // Your project ID from Appwrite console
    

export const account   = new Account(client);
export const databases = new Databases(client);
export const storage   = new Storage(client);

// Database and Collection IDs (you'll create these in Appwrite console)
const DATABASE_ID            = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COUPLES_COLLECTION_ID  = import.meta.env.VITE_APPWRITE_COUPLES_COLLECTION_ID;
const MEMORIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MEMORIES_COLLECTION_ID;
const USERS_COLLECTION_ID    = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const STORAGE_BUCKET_ID      = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID;

// Authentication functions
export const createUserAccount = async (email, password, name) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name);
        const session    = await account.createEmailPasswordSession(email, password);
        const link       = await account.createVerification('https://snaptales-theta.vercel.app/verify')
        
        return {newAccount, session, link};
    } catch (error) {
        throw error;
    }
};

export const deleteAllSession = async () =>{
    try {
        await account.deleteSessions();
    } catch (error) {
        throw error
    }
}

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
        const defaultCoupleId = userId.substring(0,10);
        const document = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            {
                userId           : userId,
                email            : email,
                name             : name,
                coupleId         : defaultCoupleId,
                partnerId        : '',
                bio              : '',
                partnerName      : '',
                relationshipStart: '',
                location         : '',
                anniversary      : '',
                // TODO: do this default url in component don't push it on db
                avatarUrl        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`,
                avatarId         : '',
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
    //TODO: check the code can be optimised also i have used try inside catch fix it
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
                        email : currentUser.email,
                        name  : currentUser.name,
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

export const getMemories = async (userId, coupleId) => {
    try {
        // TODO: when user was not connected he made a memory and then connected to someone old memory get lost
        if(!coupleId?.includes(userId.substring(0,10))) return null
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
        const res = await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
        return { status: 'ok' , res};
    } catch (error) {
        throw error;
    }
};

export { ID, Query };