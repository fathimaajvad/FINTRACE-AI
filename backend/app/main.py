from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import time

from app.detection import analyze_transactions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    start_time = time.time()

    df = pd.read_csv(file.file)

    result = analyze_transactions(df)

    result["summary"]["processing_time_seconds"] = round(time.time() - start_time, 2)

    return result
