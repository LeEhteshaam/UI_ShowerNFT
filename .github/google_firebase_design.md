# Firebase Backend Design - ShowerNFT

## Overview

ShowerNFT uses Firebase for authentication, user data storage, and NFT mint history tracking. This document details the implementation architecture.

## Services Used

### 1. Firebase Authentication

- **Provider**: Google Sign-In (OAuth)
- **Purpose**: User authentication and account creation
- **Flow**:
  1. User clicks "Sign in with Google"
  2. Google OAuth popup
  3. Firebase creates/retrieves user account
  4. User UID generated (unique identifier)

### 2. Firestore Database

- **Type**: NoSQL document database
- **Purpose**: Store user profiles, NFT history, friend phone numbers
- **Mode**: Test mode (development), production rules needed before launch

## Database Schema

### Collection: `users`

**Document ID**: Firebase Auth UID (auto-generated)

```typescript
{
  // Basic User Info
  email: string;                    // From Google account
  displayName: string;              // From Google profile
  photoURL: string;                 // Google profile picture
  createdAt: string;                // ISO timestamp of account creation

  // Onboarding Status
  onboardingComplete: boolean;      // Has completed wallet + friends setup
  onboardingCompletedAt?: string;   // ISO timestamp

  // Tutorial Progress
  tutorialCompleted: boolean;       // Has completed shower tutorial
  tutorialCompletedAt?: string;     // ISO timestamp

  // Blockchain Integration
  walletAddress?: string;           // MetaMask wallet address (0x...)
  walletConnectedAt?: string;       // ISO timestamp of wallet connection

  // Social Features
  friendsPhones: string[];          // Array of phone numbers (+1234567890)

  // NFT History
  nftMints: [
    {
      tokenId: number;              // NFT token ID from blockchain
      txHash: string;               // Transaction hash (0x...)
      showerThought: string;        // User's shower thought
      duration: number;             // Shower duration in seconds
      walletAddress: string;        // Wallet that minted (for verification)
      mintedAt: string;             // ISO timestamp of mint
      expiresAt: string;            // ISO timestamp (mintedAt + 24 hours)
      isActive: boolean;            // false if expired & friends notified
    }
  ],
  lastMintAt?: string;              // ISO timestamp of most recent mint
}
```

## Implementation Files

### 1. `src/lib/firebase.ts`

Firebase initialization and configuration. Exports `auth`, `googleProvider`, and `db` instances.

**Environment Variables** (all in `.env`, prefixed with `VITE_` for client access):

- API Key, Auth Domain, Project ID, Storage Bucket, Messaging Sender ID, App ID

### 2. `src/lib/authService.ts`

All Firebase operations (auth, Firestore CRUD).

**Key Functions**:

#### `initAuthListener()`

Monitors authentication state and loads user data.

**Flow**:

1. Listen for auth state changes
2. If user logged in:
   - Fetch user document from Firestore
   - Load data into Svelte stores
   - If new user, create document
3. If user logged out:
   - Clear all stores

**Data Loaded**:

- `currentUser` (Firebase User object)
- `hasCompletedOnboarding`
- `friendsPhoneNumbers`
- `tutorialCompleted`
- `walletAddress` (if exists)

#### `signInWithGoogle()`

Handles Google OAuth login.

**Returns**: `{ success: boolean, user?: User, error?: string }`

#### `signOut()`

Logs user out and clears session.

#### `saveFriendPhoneNumbers(phones: string[])`

Saves friend phone numbers and marks onboarding complete.

**Updates**:

- `friendsPhones` array
- `onboardingComplete: true`
- `onboardingCompletedAt` timestamp

#### `saveWalletAddress(address: string)`

Saves MetaMask wallet address to user profile.

**Updates**:

- `walletAddress`
- `walletConnectedAt` timestamp

**Use Cases**:

- During onboarding (first connection)
- When reconnecting wallet on minting page
- Auto-load on login (from Firestore)

#### `completeTutorial()`

Marks tutorial as completed.

**Updates**:

- `tutorialCompleted: true`
- `tutorialCompletedAt` timestamp

#### `recordNFTMint(mintData)`

Saves NFT mint to user's history.

**Parameters**:

```typescript
{
  tokenId: number;
  txHash: string;
  showerThought: string;
  duration: number;
  walletAddress: string;
}
```

**Creates NFT Record**:

```typescript
{
  ...mintData,
  mintedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  isActive: true
}
```

**Updates**:

- Appends to `nftMints` array (using `arrayUnion`)
- Sets `lastMintAt` timestamp

#### `getUserNFTHistory()`

Retrieves all NFT mints for current user.

**Returns**: `{ success: boolean, nftMints: array, error?: string }`

#### `getUserFriendPhones()`

Retrieves friend phone numbers for current user.

**Returns**: `{ success: boolean, phones: array, error?: string }`

### 3. `src/lib/stores.ts`

Svelte stores for reactive state management.

**Firebase-Related Stores**:

```typescript
import type { User } from "firebase/auth";

export const currentUser = writable<User | null>(null);
export const friendsPhoneNumbers = writable<string[]>([]);
export const hasCompletedOnboarding = writable(false);
export const tutorialCompleted = writable(false);
```

**Note**: `walletAddress` is re-exported from `web3.ts` to avoid duplication.

## Security Rules

### Current (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

**⚠️ WARNING**: Test mode expires 30 days after Firestore creation. Update before production!

### Recommended (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read other users' public data (for leaderboards, search)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Authentication Flow

**First-Time User**: Login → Create Firestore doc → Onboarding (wallet + friends) → Dashboard  
**Returning User**: Login → Load Firestore data → Dashboard (skip onboarding)

## Component Integration

- **Login.svelte**: Calls `signInWithGoogle()`, redirects based on `hasCompletedOnboarding`
- **Onboarding.svelte**: Calls `saveWalletAddress()` + `saveFriendPhoneNumbers()`
- **Dashboard.svelte**: Reads `currentUser` for profile display, shows countdown
- **Minting.svelte**: Calls `recordNFTMint()` after blockchain mint
- **ShowerTutorial.svelte**: Calls `completeTutorial()` on finish

---

**Status**: ✅ Fully implemented and tested locally  
**Next**: Deploy to Vercel, test in production environment
