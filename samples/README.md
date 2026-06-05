# Samples

Place only small, non-confidential sample documents here.

The `generated/` directory contains synthetic PDF and DOCX fixtures for parser,
ingestion, OCR-routing, extraction, and evidence-lineage tests. The current set
has 12 documents across four domains:

- Contracts
- Finance
- Policy
- Research

Regenerate the fixture set with:

```bash
uv run python scripts/generate_sample_documents.py
```

See `generated/manifest.json` for paths, domains, file types, expected text
markers, and feature tags. All fixture content is synthetic.
