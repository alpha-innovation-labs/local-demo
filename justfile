# Default: Show help menu
default:
    @just help

# ============================================================================
# Help Command
# ============================================================================

help:
    @echo ""
    @echo "\033[1;36m======================================\033[0m"
    @echo "\033[1;36m       Project Commands               \033[0m"
    @echo "\033[1;36m======================================\033[0m"
    @echo ""
    @echo "\033[1;35m  Most Common Commands:\033[0m"
    @echo "  just \033[0;33mdev\033[0m                    \033[0;32mStart Next.js dev server (PM2)\033[0m"
    @echo "  just \033[0;33mstop\033[0m                  \033[0;32mStop the dev server\033[0m"
    @echo "  just \033[0;33mdelete\033[0m                \033[0;32mRemove the PM2 process\033[0m"
    @echo "  just \033[0;33mcheck\033[0m                 \033[0;32mType check, build, and lint\033[0m"
    @echo "  just \033[0;33mpub\033[0m                  \033[0;32mDeploy to Vercel (production)\033[0m"
    @echo ""

# ============================================================================
# Development Commands
# ============================================================================

# ============================================================================
# Verification Commands
# ============================================================================

import 'justfiles/verification/check.just'

# ============================================================================
# Production Deployment Commands
# ============================================================================

import 'justfiles/development/web.just'
import 'justfiles/production/vercel.just'
