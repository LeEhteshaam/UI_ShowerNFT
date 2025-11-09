import { auth, googleProvider, db } from './firebase';
import {
	signInWithPopup,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	type User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { currentUser, hasCompletedOnboarding, friendsPhoneNumbers, tutorialCompleted, walletAddress } from './stores';

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
 * Record NFT mint to user's history
 */
export async function recordNFTMint(mintData: {
	tokenId: number;
	txHash: string;
	showerThought: string;
	duration: number;
	walletAddress: string;
}) {
	const user = auth.currentUser;
	if (!user) {
		return { success: false, error: 'No user logged in' };
	}

	try {
		const mintTimestamp = new Date().toISOString();
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

		const nftRecord = {
			tokenId: mintData.tokenId,
			txHash: mintData.txHash,
			showerThought: mintData.showerThought,
			duration: mintData.duration,
			walletAddress: mintData.walletAddress,
			mintedAt: mintTimestamp,
			expiresAt: expiresAt,
			isActive: true
		};

		// Add to nftMints array
		await updateDoc(doc(db, 'users', user.uid), {
			nftMints: arrayUnion(nftRecord),
			lastMintAt: mintTimestamp
		});

		return { success: true, mintRecord: nftRecord };
	} catch (error: any) {
		console.error('Error recording NFT mint:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Get user's NFT mint history
 */
export async function getUserNFTHistory() {
	const user = auth.currentUser;
	if (!user) {
		return { success: false, error: 'No user logged in' };
	}

	try {
		const userDoc = await getDoc(doc(db, 'users', user.uid));
		if (userDoc.exists()) {
			const data = userDoc.data();
			return { success: true, nftMints: data.nftMints || [] };
		}
		return { success: true, nftMints: [] };
	} catch (error: any) {
		console.error('Error fetching NFT history:', error);
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
