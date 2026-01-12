# Deployment Guide - Cyber Air Hockey

Quick guide to deploy the Air Hockey game to production.

## Prerequisites

- GitHub account (for connecting to Vercel/Railway)
- Vercel account (free): https://vercel.com
- Railway account (free $5 credit): https://railway.app

## Step 1: Push Code to GitHub

```bash
cd /Users/MAC/Desktop/dev/linera/air-hockey
git add .
git commit -m "Add deployment configuration"
git push origin main
```

## Step 2: Deploy WebSocket Server to Railway

1. Go to https://railway.app and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. **Important**: Set the root directory to `air-hockey/server`
5. Railway will auto-detect Node.js and deploy

### After Deployment:
- Click on your deployment → **Settings** → **Networking**
- Click **"Generate Domain"** to get your public URL
- Copy the URL (e.g., `air-hockey-server-production.up.railway.app`)

### Set Environment Variables in Railway:
```
NODE_ENV=production
```

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your repository
4. Configure:
   - **Root Directory**: `air-hockey`
   - **Framework Preset**: Next.js
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_WS_URL=wss://YOUR-RAILWAY-URL-HERE
   NEXT_PUBLIC_USE_MOCK_LINERA=true
   ```
6. Click **"Deploy"**

## Step 4: Update CORS (Important!)

After getting your Vercel URL, update the Railway server's allowed origins:

1. Go to Railway → Your project → **Variables**
2. Add:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
3. Railway will auto-redeploy

## Verification

1. Visit your Vercel URL
2. Open browser console (F12) - check for WebSocket connection
3. Create a game room
4. Open another browser/tab and join with the room code
5. Play!

## Troubleshooting

### WebSocket Connection Failed
- Check `NEXT_PUBLIC_WS_URL` in Vercel uses `wss://` (not `ws://`)
- Verify Railway server is running (check logs)
- Check CORS: ensure your Vercel domain is in `ALLOWED_ORIGINS`

### Health Check
Test your Railway server:
```bash
curl https://YOUR-RAILWAY-URL/health
```

Should return:
```json
{"status":"healthy","uptime":123.45,"timestamp":"...","stats":{...}}
```

## Cost

| Service | Free Tier |
|---------|-----------|
| Vercel | 100GB bandwidth/mo |
| Railway | $5 credit/mo |

Both are free for hobby projects.

---

**Files Modified for Deployment:**
- `next.config.ts` - Production config
- `vercel.json` - Vercel settings
- `server/src/index.ts` - CORS + health checks
- `server/railway.json` - Railway config
- `server/nixpacks.toml` - Node.js version
- `.env.example` - Environment template
