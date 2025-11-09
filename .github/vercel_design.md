# Vercel Deployment & CI/CD Design - ShowerNFT

## Overview

ShowerNFT uses Vercel for hosting, continuous deployment from GitHub, and serverless API functions for NFT expiry notifications.

## Architecture

### Deployment Model

- **Platform**: Vercel (serverless)
- **Framework**: SvelteKit with `@sveltejs/adapter-vercel`
- **Trigger**: Auto-deploy on GitHub push
- **Environments**:
  - **Production**: `main` branch → `your-project.vercel.app`
  - **Preview**: All branches → `your-project-git-[branch].vercel.app`
  - **Development**: Local dev server

### Serverless Functions

- **API Routes**: Auto-converted to Vercel Functions
- **Location**: `src/routes/api/**/*.ts`
- **Runtime**: Node.js 18.x
- **Timeout**: 10 seconds (free tier)
- **Region**: Auto (closest to user)

### NFT Expiry Checking

- **Method**: Client-side polling from Dashboard component
- **Frequency**: Every 5 minutes while Dashboard is open
- **Scope**: Per-user (each user checks only their own NFTs)
- **Benefits**: No Vercel cron limits, perfect for demos, 100% free tier compatible

## Implementation

### 1. Vercel Adapter

Installed via npm to enable serverless deployment.

**File**: `package.json`

```json
{
  "devDependencies": {
    "@sveltejs/adapter-vercel": "^5.4.8"
  }
}
```

**File**: `svelte.config.js`

```javascript
import adapter from "@sveltejs/adapter-vercel";

export default {
  kit: {
    adapter: adapter({
      runtime: "nodejs18.x",
    }),
  },
};
```

### 2. Vercel Configuration

Basic configuration for SvelteKit deployment.

**File**: `vercel.json`

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "sveltekit",
  "outputDirectory": ".vercel/output"
}
```

**Note**: Cron jobs removed to avoid free tier limits. Using client-side polling instead.

### 3. NFT Expiry Check Endpoint

### 3. NFT Expiry Check Endpoint

Serverless function to check a specific user's expired NFTs and send SMS notifications.

**File**: `src/routes/api/check-expired-nfts/+server.ts`

**Trigger**: Called from Dashboard component every 5 minutes

**Parameters**: `userId` (query parameter from `$currentUser.uid`)

**Current Status**: ⚠️ **Stub Created** - Logic not yet implemented

```typescript
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

// This endpoint checks for expired NFTs for a specific user
// Called from Dashboard component every 5 minutes with userId parameter
export async function GET({ request, url }: RequestEvent) {
  // Get userId from query parameter
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return json({ error: "userId parameter required" }, { status: 400 });
  }

  // Simple authentication
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer demo-secret`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Implement Firestore query for this user's NFTs
  // TODO: Check expiry and send SMS
  // TODO: Mark NFTs as inactive

  return json({
    success: true,
    message: `NFT expiry check completed for user ${userId}`,
    userId,
    timestamp: new Date().toISOString(),
  });
}
```

### 4. Dashboard Component Polling

**File**: `src/lib/components/Dashboard.svelte`

### 4. Dashboard Component Polling

**File**: `src/lib/components/Dashboard.svelte`

**Implementation**:

```typescript
// Check for expired NFTs and notify friends
async function checkExpiredNFTs() {
  if (!$currentUser) return; // Don't check if not logged in

  try {
    const response = await fetch(
      `/api/check-expired-nfts?userId=${$currentUser.uid}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer demo-secret`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("🔔 NFT expiry check completed:", data);
    }
  } catch (error) {
    console.error("❌ Error checking expired NFTs:", error);
  }
}

onMount(() => {
  // Start countdown
  countdownInterval = setInterval(updateCountdown, 1000);

  // Check for expired NFTs every 5 minutes (300000ms)
  // Also check immediately on mount
  checkExpiredNFTs();
  expiryCheckInterval = setInterval(checkExpiredNFTs, 5 * 60 * 1000);
});
```

**How It Works**:

- Runs immediately when user opens Dashboard
- Polls API every 5 minutes (300,000ms)
- Passes user's UID as query parameter
- Only checks that specific user's NFTs
- Stops polling when user navigates away (onDestroy cleanup)

**Planned Implementation (Full Logic)**:

