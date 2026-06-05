from __future__ import annotations

import hashlib
import re
import zipfile
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from uuid import UUID

from docintel.config import Settings

_SAFE_NAME_PATTERN = re.compile(r"[^A-Za-z0-9._-]+")


class UploadValidationError(ValueError):
    """Raised when an uploaded file fails local validation."""


@dataclass(frozen=True)
class StoredUpload:
    """Metadata for a stored original upload."""

    file_name: str
    file_type: str
    checksum_sha256: str
    storage_uri: str
    size_bytes: int


def sanitize_file_name(file_name: str) -> str:
    """Return a filesystem-safe file name preserving the extension."""

    candidate = Path(file_name).name.strip()
    if not candidate:
        raise UploadValidationError("file name is required")
    sanitized = _SAFE_NAME_PATTERN.sub("_", candidate)
    return sanitized[:180]


def infer_supported_file_type(file_name: str) -> str:
    """Infer the supported document type from a file name."""

    suffix = Path(file_name).suffix.lower()
    if suffix == ".pdf":
        return "pdf"
    if suffix == ".docx":
        return "docx"
    raise UploadValidationError("only .pdf and .docx uploads are supported")


def validate_file_bytes(file_type: str, content: bytes) -> None:
    """Validate file signature for supported document types."""

    if not content:
        raise UploadValidationError("uploaded file is empty")
    if file_type == "pdf" and not content.startswith(b"%PDF-"):
        raise UploadValidationError("PDF upload does not start with a PDF signature")
    if file_type == "docx":
        try:
            with zipfile.ZipFile(BytesIO(content)) as archive:
                names = set(archive.namelist())
        except zipfile.BadZipFile as exc:
            raise UploadValidationError("DOCX upload is not a valid zip container") from exc
        if "[Content_Types].xml" not in names or "word/document.xml" not in names:
            raise UploadValidationError("DOCX upload is missing required Word document parts")


def store_upload(content: bytes, original_file_name: str, settings: Settings) -> StoredUpload:
    """Validate and persist an uploaded original file to local storage."""

    file_name = sanitize_file_name(original_file_name)
    file_type = infer_supported_file_type(file_name)
    if len(content) > settings.max_upload_bytes:
        raise UploadValidationError(f"upload exceeds {settings.max_upload_mb} MB limit")
    validate_file_bytes(file_type, content)

    checksum = hashlib.sha256(content).hexdigest()
    target_dir = settings.uploads_dir / checksum[:2] / checksum[2:4]
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / file_name
    target_path.write_bytes(content)

    return StoredUpload(
        file_name=file_name,
        file_type=file_type,
        checksum_sha256=checksum,
        storage_uri=str(target_path),
        size_bytes=len(content),
    )


def storage_path_for_document(document_id: UUID, storage_uri: str) -> Path:
    """Return the local path for a stored document.

    `document_id` is included so call sites naturally carry lineage context.
    """

    _ = document_id
    return Path(storage_uri)
