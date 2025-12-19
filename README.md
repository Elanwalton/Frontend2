# Sunleaf Technologies Frontend

Frontend application for Sunleaf Technologies e-commerce platform.

## Deployment to Vercel

### Prerequisites
- Vercel account
- Backend API deployed and accessible
- Environment variables configured

### Required Environment Variables
Set these in your Vercel project settings:

```
NEXT_PUBLIC_BACKEND_URL=https://api.sunleaftechnologies.co.ke
NODE_ENV=production
```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Frontend ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

3. **Configure Build Settings**
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   - Add `NEXT_PUBLIC_BACKEND_URL` with your backend API URL
   - Add any other required environment variables

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend

### Important Notes

**API Configuration**: The frontend is configured to call a separate PHP backend via the `getApiUrl()` function. Make sure your backend is deployed and accessible before deploying the frontend.

**CORS**: Ensure your backend has proper CORS headers configured to allow requests from your Vercel domain.

**Images**: The Next.js config is set up to handle images from external domains. Update `next.config.ts` if you need to add more image domains.

### Troubleshooting

**Build Errors**: Check that all dependencies are properly installed and that there are no TypeScript errors.

**API Errors**: Verify that `NEXT_PUBLIC_BACKEND_URL` is correctly set and that your backend is accessible.

**CORS Issues**: Make sure your backend allows requests from your Vercel deployment URL.

## Local Development

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.