```typescript
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { db } from "$lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function GET({ request, url }: RequestEvent) {
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return json({ error: "userId parameter required" }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer demo-secret`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get THIS specific user's document
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const nftMints = userData.nftMints || [];
    let notificationsSent = 0;
    const now = new Date();

    // 2. Find THIS user's expired, active NFTs
    const expiredNFTs = nftMints.filter(
      (nft) => nft.isActive && new Date(nft.expiresAt) < now
    );

    // 3. Send notifications for each expired NFT
    for (const nft of expiredNFTs) {
      const friendPhones = userData.friendsPhones || [];

      // Send SMS to THIS user's friends
      for (const phone of friendPhones) {
        await twilioClient.messages.create({
          body: `🚿 ALERT: ${userData.displayName} is now officially STINKY! Their Proof-of-Lather NFT has expired. Shame them into showering! - The Groom Protocol`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        notificationsSent++;
      }

      // 4. Mark NFT as inactive
      const nftIndex = nftMints.indexOf(nft);
      await updateDoc(userDocRef, {
        [`nftMints.${nftIndex}.isActive`]: false,
      });
    }

    return json({
      success: true,
      message: `Checked user ${userId}, sent ${notificationsSent} notifications`,
      userId,
      checked: expiredNFTs.length,
      notified: notificationsSent,
    });
  } catch (error: any) {
    console.error("NFT expiry check error:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
```

## Environment Variables

**Required in `.env` (local) and Vercel dashboard (production)**:

**Firebase** (6 vars, all prefixed `VITE_`): API Key, Auth Domain, Project ID, Storage Bucket, Messaging Sender ID, App ID

**Twilio** (3 vars, server-only): Account SID, Auth Token, Phone Number

**Important**: `VITE_` prefix required for client-side access in SvelteKit/Vite. Server-only vars (Twilio) don't need prefix.

**Note**: `CRON_SECRET` no longer needed since we switched to client-side polling.

## CI/CD Pipeline

**GitHub Integration**: Auto-deploy on push to `main` (production) or any branch (preview)

**Build**: `npm install` → `npm run build` → Deploy to global CDN (~2-3 min)

**Domains**:

- Production: `your-project.vercel.app`
- Preview: `your-project-git-[branch]-[team].vercel.app`

## API Testing

**Local Testing**:

```bash
# Test the expiry check endpoint (replace USER_ID with actual Firebase UID)
curl -X GET "http://localhost:5173/api/check-expired-nfts?userId=USER_ID" \
  -H "Authorization: Bearer demo-secret"
```

**Monitoring**: View logs in Vercel dashboard → Functions tab

## Twilio SMS Integration

**Setup**: Sign up, get phone number, copy Account SID + Auth Token to `.env` and Vercel

**Message Template**: "🚿 ALERT: [User Name] is now officially STINKY! Their Proof-of-Lather NFT has expired. Shame them into showering! - The Groom Protocol"

**Cost**: $0.0079/SMS (US) → ~$7/month for 100 users with 3 friends each. Free trial: $15 credit (~1,900 messages)

## Performance & Cost

**Edge Network**: Global CDN with auto code-splitting and asset optimization

**Serverless Functions**: Auto-scaling, regional deployment, 10s timeout (free tier)

**Client-Side Polling**: No Vercel cron limits, completely free, runs only when users are active

**Vercel Free Tier**: 100 GB bandwidth/month, unlimited deployments, 100 GB-hours functions/month

**Typical Usage** (100 users with 5min polling): ~5-10 GB bandwidth, ~300-500 function calls/day → Well within free tier

## Deployment Checklist

**Pre-Deployment**:

- [ ] All environment variables in `.env` copied to Vercel dashboard (all environments)
- [ ] Firebase authorized domains updated with Vercel URLs
- [ ] `npm run build` and `npm run check` pass locally

**Post-Deployment**:

- [ ] Test production URL, Google Sign-In, wallet connection, NFT minting
- [ ] Test expiry check endpoint manually with curl
- [ ] Verify Dashboard polling works (check browser console for logs)
- [ ] Monitor Vercel analytics for errors
- [ ] Set up error notifications (Slack/Discord integration)

## Troubleshooting

- **Build fails**: Check dependencies, imports, TypeScript errors
- **Env vars not working**: Add `VITE_` prefix for client vars, redeploy
- **Polling not working**: Check browser console, verify `$currentUser` is loaded
- **"userId required" error**: Ensure Dashboard passes `userId` query parameter
- **Firebase auth error**: Add Vercel domain to Firebase authorized domains
- **Twilio SMS failing**: Verify phone format (+1234567890), check Twilio logs

---

**Status**: ✅ **Deployed with Client-Side Polling** - No cron limits, 100% free tier compatible  
**Polling**: Every 5 minutes from Dashboard, per-user checking, no duplicates

**Next Steps**:

1. Implement Firestore query logic in API endpoint
2. Add Twilio SMS integration
3. Test with real expired NFTs
4. Monitor function execution logs
