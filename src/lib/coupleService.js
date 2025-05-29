import { databases, account }          from './appwrite.js';
import { ID, Query, Permission, Role } from 'appwrite'; 

const DATABASE_ID           = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COUPLES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COUPLES_COLLECTION_ID;
const USERS_COLLECTION_ID   = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

export const updateUserCoupleId = async (userId, coupleId) => {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            {
                coupleId,
            }
        );
    } catch (error) {
        console.error('Error updating user couple ID:', error);
        throw error;
    }
};

// using this
export const connectWithPartner = async (currentUserId, partnerUserId) => {
    try {
        if (partnerUserId === currentUserId) {
            throw new Error('You cannot connect with yourself');
        }

        const currentUserDocs = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            currentUserId
        );

        if (currentUserDocs.coupleId) {
            throw new Error('You are already connected with a partner');
        }

        const partnerUserDocs = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            partnerUserId
        );

        if (partnerUserDocs.coupleId) {
            throw new Error('This user is already connected with someone else');
        }

        const couple = await databases.createDocument(
            DATABASE_ID,
            COUPLES_COLLECTION_ID,
            ID.unique(),
            {
                partner1Id   : currentUserDocs.$id,
                partner1Name : currentUserDocs.name,
                partner1Email: currentUserDocs.email,

                partner2Id   : partnerUserDocs.$id,
                partner2Name : partnerUserDocs.name,
                partner2Email: partnerUserDocs.email,

                coupleName   : `${currentUserDocs.name} & ${partnerUserDocs.name}`,
                isActive     : true,
                connectedBy  : currentUserDocs.$id
            },
            [
                Permission.write(Role.user(currentUserId)),
                Permission.read(Role.user(currentUserId)),
                Permission.update(Role.user(currentUserId)),
                Permission.delete(Role.user(currentUserId)),
            ]
        );

        await Promise.all([
            updateUserCoupleId(currentUserId, couple.$id),
            updateUserCoupleId(partnerUserId, couple.$id)
        ]);

        return couple;
    } catch (error) {
        console.error('Error connecting with partner:', error);
        throw error;
    }
};

export const getCurrentUserCouple = async () => {
    // TODO: check if fewer db calls can be made, by using argument and geting user docs
    try {
        const currentUser = await account.get();

        const userDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            currentUser.$id
        );

        if (!userDoc.coupleId) return null;

        const couple = await databases.getDocument(
            DATABASE_ID,
            COUPLES_COLLECTION_ID,
            userDoc.coupleId
        );

        return couple;
    } catch (error) {
        console.error('Error getting current user couple:', error);
        return null;
    }
};

export const getPartnerInfo = async () => {
    try {
        const couple = await getCurrentUserCouple();
        if (!couple) return null;

        const currentUser = await account.get();
        const isPartner1  = couple.partner1Id === currentUser.$id;
        const partnerId   = isPartner1 ? couple.partner2Id : couple.partner1Id;

        if (!partnerId) return null;

        const partnerDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            partnerId
        );

        return {
            id            : partnerId,
            name          : isPartner1 ? couple.partner2Name  : couple.partner1Name,
            email         : isPartner1 ? couple.partner2Email : couple.partner1Email,
            profilePicture: partnerDoc.profilePicture || null,
            joinedAt      : partnerDoc.connectedAt
        };
    } catch (error) {
        console.error('Error getting partner info:', error);
        return null;
    }
};

// TODO: i think this is never used
export const disconnectFromCouple = async () => {
    try {
        const currentUser = await account.get();
        const couple      = await getCurrentUserCouple();

        if (!couple) {
            throw new Error('You are not connected to any couple');
        }

        await databases.updateDocument(
            DATABASE_ID,
            COUPLES_COLLECTION_ID,
            couple.$id,
            {
                isActive      : false,
                disconnectedAt: new Date().toISOString(),
                disconnectedBy: currentUser.$id
            }
        );

        const updatePromises = [
            updateUserCoupleId(couple.partner1Id, null)
        ];

        if (couple.partner2Id) {
            updatePromises.push(updateUserCoupleId(couple.partner2Id, null));
        }

        await Promise.all(updatePromises);

        return true;
    } catch (error) {
        console.error('Error disconnecting from couple:', error);
        throw error;
    }
};

export const updateCoupleName = async (newName) => {
    try {
        const couple = await getCurrentUserCouple();
        if (!couple) throw new Error('You are not connected to any couple');

        const updatedCouple = await databases.updateDocument(
            DATABASE_ID,
            COUPLES_COLLECTION_ID,
            couple.$id,
            { coupleName: newName }
        );

        return updatedCouple;
    } catch (error) {
        console.error('Error updating couple name:', error);
        throw error;
    }
};