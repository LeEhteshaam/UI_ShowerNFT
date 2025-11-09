# GitHub Copilot Instructions for ShowerNFT Project

## Project Overview

**ShowerNFT - The Groom Protocol** is a humorous hackathon project at UWaterloo that addresses the stereotype of CS students not showering. Users verify their hygiene by minting time-limited "Proof-of-Lather" NFTs valid for 24 hours.

## Core Concept

- **Purpose**: Gamified shower verification app with blockchain NFTs
- **Humor**: CS student hygiene stereotype + crypto culture satire
- **Features**: Audio verification, mini-games, 24-hour NFT expiry, social accountability (push notifications to friends when someone becomes "stinky")

## Tech Stack

- **Frontend**: SvelteKit 2.x with TypeScript
- **Styling**: TailwindCSS v4
- **Build Tool**: Vite
- **State Management**: Svelte stores (writable)
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Firestore (user profiles, NFT history, friend phones)
- **Blockchain**: ethers.js v6, MetaMask, Base Sepolia testnet
- **Smart Contract**: ERC-721 NFT with 24-hour expiry (deployed to Base Sepolia)
- **Deployment**: Vercel (auto-deploy from GitHub, serverless functions)
- **Notifications**: Twilio SMS (configured, not yet implemented)

## Project Structure

```
src/
├── lib/
│   ├── stores.ts          # Global state management
│   ├── web3.ts            # Web3 utilities (wallet, minting, network switching)
│   ├── firebase.ts        # Firebase configuration
│   ├── authService.ts     # Firebase auth & Firestore operations
│   ├── components/         # UI components for each flow step
│   │   ├── Login.svelte
│   │   ├── Onboarding.svelte
│   │   ├── Dashboard.svelte
│   │   ├── Hero.svelte
│   │   ├── Tutorial.svelte
│   │   ├── ShowerTutorial.svelte
│   │   ├── Verification.svelte
│   │   ├── MiniGame.svelte
│   │   ├── Minting.svelte
│   │   ├── Loading.svelte
│   │   └── Complete.svelte
│   └── ml/
│       └── poseDetector.ts # TensorFlow.js pose detection
└── routes/
    ├── +page.svelte       # Main app with component routing
    ├── +layout.svelte
    └── api/
        └── check-expired-nfts/
            └── +server.ts # Cron endpoint for SMS notifications

.github/
├── copilot-instructions.md
├── google_firebase_design.md
└── vercel_design.md

ShowerNFT.sol              # ERC-721 smart contract (deployed)
vercel.json                # Vercel deployment config + cron jobs
```

## Current Flow

1. **Login** - Google Sign-In with Firebase Auth
2. **Onboarding** - Connect MetaMask wallet + add friend phone numbers
3. **Dashboard** - Homepage with 24hr countdown timer + "Freshen Up" button
4. **Tutorial** - Instructions for shower verification (skipped if completed before)
5. **ShowerTutorial** - Interactive pose detection tutorial
6. **Verification** - Audio/sensor input + pose detection
7. **MiniGame** - Lather-Rinse-Repeat sequence memory game
8. **Minting** - NFT creation process (enter shower thought)
9. **Loading** - Transaction processing
10. **Complete** - Success confirmation, return to Dashboard

## State Management Pattern

All views are managed through `stores.ts`:

```typescript
export const view = writable("hero");
export function showView(viewName: string) {
  view.set(viewName);
}
```

Components use: `import { showView } from '$lib/stores';`

## Code Style & Conventions

- **TypeScript**: Use TypeScript for all logic
- **Components**: Use `<script lang="ts">` in Svelte files
- **Styling**: TailwindCSS utility classes (no custom CSS unless necessary)
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: Use `$lib/` alias for library imports

## Tone & Content

- **Humor**: Maintain satirical/ironic tone about hygiene verification
- **Branding**: "Groom Protocol", "Proof-of-Lather", blockchain buzzwords
- **UX**: Simple, fast, gamified - this is a hackathon project!

## Development Priorities

1. **Speed > Perfection**: This is a hackathon - ship fast!
2. **Meme Value**: Funny features > technical sophistication
3. **Demo-Ready**: Focus on visual polish and storytelling

## Planned Features (Not Yet Implemented)

