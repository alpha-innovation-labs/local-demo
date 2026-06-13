# ============================================================================
# Production Deployment Commands
# ============================================================================

# Deploy to Vercel as a production deployment with NODE_ENV=production
pub:
    @echo "Deploying to Vercel (production)..."
    @vercel deploy --prod -b NODE_ENV=production --non-interactive
