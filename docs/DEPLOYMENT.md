# GitHub Pages Deployment Guide

This guide explains how to deploy the Dutch Radio Ad-Break Switcher to GitHub Pages.

## 🚀 Quick Deployment

The project is already configured for GitHub Pages! Simply push to the `main` branch and GitHub Actions will automatically build and deploy your site.

### Live URL
Your deployed site will be available at: **https://niels27.github.io/no-ads-radio-project/**

## 📋 Pre-Deployment Checklist

Before deploying, ensure the following are configured:

### ✅ Repository Configuration
- [x] Repository is connected to GitHub: `https://github.com/Niels27/no-ads-radio-project.git`
- [x] Base path in `vite.config.js` matches repository name: `/no-ads-radio-project/`
- [x] Package.json contains proper repository information
- [x] `.gitignore` excludes `node_modules` but includes `dist` (commented out for GitHub Pages)

### ✅ GitHub Actions Workflow
- [x] `.github/workflows/deploy.yml` exists and is properly configured
- [x] Workflow has correct permissions for GitHub Pages deployment
- [x] Build script `npm run build:github` exists in package.json

### ✅ Production Optimizations
- [x] Console logging is disabled in production (automatic detection + manual override)
- [x] Build assets are minified and optimized
- [x] Proper asset naming and chunking configuration
- [x] Source maps disabled for smaller builds

### ✅ GitHub Pages Settings
To enable GitHub Pages (if not already done):

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. Save the configuration

## 🛠️ Manual Deployment Commands

### Local Testing
```bash
# Test the production build locally
npm run build:github
npm run preview

# Open http://localhost:4173 to test
```

### Force Deploy
```bash
# Commit and push to trigger deployment
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## 🔧 Configuration Files

### vite.config.js
```javascript
export default defineConfig({
  // GitHub Pages base path
  base: process.env.NODE_ENV === 'production' ? '/no-ads-radio-project/' : '/',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Production optimizations
  }
})
```

### package.json Scripts
```json
{
  "scripts": {
    "build:github": "vite build --base=/no-ads-radio-project/",
    "deploy:github": "npm run build:github && echo 'Build completed for GitHub Pages'"
  }
}
```

### .github/workflows/deploy.yml
Automatically builds and deploys on every push to `main` branch.

## 🐛 Troubleshooting

### Common Issues

**1. Assets not loading (404 errors)**
- Check that the base path in `vite.config.js` matches your repository name
- Ensure the repository name in the URL matches exactly

**2. Deployment fails**
- Check the Actions tab in your GitHub repository for error details
- Ensure you have Pages enabled in repository settings
- Verify the workflow has proper permissions

**3. Site shows old version**
- GitHub Pages may take a few minutes to update
- Try hard refresh (Ctrl+F5) or clear browser cache
- Check the Actions tab to confirm deployment completed

**4. Console logs visible in production**
- The logging system auto-detects GitHub Pages domains
- You can manually disable by setting `manualProductionFlag = true` in `src/utils/logger.js`
- Or call `window.disableLogging()` in browser console

### Local Development vs Production

| Environment | Base Path | Console Logs | URL |
|-------------|-----------|--------------|-----|
| Development | `/` | Enabled | `http://localhost:5173` |
| Local Preview | `/no-ads-radio-project/` | Disabled | `http://localhost:4173` |
| GitHub Pages | `/no-ads-radio-project/` | Disabled | `https://niels27.github.io/no-ads-radio-project/` |

## 📈 Monitoring Deployment

### GitHub Actions
- Go to the **Actions** tab in your repository
- Click on the latest workflow run
- Monitor the build and deployment progress
- Check for any errors in the logs

### Deployment Status
- Green checkmark = successful deployment
- Red X = deployment failed (check logs)
- Yellow circle = deployment in progress

## 🔄 Updating the Site

1. Make your changes locally
2. Test with `npm run dev`
3. Test production build with `npm run build:github && npm run preview`
4. Commit and push: `git push origin main`
5. GitHub Actions will automatically deploy the updates

The site typically updates within 2-5 minutes after a successful deployment.
