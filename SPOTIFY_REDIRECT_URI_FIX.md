# 🎵 Spotify Redirect URI Fix - Production Issue Resolution

## Issue Diagnosis

The Spotify integration works perfectly on local development (`https://127.0.0.1:4174/radio-zonder-reclame/`) but fails on GitHub Pages production (`https://niels27.github.io/radio-zonder-reclame/`) with the error:

```
INVALID_CLIENT: Invalid redirect URI
```

## Root Cause

Spotify's authorization server is rejecting the production redirect URI because it's not configured in the Spotify Developer Dashboard. The redirect URI must be **exactly** whitelisted for each environment.

## Current Redirect URIs Being Used

### ✅ Working (Local Development)
- `https://127.0.0.1:4174/radio-zonder-reclame/callback.html`

### ❌ Failing (Production)
- `https://niels27.github.io/radio-zonder-reclame/callback.html`

## Required Fix Steps

### Step 1: Access Spotify Developer Dashboard
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Find your app with Client ID: `67703322b3fe4c27aa42f10e3d067b84`

### Step 2: Update Redirect URIs
1. Click on your app to open its details
2. Click "Edit Settings" button
3. Scroll to the "Redirect URIs" section
4. Add the following URIs (if not already present):

```
https://niels27.github.io/radio-zonder-reclame/callback.html
https://127.0.0.1:4174/radio-zonder-reclame/callback.html
http://127.0.0.1:4173/radio-zonder-reclame/callback.html
http://localhost:4173/radio-zonder-reclame/callback.html
http://localhost:4174/radio-zonder-reclame/callback.html
```

### Step 3: Save and Wait
1. Click "Save" to apply the changes
2. **Important**: Wait 5-10 minutes for changes to propagate across Spotify's servers
3. Clear your browser cache to ensure fresh requests

### Step 4: Test the Fix
Use our diagnostic tools to verify the fix:

1. **Production Test**: https://niels27.github.io/radio-zonder-reclame/spotify-auth-test.html
2. **Diagnostic Tool**: https://niels27.github.io/radio-zonder-reclame/spotify-diagnostic.html
3. **Main App**: https://niels27.github.io/radio-zonder-reclame/

## Technical Details

### Current Code Implementation
The app correctly generates the redirect URI based on the current environment:

```javascript
const getRedirectUri = () => {
  const origin = window.location.origin;
  const path = '/radio-zonder-reclame/callback.html';
  return `${origin}${path}`;
};
```

### Environment Detection
- **Local**: `window.location.origin` = `https://127.0.0.1:4174`
- **Production**: `window.location.origin` = `https://niels27.github.io`

The code automatically adapts to both environments, but Spotify requires explicit whitelisting.

## Verification Steps

After updating the Spotify app configuration:

1. **Test Authentication Flow**:
   - Visit: https://niels27.github.io/radio-zonder-reclame/spotify-auth-test.html
   - Click "🚀 Test Spotify Authentication"
   - You should be redirected to Spotify's login page
   - After authorization, you should return to the callback page successfully

2. **Test Main Application**:
   - Visit: https://niels27.github.io/radio-zonder-reclame/
   - Click "Connect Spotify" button
   - Authentication should complete without "Invalid redirect URI" error

3. **Monitor Console Logs**:
   - Open browser DevTools (F12)
   - Check for successful authentication logs
   - Should see: "✅ Authorization successful! Processing..."

## Common Issues & Solutions

### Issue: Still getting "Invalid redirect URI" after updating
**Solution**: 
- Double-check the URI is exactly: `https://niels27.github.io/radio-zonder-reclame/callback.html`
- Wait longer (up to 15 minutes) for Spotify's cache to clear
- Try in an incognito/private browser window

### Issue: Works in development but still fails in production
**Solution**:
- Verify both URIs are in the Spotify app configuration
- Check that the production URI doesn't have trailing slashes or extra parameters

### Issue: "Mixed content" or security errors
**Solution**:
- Ensure the production site is using HTTPS (it is: ✅)
- Clear browser cache and cookies

## Success Criteria

✅ **Fixed when**:
- Production Spotify authentication completes without errors
- Users can successfully connect and play Spotify playlists on GitHub Pages
- Console shows successful authorization messages
- No "INVALID_CLIENT" errors in network tab

## Backup Plan

If the main client ID cannot be updated, we can:
1. Create a new Spotify app specifically for production
2. Use environment-based client ID selection
3. Update the code to use the production-specific client ID

## Contact Information

**Spotify App Details**:
- Client ID: `67703322b3fe4c27aa42f10e3d067b84`
- Required Scopes: `playlist-read-private`, `playlist-read-collaborative`, `streaming`, `user-read-email`, `user-read-private`, `user-library-read`, `user-read-playback-state`, `user-modify-playback-state`

**GitHub Repository**: https://github.com/niels27/radio-zonder-reclame
**Production Site**: https://niels27.github.io/radio-zonder-reclame/

---

**Status**: 🔄 Pending Spotify Developer Dashboard update
**Priority**: High - Breaks core functionality on production
**Impact**: Users cannot access Spotify playlists on the live site
