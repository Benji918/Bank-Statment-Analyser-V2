import os
import io
import logging
from typing import List, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class TextBlock:
    text: str
    x0: float
    y0: float
    x1: float
    y1: float


@dataclass
class ParsedPage:
    page_num: int
    text_blocks: List[TextBlock] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        return " ".join(block.text for block in self.text_blocks)


def parse_pdf(file_bytes: bytes) -> List[ParsedPage]:
    """
    Extract text blocks with bounding box coordinates from a PDF.
    Uses pdfplumber as the primary parser, falls back to PyMuPDF
    for image-heavy PDFs.
    """
    try:
        return _parse_with_pdfplumber(file_bytes)
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}. Falling back to PyMuPDF.")
        return _parse_with_pymupdf(file_bytes)


def _parse_with_pdfplumber(file_bytes: bytes) -> List[ParsedPage]:
    import pdfplumber

    pages: List[ParsedPage] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            words = page.extract_words(x_tolerance=3, y_tolerance=3)
            blocks = [
                TextBlock(
                    text=w["text"],
                    x0=w["x0"],
                    y0=w["top"],
                    x1=w["x1"],
                    y1=w["bottom"],
                )
                for w in words
            ]
            pages.append(ParsedPage(page_num=i, text_blocks=blocks))
    return pages


def _parse_with_pymupdf(file_bytes: bytes) -> List[ParsedPage]:
    import fitz  # PyMuPDF

    pages: List[ParsedPage] = []
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    for i, page in enumerate(doc, start=1):
        blocks_raw = page.get_text("words")  # (x0, y0, x1, y1, word, block_no, line_no, word_no)
        blocks = [
            TextBlock(text=b[4], x0=b[0], y0=b[1], x1=b[2], y1=b[3])
            for b in blocks_raw
        ]
        pages.append(ParsedPage(page_num=i, text_blocks=blocks))
    doc.close()
    return pages
