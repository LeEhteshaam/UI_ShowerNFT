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
- **Blockchain**: ethers.js v6, MetaMask, Base Sepolia testnet
- **Smart Contract**: ERC-721 NFT with 24-hour expiry (deployed to Base Sepolia)

## Project Structure

```
src/
├── lib/
│   ├── stores.ts          # Global state management
│   ├── web3.ts            # Web3 utilities (wallet, minting, network switching)
│   ├── components/         # UI components for each flow step
│   │   ├── Hero.svelte
│   │   ├── Tutorial.svelte
│   │   ├── Verification.svelte
│   │   ├── MiniGame.svelte
│   │   ├── Minting.svelte
│   │   ├── Loading.svelte
│   │   └── Complete.svelte
│   └── assets/
└── routes/
    ├── +page.svelte       # Main app with component routing
    └── +layout.svelte

ShowerNFT.sol              # ERC-721 smart contract (deployed)
```

## Current Flow

1. **Hero** - Landing page with "Groom Protocol" branding
2. **Tutorial** - Instructions for shower verification
3. **Verification** - Audio/sensor input (simulated)
4. **MiniGame** - Lather-Rinse-Repeat sequence memory game
5. **Minting** - NFT creation process
6. **Loading** - Transaction processing
7. **Complete** - Success confirmation

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
- [ ] Login with Google, storing user data in Firebase, to enable social features + have CI/CD for easy demo deployment with 
- [ ] Timer/countdown for 24-hour NFT validity (contract supports it, UI not yet implemented, per user)
- [ ] Push notification system for "stinky" alerts (when user's NFT expires, notify his friends) -- for demo, when part of signing up, ask for friend's phone number to send SMS via Twilio
- [ ] Friend list / social features
- [ ] Photo upload for shower selfies
- [ ] Streak tracking (can use Firebase and SQL for this)
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
