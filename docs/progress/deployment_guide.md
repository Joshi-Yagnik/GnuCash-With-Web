# Deploying Finance-Joshi to Vercel

Since your code is now on GitHub, the easiest and best way to deploy is using the Vercel Dashboard. This sets up **Continuous Deployment**, meaning your site will automatically update whenever you push changes to GitHub.

## Step 1: Login to Vercel
1.  Go to [vercel.com](https://vercel.com).
2.  Log in (Sign up with GitHub if you haven't already).

## Step 2: Import Project
1.  On your Vercel Dashboard, click **Add New** > **Project**.
2.  Under **Import Git Repository**, find your repo: `finance-joshi`.
    *   If you don't see it, click **Adjust GitHub App Permissions** and grant access to the repository.
3.  Click **Import**.

## Step 3: Configure Project
Vercel will automatically detect that this is a **Vite** project.
1.  **Framework Preset**: Vite (should be auto-selected).
2.  **Root Directory**: `./` (default).
3.  **Build Command**: `npm run build` (default).
4.  **Output Directory**: `dist` (default).
5.  **Environment Variables**:
    *   **CRITICAL**: You must add your Firebase configuration here so the live site can connect to your database.
    *   Open your local `.env` or `.env.local` file.
    *   Copy and paste each key-value pair into the Vercel Environment Variables section:
        *   `VITE_FIREBASE_API_KEY`
        *   `VITE_FIREBASE_AUTH_DOMAIN`
        *   `VITE_FIREBASE_PROJECT_ID`
        *   `VITE_FIREBASE_STORAGE_BUCKET`
        *   `VITE_FIREBASE_MESSAGING_SENDER_ID`
        *   `VITE_FIREBASE_APP_ID`

## Step 4: Deploy
1.  Click **Deploy**.
2.  Wait for the build to complete (usually < 1 minute).
3.  **Success!** You will get a live URL (e.g., `finance-joshi.vercel.app`).

## Troubleshooting
- **White screen?** Check your Browser Console (F12). It's almost always missing Environment Variables. Go to Settings > Environment Variables in Vercel to fix them, then redeploy.
