import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Use Render's PORT
    uvicorn.run(
        "backend.main:app",  # Use this if main.py is in backend/
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
