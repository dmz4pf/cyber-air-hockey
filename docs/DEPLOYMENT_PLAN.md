# Cyber Air Hockey - Vercel Deployment Plan

## Overview & Goals

Deploy the Cyber Air Hockey multiplayer game to production with:
- **Frontend**: Vercel (Next.js 16 application)
- **Backend**: Railway (WebSocket server for real-time multiplayer)
- **Blockchain**: Linera Testnet integration (optional, can use mock mode)

### Success Criteria
- [ ] Frontend accessible via Vercel URL
- [ ] WebSocket server running on Railway with WSS
- [ ] Players can create/join games and play in real-time
- [ ] Environment properly configured for production

---

## Architecture Design

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│                    (Web Browsers)                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js 16 Application                  │    │
│  │  • Game UI (React 19 + Matter.js physics)           │    │
│  │  • State Management (Zustand)                        │    │
│  │  • WebSocket Client Connection                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Environment Variables:                                      │
│  • NEXT_PUBLIC_WS_URL=wss://air-hockey-server.up.railway.app│
│  • NEXT_PUBLIC_USE_MOCK_LINERA=true                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ WSS (Secure WebSocket)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   RAILWAY (Backend)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           WebSocket Server (Node.js)                 │    │
│  │  • Room Management (create/join/leave)              │    │
│  │  • Game State Synchronization                        │    │
│  │  • Real-time Position Updates                        │    │
│  │  • Score Tracking                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Configuration:                                              │
│  • Port: $PORT (Railway provides)                           │
│  • Node.js 20+                                              │
│  • Auto-scaling enabled                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend (Next.js 16)
**Location**: `/air-hockey`

| Component | Purpose |
|-----------|---------|
| `src/app/page.tsx` | Main game page |
| `src/app/profile/page.tsx` | Player profile |
| `src/components/` | React components |
| `src/lib/` | Game logic, WebSocket client |
| `src/store/` | Zustand state management |

### 2. Backend (WebSocket Server)
**Location**: `/air-hockey/server`

| File | Purpose |
|------|---------|
| `src/index.ts` | Server entry point, WebSocket setup |
| `src/roomManager.ts` | Game room logic |
| `src/types.ts` | TypeScript interfaces |

---

## Data Models & Flow

### WebSocket Message Flow
```
Player A                    Server                    Player B
    │                          │                          │
    │──── JOIN_ROOM ──────────►│                          │
    │                          │                          │
    │                          │◄──── JOIN_ROOM ──────────│
    │                          │                          │
    │◄──── GAME_START ─────────│──── GAME_START ─────────►│
    │                          │                          │
    │──── PADDLE_MOVE ────────►│──── PADDLE_SYNC ────────►│
    │                          │                          │
    │◄──── PUCK_UPDATE ────────│──── PUCK_UPDATE ────────►│
    │                          │                          │
    │◄──── SCORE_UPDATE ───────│──── SCORE_UPDATE ───────►│
```

---

## Dependencies & Tech Stack

### Frontend Dependencies
```json
{
  "next": "16.1.1",
  "react": "19.2.3",
  "matter-js": "^0.20.0",
  "zustand": "^5.0.9",
  "tailwindcss": "^4"
}
```

### Backend Dependencies
```json
{
  "ws": "^8.19.0",
  "uuid": "^13.0.0",
  "typescript": "^5.9.3"
}
```

### External Services
| Service | Purpose | Tier |
|---------|---------|------|
| Vercel | Frontend hosting | Free/Hobby |
| Railway | WebSocket server | Free ($5 credit) |
| Linera Testnet | Blockchain (optional) | Free |

---

## Implementation Phases

### Phase 1: Prepare Codebase for Production

#### 1.1 Update Next.js Configuration
Update `next.config.ts` for optimal Vercel deployment:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### 1.2 Add CORS to WebSocket Server
Update `server/src/index.ts` to handle CORS for production:

```typescript
// Add allowed origins configuration
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://your-app.vercel.app', // Will be updated after Vercel deployment
];
```

#### 1.3 Create Production Environment Files
Create `.env.production` with production values (template).

---

### Phase 2: Deploy WebSocket Server to Railway

#### 2.1 Create Railway Account & Project
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → "Deploy from GitHub repo"

#### 2.2 Configure Railway Project
```bash
# Railway will auto-detect Node.js
# Set build command in railway.json or dashboard:
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### 2.3 Set Environment Variables in Railway
| Variable | Value |
|----------|-------|
| `PORT` | (Railway provides automatically) |
| `NODE_ENV` | `production` |

#### 2.4 Deploy and Get URL
After deployment, Railway provides a URL like:
`https://air-hockey-server-production.up.railway.app`

---

### Phase 3: Deploy Frontend to Vercel

