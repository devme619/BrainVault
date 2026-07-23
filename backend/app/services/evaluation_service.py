import io
from PIL import Image
import pypdf

def extract_text_from_file(file_bytes: bytes, filename: str, content_type: str) -> dict:
    extracted_text = ""
    pages_processed = 1
    
    if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages_processed = len(pdf_reader.pages)
        text_list = []
        for idx, page in enumerate(pdf_reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_list.append(f"--- Page {idx + 1} ---\n{page_text.strip()}")
        
        extracted_text = "\n\n".join(text_list)
        
    elif content_type.startswith("image/") or filename.lower().endswith((".png", ".jpg", ".jpeg")):
        try:
            import os
            import shutil
            import pytesseract
            if not shutil.which("tesseract"):
                possible_paths = [
                    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                    os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
                ]
                for path in possible_paths:
                    if os.path.exists(path):
                        pytesseract.pytesseract.tesseract_cmd = path
                        break

            image = Image.open(io.BytesIO(file_bytes))
            extracted_text = pytesseract.image_to_string(image)
        except Exception as e:
            extracted_text = f"[Image OCR requires Tesseract OCR engine installed on server: {str(e)}]"

    words = extracted_text.split()
    return {
        "filename": filename,
        "file_type": content_type,
        "extracted_text": extracted_text or "No readable text found in document.",
        "word_count": len(words),
        "character_count": len(extracted_text),
        "pages_processed": pages_processed,
        "status": "success"
    }