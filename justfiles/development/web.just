# Start the Next.js dev server via PM2 with hot-reload
# Usage: just dev
# Example: just dev

dev:
    @echo "\033[0;32m▶ Starting Next.js dev server via PM2...\033[0m"
    pm2 start ecosystem.json
    @echo "\033[0;32m▶ Server running. Status: pm2 status\033[0m"
    @echo "\033[0;32m▶ Logs: pm2 logs demo\033[0m"

# Stop the PM2-managed dev server
# Usage: just stop
# Example: just stop

stop:
    @echo "\033[0;33m⏹ Stopping demo server...\033[0m"
    pm2 stop demo

# Delete the PM2-managed app
# Usage: just delete
# Example: just delete

delete:
    @echo "\033[0;33m🗑 Deleting demo PM2 process...\033[0m"
    pm2 delete demo
