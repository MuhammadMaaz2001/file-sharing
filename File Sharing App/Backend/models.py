from pydantic import BaseModel
from datetime import datetime


class FileMetadata(BaseModel):
    filename: str
    filepath: str
    upload_date: datetime
    expiry_date: datetime
