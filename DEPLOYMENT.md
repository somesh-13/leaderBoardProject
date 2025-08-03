# GitHub Pages Deployment Guide

This project is configured for deployment to GitHub Pages using GitHub Actions.

## Deployment Setup

### 1. Repository Settings
1. Go to your GitHub repository settings
2. Navigate to **Pages** section  
3. Under **Source**, select **GitHub Actions**

### 2. Automatic Deployment
The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Triggers on push to `main` or `master` branch
- Builds the Next.js application for static export
- Deploys to GitHub Pages automatically

### 3. Manual Deployment
To deploy manually:
```bash
# Build for production
NODE_ENV=production npm run build

# The static files will be generated in the 'out' directory
```

## Configuration Details

### Next.js Configuration
- **Static Export**: Configured with `output: 'export'`
- **Base Path**: Set to `/leaderBoardProject` for GitHub Pages
- **Image Optimization**: Disabled for static export
- **Trailing Slash**: Enabled for better compatibility

### Features Available in Static Build
✅ **Homepage** - Dashboard and overview  
✅ **Leaderboard** - Trading rankings with real-time calculations  
✅ **Multi-Terminal** - Interactive trading strategy terminal with tabs  
✅ **Profile** - Static trader profile page  
✅ **Dark Mode** - Theme switching  
✅ **Responsive Design** - Mobile and desktop support  

### Limitations
❌ **Dynamic Profile Routes** - Individual trader profiles removed for static export  
❌ **Server-Side Rendering** - All pages are statically generated  
❌ **API Routes** - Not supported in static export  

## Accessing the Deployed Site

Once deployed, your site will be available at:
```
https://[username].github.io/leaderBoardProject/
```

Replace `[username]` with your actual GitHub username.

## Troubleshooting

### Build Errors
- Ensure all imports are client-side compatible
- Check that no server-side features are used
- Verify all dynamic routes have `generateStaticParams()`

### Deployment Issues
- Check GitHub Actions logs in the **Actions** tab
- Ensure repository has Pages enabled
- Verify correct base path configuration

### Multi-Terminal Functionality
The multi-terminal feature works fully in the static build:
- ✅ Multiple terminal tabs
- ✅ Independent session states  
- ✅ Command history persistence per tab
- ✅ Add/remove terminals
- ✅ Full trading strategy testing commands