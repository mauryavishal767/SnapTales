import { databases, account } from './appwrite.js';
import { ID, Query, Permission, Role } from 'appwrite'; 

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COUPLES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COUPLES_COLLECTION_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

export const generateCoupleCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

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

        const coupleCode = generateCoupleCode();
        const couple = await databases.createDocument(
            DATABASE_ID,
            COUPLES_COLLECTION_ID,
            ID.unique(),
            {
                partner1Id: currentUserDocs.$id,
                partner1Name: currentUserDocs.name,
                partner1Email: currentUserDocs.email,

                partner2Id: partnerUserDocs.$id,
                partner2Name: partnerUserDocs.name,
                partner2Email: partnerUserDocs.email,

                coupleName: `${currentUserDocs.name} & ${partnerUserDocs.name}`,
                isActive: true,
                connectedBy: currentUserDocs.$id
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

export const createCouple = async () => {
    try {
        const currentUser = await account.get();

        const currentUserDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            currentUser.$id
        );

        if (currentUserDoc.coupleId) {
            throw new Error('You are already connected with a partner');
        }

        const coupleCode = generateCoupleCode();
        const couple = await databases.createDocument(
            DATABASE_ID,
            COUPLES_COLLECTION_ID,
            ID.unique(),
            {
                coupleCode,
                partner1Id: currentUser.$id,
                partner1Name: currentUser.name,
                partner1Email: currentUser.email,
                partner2Id: null,
                partner2Name: null,
                partner2Email: null,
                coupleName: `${currentUser.name}'s Couple`,
                createdAt: new Date().toISOString(),
                isActive: true,
                connectedBy: currentUser.$id
            }
        );

        await updateUserCoupleId(currentUser.$id, couple.$id);

        return couple;
    } catch (error) {
        console.error('Error creating couple:', error);
        throw error;
    }
};

export const getCurrentUserCouple = async () => {
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
        const isPartner1 = couple.partner1Id === currentUser.$id;
        const partnerId = isPartner1 ? couple.partner2Id : couple.partner1Id;

        if (!partnerId) return null;

        const partnerDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            partnerId
        );

        return {
            id: partnerId,
            name: isPartner1 ? couple.partner2Name : couple.partner1Name,
            email: isPartner1 ? couple.partner2Email : couple.partner1Email,
            profilePicture: partnerDoc.profilePicture || null,
            joinedAt: partnerDoc.connectedAt
        };
    } catch (error) {
        console.error('Error getting partner info:', error);
        return null;
    }
};

