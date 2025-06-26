// Common fixes for FUNCTION_INVOCATION_FAILED

// Fix 1: Wrap everything in try-catch
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Fix 2: Add request timeout handling
const TIMEOUT = 25000; // 25 seconds (Vercel limit is 30s)

function withTimeout(promise) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Function timeout')), TIMEOUT)
        )
    ]);
}

module.exports = { withTimeout };
