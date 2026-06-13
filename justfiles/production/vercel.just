# Deploy to Vercel as a production deployment with NODE_ENV=production
pub:
	@vercel deploy --prod -b NODE_ENV=production --non-interactive