export const disconnectFromCouple = async () => {
    try {
        const currentUser = await account.get();
        const couple = await getCurrentUserCouple();

        if (!couple) {
            throw new Error('You are not connected to any couple');
        }

        await databases.updateDocument(
            DATABASE_ID,
            COUPLES_COLLECTION_ID,
            couple.$id,
            {
                isActive: false,
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





// export class CoupleService {
    
//     // Generate a unique couple ID (6-digit code for easy sharing)
//     generateCoupleCode() {
//         return Math.random().toString(36).substring(2, 8).toUpperCase();
//     }

//     // Connect to partner using their user ID
//     async connectWithPartner(partnerUserId) {
//         try {
//             const currentUser = await account.get();
            
//             // Check if current user is already connected
//             const currentUserDoc = await databases.getDocument(
//                 DATABASE_ID,
//                 USERS_COLLECTION_ID,
//                 currentUser.$id
//             );

//             if (currentUserDoc.coupleId) {
//                 throw new Error('You are already connected with a partner');
//             }

//             // Check if partner exists
//             let partnerUser;
//             try {
//                 partnerUser = await databases.getDocument(
//                     DATABASE_ID,
//                     USERS_COLLECTION_ID,
//                     partnerUserId
//                 );
//             } catch (error) {
//                 throw new Error('Partner not found. Please check the User ID.');
//             }

//             if (partnerUser.$id === currentUser.$id) {
//                 throw new Error('You cannot connect with yourself');
//             }

//             if (partnerUser.coupleId) {
//                 throw new Error('This user is already connected with someone else');
//             }

//             // Create couple document
//             const coupleCode = this.generateCoupleCode();
//             const couple = await databases.createDocument(
//                 DATABASE_ID,
//                 COUPLES_COLLECTION_ID,
//                 ID.unique(),
//                 {
//                     coupleCode: coupleCode,
//                     partner1Id: currentUser.$id,
//                     partner1Name: currentUser.name,
//                     partner1Email: currentUser.email,
//                     partner2Id: partnerUser.$id,
//                     partner2Name: partnerUser.name,
//                     partner2Email: partnerUser.email,
//                     coupleName: `${currentUser.name} & ${partnerUser.name}`,
//                     createdAt: new Date().toISOString(),
//                     isActive: true,
//                     connectedBy: currentUser.$id
//                 },
//                 [
//                     Permission.read(Role.user(currentUser.$id)),
//                     Permission.read(Role.user(partnerUser.$id)),
//                     Permission.write(Role.user(currentUser.$id)),
//                     Permission.write(Role.user(partnerUser.$id)),
//                     Permission.update(Role.user(currentUser.$id)),
//                     Permission.update(Role.user(partnerUser.$id)),
//                     Permission.delete(Role.user(currentUser.$id)),
//                     Permission.delete(Role.user(partnerUser.$id))
//                 ]
//             );

//             // Update both users with couple ID
//             await Promise.all([
//                 this.updateUserCoupleId(currentUser.$id, couple.$id),
//                 this.updateUserCoupleId(partnerUser.$id, couple.$id)
//             ]);

//             return couple;
//         } catch (error) {
//             console.error('Error connecting with partner:', error);
//             throw error;
//         }
//     }

//     // Alternative: Connect using a shareable couple code instead of user ID
//     // async connectWithCoupleCode(coupleCode) {
//     //     try {
//     //         const currentUser = await account.get();
            
//     //         // Check if current user is already connected
//     //         const currentUserDoc = await databases.getDocument(
//     //             DATABASE_ID,
//     //             USERS_COLLECTION_ID,
//     //             currentUser.$id
//     //         );

//     //         if (currentUserDoc.coupleId) {
//     //             throw new Error('You are already connected with a partner');
//     //         }

//     //         // Find couple by code
//     //         const couples = await databases.listDocuments(
//     //             DATABASE_ID,
//     //             COUPLES_COLLECTION_ID,
//     //             [
//     //                 Query.equal('coupleCode', coupleCode.toUpperCase()),
//     //                 Query.equal('isActive', true)
//     //             ]
//     //         );

//     //         if (couples.documents.length === 0) {
//     //             throw new Error('Invalid couple code');
//     //         }

//     //         const couple = couples.documents[0];

//     //         // Check if user is trying to join their own couple
//     //         if (couple.partner1Id === currentUser.$id || couple.partner2Id === currentUser.$id) {
//     //             throw new Error('You cannot join your own couple code');
//     //         }

//     //         // Check if couple already has 2 members
//     //         if (couple.partner1Id && couple.partner2Id) {
//     //             throw new Error('This couple is already complete');
//     //         }

//     //         // Add current user as partner2 (assuming partner1 created the code)
//     //         const updatedCouple = await databases.updateDocument(
//     //             DATABASE_ID,
//     //             COUPLES_COLLECTION_ID,
//     //             couple.$id,
//     //             {
//     //                 partner2Id: currentUser.$id,
//     //                 partner2Name: currentUser.name,
//     //                 partner2Email: currentUser.email,
//     //                 coupleName: `${couple.partner1Name} & ${currentUser.name}`,
//     //                 completedAt: new Date().toISOString()
//     //             }
//     //         );

//     //         // Update current user with couple ID
//     //         await this.updateUserCoupleId(currentUser.$id, couple.$id);

//     //         return updatedCouple;
//     //     } catch (error) {
//     //         console.error('Error connecting with couple code:', error);
//     //         throw error;
//     //     }
//     // }

//     // Create a new couple (generates a shareable code)
//     async createCouple() {
//         try {
//             const currentUser = await account.get();
            
//             // Check if user is already in a couple
//             const currentUserDoc = await databases.getDocument(
//                 DATABASE_ID,
//                 USERS_COLLECTION_ID,
//                 currentUser.$id
//             );

//             if (currentUserDoc.coupleId) {
//                 throw new Error('You are already connected with a partner');
//             }

//             // Create couple document with only current user
//             const coupleCode = this.generateCoupleCode();
//             const couple = await databases.createDocument(
//                 DATABASE_ID,
//                 COUPLES_COLLECTION_ID,
//                 ID.unique(),
//                 {
//                     coupleCode: coupleCode,
//                     partner1Id: currentUser.$id,
//                     partner1Name: currentUser.name,
//                     partner1Email: currentUser.email,
//                     partner2Id: null,
//                     partner2Name: null,
//                     partner2Email: null,
//                     coupleName: `${currentUser.name}'s Couple`,
//                     createdAt: new Date().toISOString(),
//                     isActive: true,
//                     connectedBy: currentUser.$id
//                 }
//             );

//             // Update user with couple ID
//             await this.updateUserCoupleId(currentUser.$id, couple.$id);

//             return couple;
//         } catch (error) {
//             console.error('Error creating couple:', error);
//             throw error;
//         }
//     }

//     // Update user's couple ID
//     async updateUserCoupleId(userId, coupleId) {
//         try {
//             await databases.updateDocument(
//                 DATABASE_ID,
//                 USERS_COLLECTION_ID,
//                 userId,
//                 {
//                     coupleId: coupleId,
//                     connectedAt: coupleId ? new Date().toISOString() : null
//                 }
//             );
//         } catch (error) {
//             console.error('Error updating user couple ID:', error);
//             throw error;
//         }
//     }

//     // Get current user's couple
//     async getCurrentUserCouple() {
//         try {
//             const currentUser = await account.get();
            
//             // Get user document to find couple ID
//             const userDoc = await databases.getDocument(
//                 DATABASE_ID,
//                 USERS_COLLECTION_ID,
//                 currentUser.$id
//             );

//             if (!userDoc.coupleId) {
//                 return null;
//             }

//             // Get couple document
//             const couple = await databases.getDocument(
//                 DATABASE_ID,
//                 COUPLES_COLLECTION_ID,
//                 userDoc.coupleId
//             );

//             return couple;
//         } catch (error) {
//             console.error('Error getting current user couple:', error);
//             return null;
//         }
//     }

//     // Get partner info
//     async getPartnerInfo() {
//         try {
//             const couple = await this.getCurrentUserCouple();
//             if (!couple) return null;

//             const currentUser = await account.get();
            
//             // Determine which partner is the current user
//             const isPartner1 = couple.partner1Id === currentUser.$id;
//             const partnerId = isPartner1 ? couple.partner2Id : couple.partner1Id;
            
//             if (!partnerId) {
//                 return null; // Partner hasn't joined yet
//             }

//             // Get partner's user document for additional info
//             const partnerDoc = await databases.getDocument(
//                 DATABASE_ID,
//                 USERS_COLLECTION_ID,
//                 partnerId
//             );

//             return {
//                 id: partnerId,
//                 name: isPartner1 ? couple.partner2Name : couple.partner1Name,
//                 email: isPartner1 ? couple.partner2Email : couple.partner1Email,
//                 profilePicture: partnerDoc.profilePicture || null,
//                 joinedAt: partnerDoc.connectedAt
//             };
//         } catch (error) {
//             console.error('Error getting partner info:', error);
//             return null;
//         }
//     }

//     // Disconnect from couple
//     async disconnectFromCouple() {
//         try {
//             const currentUser = await account.get();
//             const couple = await this.getCurrentUserCouple();
            
//             if (!couple) {
//                 throw new Error('You are not connected to any couple');
//             }

//             // Mark couple as inactive
//             await databases.updateDocument(
//                 DATABASE_ID,
//                 COUPLES_COLLECTION_ID,
//                 couple.$id,
//                 {
//                     isActive: false,
//                     disconnectedAt: new Date().toISOString(),
//                     disconnectedBy: currentUser.$id
//                 }
//             );

//             // Remove couple ID from both users
//             const partner1Id = couple.partner1Id;
//             const partner2Id = couple.partner2Id;
            
//             const updatePromises = [
//                 this.updateUserCoupleId(partner1Id, null)
//             ];
            
//             if (partner2Id) {
//                 updatePromises.push(this.updateUserCoupleId(partner2Id, null));
//             }
            
//             await Promise.all(updatePromises);

//             return true;
//         } catch (error) {
//             console.error('Error disconnecting from couple:', error);
//             throw error;
//         }
//     }

//     // Update couple name
//     async updateCoupleName(newName) {
//         try {
//             const couple = await this.getCurrentUserCouple();
//             if (!couple) {
//                 throw new Error('You are not connected to any couple');
//             }

//             const updatedCouple = await databases.updateDocument(
//                 DATABASE_ID,
//                 COUPLES_COLLECTION_ID,
//                 couple.$id,
//                 {
//                     coupleName: newName
//                 }
//             );

//             return updatedCouple;
//         } catch (error) {
//             console.error('Error updating couple name:', error);
//             throw error;
//         }
//     }
// }