import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import replicate
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for local testing with Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoRequest(BaseModel):
    prompt: str

@app.post("/api/generate-video")
async def generate_video(request: VideoRequest):
    api_token = os.getenv("REPLICATE_API_TOKEN")
    if not api_token:
        raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN missing.")

    try:
        client = replicate.Client(api_token=api_token)

        # Call Wan 2.1 video generation model
        prediction = client.predictions.create(
            version="wan-video/wan-2.1-1.4b",
            input={"prompt": request.prompt}
        )

        # Poll task status until complete
        while prediction.status in ["starting", "processing"]:
            time.sleep(2)
            prediction.reload()

        if prediction.status == "succeeded":
            return {"status": "success", "video_url": prediction.output}
        else:
            raise HTTPException(status_code=500, detail=f"Generation failed: {prediction.error}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
  Add FastAPI main application file
