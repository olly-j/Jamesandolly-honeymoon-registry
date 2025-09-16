#!/bin/bash

# Deployment Script for James & Oliver's Wedding Site
# Ensures always-fresh content with proper cache invalidation

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="./dist"
BACKUP_DIR="./backup-$(date +%Y%m%d-%H%M%S)"
DEPLOY_TARGET="${1:-production}"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Pre-deployment checks
log_info "Running pre-deployment checks..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Are you in the project root?"
    exit 1
fi

log_success "Pre-deployment checks passed"

# Step 2: Create backup
log_info "Creating backup of current deployment..."
if [ -d "$BUILD_DIR" ]; then
    cp -r "$BUILD_DIR" "$BACKUP_DIR"
    log_success "Backup created: $BACKUP_DIR"
else
    log_warning "No existing build directory found"
fi

# Step 3: Build assets
log_info "Building assets with content hashing..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    log_error "Build failed - dist directory not created"
    exit 1
fi

log_success "Assets built successfully"

# Step 4: Verify build
log_info "Verifying build output..."

# Check if version.json exists
if [ ! -f "$BUILD_DIR/version.json" ]; then
    log_error "version.json not found in build output"
    exit 1
fi

# Check if HTML files exist
if [ ! -f "$BUILD_DIR/pages/index.html" ]; then
    log_error "Main HTML file not found in build output"
    exit 1
fi

# Check if hashed assets exist
HASHED_ASSETS=$(find "$BUILD_DIR/assets" -name "*.[a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9].*" 2>/dev/null | wc -l)
if [ "$HASHED_ASSETS" -eq 0 ]; then
    log_warning "No hashed assets found - check build process"
fi

log_success "Build verification passed ($HASHED_ASSETS hashed assets found)"

# Step 5: Deploy to target
log_info "Deploying to $DEPLOY_TARGET..."

case $DEPLOY_TARGET in
    "netlify")
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir="$BUILD_DIR"
            log_success "Deployed to Netlify"
        else
            log_error "Netlify CLI not found. Install with: npm install -g netlify-cli"
            exit 1
        fi
        ;;
    "vercel")
        if command -v vercel &> /dev/null; then
            vercel --prod --cwd="$BUILD_DIR"
            log_success "Deployed to Vercel"
        else
            log_error "Vercel CLI not found. Install with: npm install -g vercel"
            exit 1
        fi
        ;;
    "github-pages")
        # Deploy to GitHub Pages
        if [ -d ".git" ]; then
            git add "$BUILD_DIR"
            git commit -m "Deploy: $(date)"
            git subtree push --prefix="$BUILD_DIR" origin gh-pages
            log_success "Deployed to GitHub Pages"
        else
            log_error "Not a git repository"
            exit 1
        fi
        ;;
    "local")
        # Copy to local web server directory
        LOCAL_WEB_DIR="${2:-/var/www/html}"
        if [ -d "$LOCAL_WEB_DIR" ]; then
            sudo cp -r "$BUILD_DIR"/* "$LOCAL_WEB_DIR/"
            log_success "Deployed to local web directory: $LOCAL_WEB_DIR"
        else
            log_error "Local web directory not found: $LOCAL_WEB_DIR"
            exit 1
        fi
        ;;
    *)
        log_warning "Unknown deployment target: $DEPLOY_TARGET"
        log_info "Build completed. Deploy the $BUILD_DIR folder manually."
        ;;
esac

# Step 6: CDN Invalidation
log_info "Invalidating CDN caches..."
if [ -f "invalidate-cdn.js" ]; then
    node invalidate-cdn.js
    log_success "CDN invalidation completed"
else
    log_warning "CDN invalidation script not found"
fi

# Step 7: Post-deployment verification
log_info "Running post-deployment verification..."

# Wait a moment for deployment to propagate
sleep 5

# Check if version.json is accessible (basic health check)
if command -v curl &> /dev/null; then
    # This would need to be updated with actual domain
    log_info "Run manual verification: curl -I https://your-domain.com/version.json"
fi

log_success "Deployment process completed!"

# Step 8: Cleanup
log_info "Cleaning up..."
# Keep only the last 3 backups
ls -t backup-* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true

# Summary
echo ""
echo "🎉 Deployment Summary:"
echo "   Target: $DEPLOY_TARGET"
echo "   Build: $BUILD_DIR"
echo "   Backup: $BACKUP_DIR"
echo "   Hashed Assets: $HASHED_ASSETS"
echo ""
echo "📋 Next Steps:"
echo "   1. Verify deployment at your domain"
echo "   2. Check cache headers with: curl -I https://your-domain.com/pages/index.html"
echo "   3. Test service worker updates"
echo "   4. Monitor for any issues"
echo ""
echo "🔧 If issues occur:"
echo "   - Rollback: cp -r $BACKUP_DIR/* $BUILD_DIR/"
echo "   - Manual CDN invalidation: node invalidate-cdn.js"
echo "   - Check logs and error reports"
