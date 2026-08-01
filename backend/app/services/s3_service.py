import os
import uuid
import boto3
from botocore.config import Config
from typing import Dict, Any

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def upload_file_to_cloud(file_bytes: bytes, filename: str, content_type: str) -> Dict[str, str]:
    """
    Uploads document to Cloudflare R2 / AWS S3 bucket.
    Reads environment variables:
      - R2_ACCESS_KEY_ID or AWS_ACCESS_KEY_ID
      - R2_SECRET_ACCESS_KEY or AWS_SECRET_ACCESS_KEY
      - R2_ENDPOINT_URL (e.g. https://<account_id>.r2.cloudflarestorage.com)
      - R2_BUCKET_NAME or AWS_STORAGE_BUCKET_NAME
      - R2_PUBLIC_DOMAIN (e.g. https://pub-xxx.r2.dev or custom domain)
    If cloud keys are not configured, uses local uploads directory fallback.
    """
    access_key = os.getenv("R2_ACCESS_KEY_ID") or os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("R2_SECRET_ACCESS_KEY") or os.getenv("AWS_SECRET_ACCESS_KEY")
    endpoint_url = os.getenv("R2_ENDPOINT_URL")
    bucket_name = os.getenv("R2_BUCKET_NAME") or os.getenv("AWS_STORAGE_BUCKET_NAME")
    public_domain = os.getenv("R2_PUBLIC_DOMAIN") or os.getenv("S3_PUBLIC_DOMAIN")
    region_name = os.getenv("AWS_REGION", "auto")

    ext = os.path.splitext(filename)[1]
    unique_key = f"notes/{uuid.uuid4().hex}{ext}"

    if access_key and secret_key and bucket_name:
        try:
            s3_config = Config(s3={'addressing_style': 'path'}) if endpoint_url else None
            
            s3_client = boto3.client(
                's3',
                endpoint_url=endpoint_url,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name=region_name,
                config=s3_config
            )

            s3_client.put_object(
                Bucket=bucket_name,
                Key=unique_key,
                Body=file_bytes,
                ContentType=content_type or 'application/octet-stream'
            )

            if public_domain:
                file_url = f"{public_domain.rstrip('/')}/{unique_key}"
            elif endpoint_url:
                file_url = f"{endpoint_url.rstrip('/')}/{bucket_name}/{unique_key}"
            else:
                file_url = f"https://{bucket_name}.s3.{region_name}.amazonaws.com/{unique_key}"

            print(f"[CLOUD SUCCESS] Uploaded file to Cloud Storage S3/R2: {file_url}")
            return {
                "file_url": file_url,
                "file_name": filename,
                "file_type": content_type,
                "storage_provider": "Cloudflare R2 / S3"
            }
        except Exception as e:
            print(f"[CLOUD UPLOAD WARNING] S3/R2 upload failed: {e}. Falling back to local storage.")

    # Local fallback if cloud keys are not configured yet
    local_filename = f"{uuid.uuid4().hex}{ext}"
    local_filepath = os.path.join(UPLOAD_DIR, local_filename)
    with open(local_filepath, "wb") as f:
        f.write(file_bytes)

    base_api = os.getenv("PUBLIC_API_URL", "http://localhost:8000")
    file_url = f"{base_api.rstrip('/')}/uploads/{local_filename}"

    return {
        "file_url": file_url,
        "file_name": filename,
        "file_type": content_type,
        "storage_provider": "Local Storage"
    }
