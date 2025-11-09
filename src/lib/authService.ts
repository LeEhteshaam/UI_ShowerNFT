import { auth, googleProvider, db } from './firebase';
import {
	signInWithPopup,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	type User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteField, collection, getDocs } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import {
	currentUser,
	hasCompletedOnboarding,
	friendsPhoneNumbers,
	tutorialCompleted,
	walletAddress
} from './stores';

/**
 * Initialize auth state listener
 */
export function initAuthListener() {
	onAuthStateChanged(auth, async (user) => {
		currentUser.set(user);

		if (user) {
			// Check if user has completed onboarding
			const userDoc = await getDoc(doc(db, 'users', user.uid));
			if (userDoc.exists()) {
				const data = userDoc.data();
				hasCompletedOnboarding.set(data.onboardingComplete || false);
				friendsPhoneNumbers.set(data.friendsPhones || []);
				tutorialCompleted.set(data.tutorialCompleted || false);
				
				// Load wallet address from Firebase if it exists
				if (data.walletAddress) {
					walletAddress.set(data.walletAddress);
				}
			} else {
				// Create new user document
				await setDoc(doc(db, 'users', user.uid), {
					email: user.email,
					displayName: user.displayName,
					photoURL: user.photoURL,
					createdAt: new Date().toISOString(),
					onboardingComplete: false,
					tutorialCompleted: false,
					friendsPhones: [],
					nftMints: [] // Array of NFT mint records
				});
				hasCompletedOnboarding.set(false);
				tutorialCompleted.set(false);
			}
		} else {
			hasCompletedOnboarding.set(false);
			friendsPhoneNumbers.set([]);
			tutorialCompleted.set(false);
			walletAddress.set(null);
		}
	});
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		return { success: true, user: result.user };
	} catch (error: any) {
		console.error('Google Sign-In Error:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Sign out
 */
export async function signOut() {
	try {
		await firebaseSignOut(auth);
		return { success: true };
	} catch (error: any) {
		console.error('Sign Out Error:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Save friend phone numbers and complete onboarding
 */
export async function saveFriendPhoneNumbers(phones: string[]) {
	const user = auth.currentUser;
	if (!user) {
		return { success: false, error: 'No user logged in' };
	}

	try {
		await updateDoc(doc(db, 'users', user.uid), {
			friendsPhones: phones,
			onboardingComplete: true,
			onboardingCompletedAt: new Date().toISOString()
		});

		hasCompletedOnboarding.set(true);
		friendsPhoneNumbers.set(phones);

		return { success: true };
	} catch (error: any) {
		console.error('Error saving phone numbers:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Mark tutorial as completed
 */
export async function completeTutorial() {
	const user = auth.currentUser;
	if (!user) {
		return { success: false, error: 'No user logged in' };
	}

	try {
		await updateDoc(doc(db, 'users', user.uid), {
			tutorialCompleted: true,
			tutorialCompletedAt: new Date().toISOString()
		});

		tutorialCompleted.set(true);

		return { success: true };
	} catch (error: any) {
		console.error('Error saving tutorial completion:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Save/update wallet address
 */
export async function saveWalletAddress(address: string) {
	const user = auth.currentUser;
	if (!user) {
		return { success: false, error: 'No user logged in' };
	}

	try {
		await updateDoc(doc(db, 'users', user.uid), {
			walletAddress: address,
			walletConnectedAt: new Date().toISOString()
		});

		return { success: true };
	} catch (error: any) {
		console.error('Error saving wallet address:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Record latest NFT mint (overwrites previous)
 * Only stores the most recent NFT - old ones should be burned!
 */
export async function recordNFTMint(mintData: {
	tokenId: number;
	txHash: string;
	showerThought: string;
	imageUrl?: string;
	duration: number;
	walletAddress: string;
	customTimeout?: number;
}) {
	const user = auth.currentUser;
	if (!user) {
		return { success: false, error: 'No user logged in' };
	}

	try {
		const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
		const customTimeout = mintData.customTimeout || 86400; // Default 24hr
		const expiresAt = now + customTimeout;

		const nftRecord = {
			tokenId: mintData.tokenId,
			txHash: mintData.txHash,
			showerThought: mintData.showerThought || '',
			imageUrl: mintData.imageUrl || '',
			duration: mintData.duration,
			walletAddress: mintData.walletAddress,
			mintTime: now, // Unix timestamp (seconds)
			customTimeout: customTimeout, // Timeout in seconds
			expiresAt: expiresAt, // Unix timestamp (seconds)
			isActive: true,
			createdAt: new Date().toISOString()
		};

		// Store latest NFT directly in user document (replaces previous)
		await updateDoc(doc(db, 'users', user.uid), {
			latestNFT: nftRecord,
			lastMintAt: new Date().toISOString()
		});

		console.log('✅ Latest NFT recorded to Firestore:', nftRecord);

		return { success: true, mintRecord: nftRecord };
	} catch (error: any) {
		console.error('Error recording NFT mint:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Get user's latest NFT (returns null if stinky!)
 */
export async function getLatestNFT() {
	const user = auth.currentUser;
	if (!user) {
		return { success: false, error: 'No user logged in' };
	}

	try {
		const userDoc = await getDoc(doc(db, 'users', user.uid));
		if (userDoc.exists()) {
			const data = userDoc.data();
			return { success: true, latestNFT: data.latestNFT || null };
		}
		return { success: true, latestNFT: null };
	} catch (error: any) {
		console.error('Error fetching latest NFT:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Upload image to Firebase Storage (client-side with auth)
 */
export async function uploadShowerImage(imageDataUrl: string, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
	try {
		if (!imageDataUrl || !userId) {
			return { success: false, error: 'Missing imageDataUrl or userId' };
		}

		// Create unique filename with timestamp
		const timestamp = Date.now();
		const filename = `shower-selfies/${userId}/${timestamp}.jpg`;

		// Create storage reference
		const storageRef = ref(storage, filename);

		// Upload base64 image (client-side with user's auth token)
		await uploadString(storageRef, imageDataUrl, 'data_url');

		// Get download URL
		const downloadURL = await getDownloadURL(storageRef);

		return { success: true, url: downloadURL };
	} catch (error: any) {
		console.error('Image upload error:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Delete expired NFT and its image from Firebase
 */
export async function deleteExpiredNFT(imageUrl?: string) {
	const user = auth.currentUser;
	if (!user) {
		return { success: false, error: 'No user logged in' };
	}

	try {
		// Delete image from Storage if URL provided
		if (imageUrl) {
			try {
				// Extract storage path from URL
				// URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?token=...
				const pathMatch = imageUrl.match(/o\/(.+?)\?/);
				if (pathMatch) {
					const storagePath = decodeURIComponent(pathMatch[1]);
					const imageRef = ref(storage, storagePath);
					await deleteObject(imageRef);
					console.log('✅ Deleted expired NFT image from Storage:', storagePath);
				}
			} catch (storageError) {
				console.error('⚠️ Failed to delete image from Storage:', storageError);
				// Continue anyway - don't fail the whole operation
			}
		}

		// Delete latestNFT from Firestore
		await updateDoc(doc(db, 'users', user.uid), {
			latestNFT: deleteField()
		});

		console.log('✅ Deleted expired NFT from Firestore');
		return { success: true };
	} catch (error: any) {
		console.error('❌ Error deleting expired NFT:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Get user's friend phone numbers
 */
export async function getUserFriendPhones() {
	const user = auth.currentUser;
	if (!user) {
		return { success: false, error: 'No user logged in' };
	}

	try {
		const userDoc = await getDoc(doc(db, 'users', user.uid));
		if (userDoc.exists()) {
			const data = userDoc.data();
			return { success: true, phones: data.friendsPhones || [] };
		}
		return { success: true, phones: [] };
	} catch (error: any) {
		console.error('Error fetching friend phones:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Send SMS notifications to friends when NFT expires
 */
export async function sendExpiryNotifications(userName: string, friendPhones: string[]) {
	if (!friendPhones || friendPhones.length === 0) {
		console.log('ℹ️ No friends to notify');
		return { success: true, sent: 0 };
	}

	const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
	const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
	const fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

	if (!accountSid || !authToken || !fromNumber) {
		console.error('❌ Twilio credentials not configured');
		return { success: false, error: 'Twilio not configured' };
	}

	const message = `🚿 ALERT: ${userName} is now officially STINKY! Their Proof-of-Lather NFT has expired. Shame them into showering! - The Groom Protocol`;

	let successCount = 0;
	let errors: string[] = [];

	for (const phoneNumber of friendPhones) {
		try {
			// Use Twilio REST API
			const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					To: phoneNumber,
					From: fromNumber,
					Body: message,
				}),
			});

			if (response.ok) {
				successCount++;
				console.log(`✅ SMS sent to ${phoneNumber}`);
			} else {
				const error = await response.text();
				errors.push(`${phoneNumber}: ${error}`);
				console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error);
			}
		} catch (error: any) {
			errors.push(`${phoneNumber}: ${error.message}`);
			console.error(`❌ Error sending SMS to ${phoneNumber}:`, error);
		}
	}

	return {
		success: successCount > 0,
		sent: successCount,
		errors: errors.length > 0 ? errors : undefined,
	};
}

/**
 * Get all users with their latest NFT status (for user discovery page)
 */
export async function getAllUsers() {
	try {
		const usersSnapshot = await getDocs(collection(db, 'users'));
		const users = usersSnapshot.docs.map(doc => ({
			uid: doc.id,
			...doc.data()
		}));

		console.log(`✅ Loaded ${users.length} total users`);
		return { success: true, users };
	} catch (error: any) {
		console.error('Error fetching all users:', error);
		return { success: false, error: error.message };
	}
}

