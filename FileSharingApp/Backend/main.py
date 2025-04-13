from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timedelta
import os
import shutil
from database import db
from models import FileMetadata
import socket


app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


local_ip = socket.gethostbyname(socket.gethostname())


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    # Save file to the uploads folder
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    
    metadata = FileMetadata(
        filename=file.filename,
        filepath=file_path,
        upload_date=datetime.utcnow(),
        expiry_date=datetime.utcnow() + timedelta(days=7)
    )
    result = db.files.insert_one(metadata.dict())
    file_id = str(result.inserted_id)

    
    shareable_link = f"http://{local_ip}:8000/download/{file_id}"
    
    print(shareable_link)


    
    return {
        "status": "success",
        "message": "File uploaded successfully.",
        "file": {
            "file_id": file_id,
            "filename": file.filename,
            "shareable_link": shareable_link,
            "expiry_date": metadata.expiry_date.isoformat()
        }
    }


@app.get("/download/{file_id}")
async def download_file(file_id: str):
    file_data = db.files.find_one({"_id": ObjectId(file_id)})

    if not file_data:
        raise HTTPException(status_code=404, detail="File not found")

    if datetime.utcnow() > file_data["expiry_date"]:
        raise HTTPException(status_code=403, detail="File link expired")

    return FileResponse(file_data["filepath"], filename=file_data["filename"])


@app.get("/")
def root():
    return {"message": "Welcome to the File Sharing API"}
