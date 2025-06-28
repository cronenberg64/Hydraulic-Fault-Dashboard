import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Use PORT env var if available
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,           # Disable reload for production
        log_level="info"
    )
