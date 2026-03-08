from pydantic import BaseModel
from typing import Literal


class ExportRequest(BaseModel):
    format: Literal["pdf", "excel", "json"]
