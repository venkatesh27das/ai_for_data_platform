# Samples

Place only small, non-confidential sample documents here.

The `generated/` directory contains compact synthetic PDF and DOCX fixtures for
parser, ingestion, OCR-routing, extraction, and evidence-lineage smoke tests.
The current set has 12 documents across four domains, and each file is generated
to render/count as 10-15 pages:

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

The `rich_generated/` directory contains a smaller but more realistic stress
pack with 10-15 page documents, embedded images, charts, diagrams, form-like
tables, signature/receipt images, maps, and varied layouts.

Regenerate the rich fixture set with:

```bash
uv run python scripts/generate_rich_sample_documents.py
```

See `rich_generated/manifest.json` for its feature tags and expected markers.
