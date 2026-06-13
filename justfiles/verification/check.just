# Run type checking, building, and linting in sequence
# Usage: just check

check:
    @echo "Running type checker..."
    @pnpm exec tsc --noEmit
    @echo "Building project..."
    @pnpm build
    @echo "Linting code..."
    @pnpm lint
    @echo "\033[0;32mAll checks passed!\033[0m"
