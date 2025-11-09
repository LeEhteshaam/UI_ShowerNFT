# Vercel Deployment & CI/CD Design - ShowerNFT

## Overview

ShowerNFT uses Vercel for hosting, continuous deployment from GitHub, and serverless cron jobs for NFT expiry notifications.

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

### Cron Jobs

- **Service**: Vercel Cron
- **Configuration**: `vercel.json`
- **Authentication**: `CRON_SECRET` header
- **Schedule**: UNIX cron syntax

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

Defines cron jobs and routing rules.

**File**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/check-expired-nfts",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Cron Schedule**: `0 * * * *`

- **Meaning**: Every hour at minute 0
- **Example**: 12:00, 1:00, 2:00, etc.
- **Alternative schedules**:
  - Every 30 min: `*/30 * * * *`
  - Daily at 9am: `0 9 * * *`
  - Every 15 min: `*/15 * * * *`

### 3. Cron Endpoint

Serverless function to check expired NFTs and send SMS notifications.

**File**: `src/routes/api/check-expired-nfts/+server.ts`

**Current Status**: ⚠️ **Stub Created** - Logic not yet implemented

```typescript
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request }) => {
  // 1. Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Query Firestore for expired NFTs
  // TODO: Implement Firestore query

  // 3. Send SMS via Twilio
  // TODO: Implement Twilio integration

  // 4. Update NFT status
  // TODO: Mark NFTs as inactive

  return json({ success: true, message: "Cron job executed" });
};
```

**Planned Implementation**:

```typescript
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const GET: RequestHandler = async ({ request }) => {
  // 1. Verify authorization
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Get all users
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    let notificationsSent = 0;
    const now = new Date();

    // 3. Check each user's NFTs
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      const nftMints = userData.nftMints || [];

      // Find expired, active NFTs
      const expiredNFTs = nftMints.filter(
        (nft) => nft.isActive && new Date(nft.expiresAt) < now
      );

      // 4. Send notifications for each expired NFT
      for (const nft of expiredNFTs) {
        const friendPhones = userData.friendsPhones || [];

        // Send SMS to each friend
        for (const phone of friendPhones) {
          await twilioClient.messages.create({
            body: `🚿 ALERT: ${userData.displayName} is now officially STINKY! Their Proof-of-Lather NFT has expired. Shame them into showering! - The Groom Protocol`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
          });
          notificationsSent++;
        }

        // 5. Mark NFT as inactive
        const nftIndex = nftMints.indexOf(nft);
        await updateDoc(doc(db, "users", userDoc.id), {
          [`nftMints.${nftIndex}.isActive`]: false,
        });
      }
    }

    return json({
      success: true,
      message: `Checked all users, sent ${notificationsSent} notifications`,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
```

## Environment Variables

**Required in `.env` (local) and Vercel dashboard (production)**:

**Firebase** (6 vars, all prefixed `VITE_`): API Key, Auth Domain, Project ID, Storage Bucket, Messaging Sender ID, App ID

**Twilio** (3 vars, server-only): Account SID, Auth Token, Phone Number

**Vercel** (1 var): `CRON_SECRET` - Random string for cron authentication

**Important**: `VITE_` prefix required for client-side access in SvelteKit/Vite. Server-only vars (Twilio, Cron) don't need prefix.

## CI/CD Pipeline

**GitHub Integration**: Auto-deploy on push to `main` (production) or any branch (preview)

**Build**: `npm install` → `npm run build` → Deploy to global CDN (~2-3 min)

**Domains**:

- Production: `your-project.vercel.app`
- Preview: `your-project-git-[branch]-[team].vercel.app`

## Cron Job Security & Testing

**Authorization**: Vercel sends `Authorization: Bearer [CRON_SECRET]` header. Endpoint validates before executing.

**Local Testing**:

```bash
curl -X GET http://localhost:5173/api/check-expired-nfts \
  -H "Authorization: Bearer your_cron_secret"
```

**Monitoring**: View logs in Vercel dashboard → Functions tab

## Twilio SMS Integration

**Setup**: Sign up, get phone number, copy Account SID + Auth Token to `.env` and Vercel

**Message Template**: "🚿 ALERT: [User Name] is now officially STINKY! Their Proof-of-Lather NFT has expired. Shame them into showering! - The Groom Protocol"

**Cost**: $0.0079/SMS (US) → ~$7/month for 100 users with 3 friends each. Free trial: $15 credit (~1,900 messages)

## Performance & Cost

**Edge Network**: Global CDN with auto code-splitting and asset optimization

**Serverless Functions**: Auto-scaling, regional deployment, 10s timeout (free tier)

**Vercel Free Tier**: 100 GB bandwidth/month, unlimited deployments/cron, 100 GB-hours functions/month

**Typical Usage** (100 users): ~5-10 GB bandwidth, ~500 function calls/day → Well within free tier

## Deployment Checklist

**Pre-Deployment**:

- [ ] All environment variables in `.env` copied to Vercel dashboard (all environments)
- [ ] `CRON_SECRET` generated and added
- [ ] Firebase authorized domains updated with Vercel URLs
- [ ] `npm run build` and `npm run check` pass locally

**Post-Deployment**:

- [ ] Test production URL, Google Sign-In, wallet connection, NFT minting
- [ ] Test cron endpoint manually with curl
- [ ] Monitor Vercel analytics for errors
- [ ] Set up error notifications (Slack/Discord integration)

## Troubleshooting

- **Build fails**: Check dependencies, imports, TypeScript errors
- **Env vars not working**: Add `VITE_` prefix for client vars, redeploy
- **Cron not executing**: Validate `vercel.json` syntax, check Vercel logs
- **"Unauthorized" on cron**: `CRON_SECRET` mismatch between Vercel and endpoint
- **Firebase auth error**: Add Vercel domain to Firebase authorized domains
- **Twilio SMS failing**: Verify phone format (+1234567890), check Twilio logs

---

**Status**: ⚠️ **Ready to Deploy** - Configuration complete, pending project lead approval  
**Next Steps**:

1. Get approval from project lead
2. Connect GitHub repo to Vercel
3. Add environment variables
4. Deploy to production
5. Test all features live
6. Implement SMS notification logic
