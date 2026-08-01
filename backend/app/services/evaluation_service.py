import io
import os
import shutil
from PIL import Image
import pypdf
import pytesseract

# Configure Tesseract path on Windows if not in PATH
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

def extract_text_from_file(file_bytes: bytes, filename: str, content_type: str) -> dict:
    extracted_text = ""
    pages_processed = 1
    
    is_pdf = content_type == "application/pdf" or filename.lower().endswith(".pdf")
    is_image = content_type.startswith("image/") or filename.lower().endswith((".png", ".jpg", ".jpeg"))

    if is_pdf:
        try:
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            pages_processed = len(pdf_reader.pages)
            text_list = []

            for idx, page in enumerate(pdf_reader.pages):
                page_text = (page.extract_text() or "").strip()
                
                # If page has no embedded text (scanned handwritten PDF), run OCR on page images
                if not page_text and hasattr(page, "images") and page.images:
                    ocr_parts = []
                    for img_obj in page.images:
                        try:
                            image = Image.open(io.BytesIO(img_obj.data))
                            ocr_txt = pytesseract.image_to_string(image).strip()
                            if ocr_txt:
                                ocr_parts.append(ocr_txt)
                        except Exception:
                            pass
                    if ocr_parts:
                        page_text = "\n".join(ocr_parts)

                if page_text:
                    text_list.append(f"--- Page {idx + 1} ---\n{page_text}")
            
            extracted_text = "\n\n".join(text_list)
        except Exception as e:
            extracted_text = f"[PDF Processing Error: {str(e)}]"
        
    elif is_image:
        try:
            image = Image.open(io.BytesIO(file_bytes))
            extracted_text = pytesseract.image_to_string(image).strip()
        except Exception as e:
            extracted_text = f"[Image OCR Engine Error: {str(e)}]"

    words = extracted_text.split() if extracted_text else []
    
    return {
        "filename": filename,
        "file_type": content_type,
        "extracted_text": extracted_text if extracted_text else "No readable text found in document.",
        "word_count": len(words),
        "character_count": len(extracted_text),
        "pages_processed": pages_processed,
        "status": "success"
    }