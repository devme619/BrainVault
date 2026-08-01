import io
import os
import shutil
from concurrent.futures import ThreadPoolExecutor
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

def process_single_image_ocr(img_bytes: bytes) -> str:
    try:
        if len(img_bytes) < 5000: # Skip tiny icons/lines
            return ""
        image = Image.open(io.BytesIO(img_bytes))
        if image.width < 80 or image.height < 80:
            return ""
            
        # Downscale huge images (> 1600px) to speed up OCR by 5x while preserving high accuracy
        if image.width > 1600:
            ratio = 1600 / float(image.width)
            new_height = int(float(image.height) * ratio)
            image = image.resize((1600, new_height), Image.Resampling.LANCZOS)
            
        text = pytesseract.image_to_string(image, config='--psm 6').strip()
        return text
    except Exception:
        return ""

def process_pdf_page(page_args) -> tuple:
    idx, page = page_args
    page_text = (page.extract_text() or "").strip()
    
    # If page has no embedded text (scanned handwritten PDF), run OCR on page images
    if not page_text and hasattr(page, "images") and page.images:
        ocr_parts = []
        for img_obj in page.images:
            txt = process_single_image_ocr(img_obj.data)
            if txt:
                ocr_parts.append(txt)
        if ocr_parts:
            page_text = "\n".join(ocr_parts)

    if page_text:
        return (idx + 1, f"--- Page {idx + 1} ---\n{page_text}")
    return (idx + 1, "")

def extract_text_from_file(file_bytes: bytes, filename: str, content_type: str) -> dict:
    extracted_text = ""
    pages_processed = 1
    
    is_pdf = content_type == "application/pdf" or filename.lower().endswith(".pdf")
    is_image = content_type.startswith("image/") or filename.lower().endswith((".png", ".jpg", ".jpeg"))

    if is_pdf:
        try:
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            total_pages = len(pdf_reader.pages)
            pages_processed = total_pages
            
            # Cap scanned page processing to first 25 pages to optimize performance
            max_pages = min(total_pages, 25)
            page_items = [(i, pdf_reader.pages[i]) for i in range(max_pages)]
            
            # Execute multi-threaded parallel page extraction & OCR (max 6 workers)
            with ThreadPoolExecutor(max_workers=6) as executor:
                results = list(executor.map(process_pdf_page, page_items))
                
            # Order results by page index
            results.sort(key=lambda x: x[0])
            text_list = [res[1] for res in results if res[1]]
            extracted_text = "\n\n".join(text_list)
        except Exception as e:
            extracted_text = f"[PDF Processing Error: {str(e)}]"
        
    elif is_image:
        try:
            extracted_text = process_single_image_ocr(file_bytes)
            if not extracted_text:
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