- [x] Blockchain integration (wallet connection, NFT minting) ✅ **COMPLETE**
- [x] Login with Google, storing user data in Firebase ✅ **COMPLETE**
- [x] Firebase backend with user profiles, friend phones, NFT history ✅ **COMPLETE**
- [x] Dashboard with 24-hour countdown timer ✅ **COMPLETE**
- [x] CI/CD setup with Vercel (documentation complete, pending permissions) ⏳ **READY TO DEPLOY**
- [ ] Timer/countdown for 24-hour NFT validity from blockchain (currently mock countdown)
- [ ] Push notification system for "stinky" alerts (when user's NFT expires, notify friends via SMS/Twilio)
- [ ] User search/discovery page to view other users' NFT status
- [ ] Enhanced smart contract with auto-burn on expiry
- [ ] Custom timeout for demo purposes (minutes instead of 24hr)
- [ ] Friend list / social features
- [ ] Photo upload for shower selfies
- [ ] Streak tracking
- [ ] Leaderboard of "cleanest" students
- [ ] NFT gallery/badge display

## Advanced Features (If Time Permits)

- [ ] **Enhanced Smart Contract v2** - Store metadata on-chain or IPFS
  - Current: Basic ERC-721 with only timestamp and 24-hour expiry
  - Desired: Store shower duration, thoughts, verification data on-chain
  - Options to explore:
    - On-chain storage (more gas, permanent, visible on BaseScan)
    - IPFS metadata (standard NFT approach, works with marketplaces)
    - Event emissions (cheap, queryable via logs)
  - Would allow viewing full NFT details on block explorers
  - See note below about current limitation\*

\*Note: Current smart contract is basic ERC-721 with 24-hour expiry logic. Metadata (shower thoughts, duration) is only stored in frontend state and not persisted on-chain. We may enhance the contract later to store this data on-chain or via IPFS if time allows.

## When Suggesting New Features

- Prioritize features that are **funny and demo-worthy**
- Keep implementation **simple** (hackathon timeline!)
- Suggest **visual** features that make good screenshots
- Consider **social/multiplayer** elements for virality

## Common Tasks

- **New view**: Create component in `src/lib/components/`, add to routing in `+page.svelte`
- **New state**: Add to `stores.ts` with writable store
- **Styling**: Use TailwindCSS classes, maintain consistent spacing/shadows
- **Navigation**: Use `showView('viewName')` function

## Blockchain Integration Notes

**Current Implementation (v1.0):**

- ✅ MetaMask wallet connection with auto-network switching
- ✅ Base Sepolia testnet deployment
- ✅ ERC-721 NFT minting (simple version)
- ✅ 24-hour expiry logic in smart contract (`isValid()`, `timeRemaining()`)
- ✅ Transaction tracking and BaseScan links
- ✅ OpenSea testnet integration for viewing NFTs

**Smart Contract:** `ShowerNFT.sol`

- Basic ERC-721 with mint timestamp tracking
- Validity period: 24 hours from mint
- Functions: `mint()`, `isValid()`, `timeRemaining()`, `expiryTime()`
- Deployed to Base Sepolia at: `0x4068028D9161B31c3dde5C5C99C4F12205b6C7b7`

**Future Enhancements:**

- Store shower duration, thoughts, and verification data on-chain
- Implement auto-burn or transfer on expiry
- Add IPFS metadata with custom NFT images
- Emit events for better indexing and notifications

## Testing/Running

- Dev server: `npm run dev`
- Build: `npm run build`
- Type checking: `npm run check`

---

**Remember**: This is a meme project! Embrace the absurdity. Make it funny, make it fast, make it demo-able! 🚿✨

## Next Priority Features

### 1. User Discovery Page 🔍

**Goal**: View other users' NFT status at dashboard

**Implementation**:

- Add "Browse Users" page/tab on dashboard
- Search functionality by email address
- Display user cards showing:
  - User name & profile picture
  - Most recent NFT mint status (FRESH ✨ or STINKY 🤢)
  - NFT card (blank placeholder for first pass)
  - Pull data from Firestore (user profiles + nftMints array)
- Future: Query blockchain for actual NFT data

**Acceptance Criteria**:

- [ ] Search bar to find users by email
- [ ] Display all users as cards
- [ ] Show user's current hygiene status
- [ ] Blank NFT card placeholder (blockchain integration later)

### 2. Enhanced Smart Contract & Custom Timeout ⏱️

**Goal**: Auto-burn on expiry + demo-friendly custom timeouts

**Smart Contract Changes**:

- Add `burn()` function to auto-burn NFT on expiry
- Add custom timeout parameter to `mint()` function:
  - Default: 24 hours (86400 seconds)
  - Demo mode: Custom minutes (converted to seconds)
- Store timeout value with each NFT
- Emit events for easier tracking

**Frontend Changes**:

- Add number input on Minting page: "Demo Timeout (minutes)"
- If empty, use 24hr default
- Pass custom timeout to smart contract
- Dashboard countdown reads actual timeout from blockchain:
  - Query `timeRemaining()` from contract
  - Display accurate countdown
  - Update every second

**Acceptance Criteria**:

- [ ] Smart contract accepts custom timeout on mint
- [ ] Smart contract auto-burns NFT when expired
- [ ] Minting page has optional timeout input (minutes)
- [ ] Dashboard countdown reads from blockchain (not mock)
- [ ] Countdown accurately reflects NFT expiry time

### 3. SMS Notifications on Expiry 📱

**Goal**: Notify friends when NFT expires (user becomes "stinky")

**Implementation**:

- Implement `/api/check-expired-nfts` endpoint logic:
  - Query Firestore for all users with `nftMints`
  - Check each NFT's `expiresAt` timestamp
  - If expired and `isActive: true`:
    - Get user's `friendsPhones` array
    - Send SMS via Twilio to each friend
    - Mark NFT as `isActive: false`
- Twilio SMS message:
  - "🚿 ALERT: [User Name] is now officially STINKY! Their Proof-of-Lather NFT has expired. Shame them into showering! - The Groom Protocol"
- Vercel Cron runs endpoint every hour

**Acceptance Criteria**:

- [ ] Cron job queries Firestore for expired NFTs
- [ ] SMS sent to all friends when NFT expires
- [ ] Funny, on-brand message
- [ ] NFT marked inactive after notification
- [ ] No duplicate notifications

## CI/CD Status

⏳ **READY TO DEPLOY** - Waiting for permissions from project lead

**What's Ready**:

- ✅ Vercel configuration (`vercel.json`)
- ✅ Environment variables documented
- ✅ Auto-deploy from GitHub configured
- ✅ Cron job setup for NFT expiry checks
- ✅ All documentation complete

**Pending**:

- [ ] Project lead approval for Vercel deployment
- [ ] Add production domain to Firebase Authorized Domains
- [ ] Test auto-deployment pipeline
- [ ] Verify cron job execution

**See**: `CICD_SETUP.md`, `.github/vercel_design.md` for full details

---

**Remember**: This is a meme project! Embrace the absurdity. Make it funny, make it fast, make it demo-able! 🚿✨
