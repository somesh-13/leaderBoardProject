# Content Security Policy (CSP) Configuration

## Overview
This application uses Chart.js for financial charts and Motion/Framer Motion for animations. These libraries require `eval()` and `unsafe-eval` permissions to function properly.

## CSP Warnings Explanation

### Development
- CSP is automatically configured in development to allow necessary script execution
- No action needed for local development

### Production (GitHub Pages)
The application may show CSP warnings in the browser console such as:
```
The Content Security Policy (CSP) prevents the evaluation of arbitrary strings as JavaScript
```

**These warnings are expected and do not affect functionality.**

### Why This Happens
1. **Chart.js**: Uses eval() for dynamic chart rendering and animations
2. **Motion Library**: Requires unsafe-eval for smooth animations
3. **Static Hosting**: GitHub Pages doesn't support custom server headers

### Solutions

#### Option 1: Ignore Warnings (Recommended)
- The app functions completely despite CSP warnings
- All features work as intended
- No security risk for a frontend-only application

#### Option 2: Self-Hosting with Custom Headers
If hosting on your own server, add these headers:

```nginx
# Nginx configuration
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com data:; img-src 'self' data: https: api.dicebear.com; connect-src 'self' https://api.polygon.io;";
```

```apache
# Apache configuration
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com data:; img-src 'self' data: https: api.dicebear.com; connect-src 'self' https://api.polygon.io;"
```

#### Option 3: Browser Extension Override
Install a browser extension like "Disable Content-Security-Policy" for development/testing.

## Security Notes
- `unsafe-eval` is required for Chart.js animations
- This is a frontend-only trading simulation app with no sensitive server-side operations
- All data fetching uses HTTPS APIs with proper authentication
- CSP warnings don't create actual security vulnerabilities for this use case

## Technical Details
- **Charts**: Chart.js v4.4.0 requires eval() for dynamic rendering
- **Animations**: Motion v12.23.12 needs unsafe-eval for performance
- **Static Export**: Next.js static export to GitHub Pages doesn't support middleware CSP
- **Development**: CSP is automatically configured via `CSPScript` component