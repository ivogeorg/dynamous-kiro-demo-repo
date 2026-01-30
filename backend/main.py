from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="Kaldic API",
    description="AI-Powered Orthomosaic Feature Annotation Backend",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Kaldic API",
        "version": "0.1.0",
        "status": "ready"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "frontend_cors": "enabled",
        "ml_models": "not_loaded"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