#### 3.1 Create Vercel Account & Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import the repository

#### 3.2 Configure Build Settings
| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `air-hockey` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

#### 3.3 Set Environment Variables in Vercel
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_WS_URL` | `wss://air-hockey-server-production.up.railway.app` |
| `NEXT_PUBLIC_USE_MOCK_LINERA` | `true` |
| `NEXT_PUBLIC_LINERA_NETWORK` | `Linera Testnet` |

#### 3.4 Create vercel.json
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

#### 3.5 Deploy
```bash
# Using Vercel CLI (optional)
cd air-hockey
npx vercel --prod
```

---

### Phase 4: Post-Deployment Configuration

#### 4.1 Update CORS Origins
After Vercel deployment, update Railway WebSocket server with the Vercel URL in allowed origins.

#### 4.2 Configure Custom Domain (Optional)
1. In Vercel: Settings → Domains → Add domain
2. Update DNS records as instructed
3. Update Railway CORS with custom domain

#### 4.3 Set Up Monitoring
- Vercel: Built-in analytics (enable in dashboard)
- Railway: Built-in logs and metrics

---

### Phase 5: Testing & Verification

#### 5.1 Functional Testing Checklist
- [ ] Homepage loads correctly
- [ ] WebSocket connection establishes (check Network tab)
- [ ] Can create a new game room
- [ ] Second player can join the room
- [ ] Game starts when both players ready
- [ ] Paddle movements sync between players
- [ ] Puck physics work correctly
- [ ] Scores update properly
- [ ] Game ends correctly
- [ ] Players can play again

#### 5.2 Performance Testing
- [ ] Initial page load < 3 seconds
- [ ] WebSocket latency < 100ms
- [ ] No dropped frames during gameplay

#### 5.3 Error Handling
- [ ] Graceful reconnection on WebSocket disconnect
- [ ] Proper error messages displayed
- [ ] Game handles player disconnect mid-game

---

## Edge Cases & Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| WebSocket server down | Show "Server unavailable" message |
| Player disconnects mid-game | Notify opponent, pause/end game |
| Network latency spike | Interpolation/prediction for smooth gameplay |
| Invalid game state | Reset to last valid state |
| Room full | Show "Room full" error |
| Invalid room code | Show "Room not found" error |

---

## Testing Strategy

### Unit Tests
- WebSocket message handlers
- Room management logic
- Game state transitions

### Integration Tests
- WebSocket connection lifecycle
- Multi-player game flow

### E2E Tests
- Full game playthrough
- Reconnection scenarios

---

## Potential Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| WebSocket server crashes | Medium | High | Railway auto-restart, health checks |
| High latency affecting gameplay | Medium | Medium | Server region close to users, interpolation |
| Railway free tier limits | Low | Medium | Monitor usage, upgrade if needed |
| Vercel build failures | Low | Medium | Test build locally first |
| CORS issues | Medium | Medium | Pre-configure allowed origins |
| SSL certificate issues | Low | High | Use platform-provided SSL |

---

## Deployment Checklist

### Pre-Deployment
- [ ] Local build succeeds: `npm run build`
- [ ] Server builds: `cd server && npm run build`
- [ ] All environment variables documented
- [ ] CORS origins prepared
- [ ] Security headers configured

### Railway (WebSocket Server)
- [ ] Repository connected
- [ ] Build/start commands configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] WSS URL obtained and tested

### Vercel (Frontend)
- [ ] Repository connected
- [ ] Root directory set to `air-hockey`
- [ ] Environment variables set with Railway WSS URL
- [ ] `vercel.json` created
- [ ] Deployment successful
- [ ] Site accessible

### Post-Deployment
- [ ] Update CORS origins in Railway
- [ ] Functional tests passed
- [ ] Performance acceptable
- [ ] Monitoring enabled

---

## Cost Estimation

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | 100GB bandwidth/mo | $20/mo Pro |
| Railway | $5 credit/mo | $5+/mo usage |
| **Total** | **$0/mo** | **~$25/mo** |

---

## Commands Reference

```bash
# Local Development
cd air-hockey
npm run dev                    # Frontend on :3000
cd server && npm run dev       # Server on :8080

# Build
npm run build                  # Frontend build
cd server && npm run build     # Server build

# Deploy (if using CLI)
npx vercel --prod              # Deploy to Vercel
railway up                     # Deploy to Railway
```

---

## Next Steps After Approval

1. Update `next.config.ts` with production settings
2. Add CORS configuration to WebSocket server
3. Create `vercel.json` configuration
4. Deploy WebSocket server to Railway
5. Deploy frontend to Vercel
6. Test the complete flow
7. Configure monitoring

---

*Plan created: 2026-01-12*
*Status: Awaiting approval*
