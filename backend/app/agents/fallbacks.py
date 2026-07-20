import re

from app.agents.contracts import (
    AnalysedSource,
    ModellingBrief,
    SourceColumnAnalysis,
    SourceMetadata,
)


def fallback_assumption(error: Exception) -> str:
    return (
        "Structured LLM output was unavailable; a conservative deterministic fallback was "
        f"used ({type(error).__name__})."
    )


def parse_ddl_sources(sources: list[SourceMetadata]) -> list[AnalysedSource]:
    analysed = profile_sources(sources)
    profiled_names = {source.table_name for source in analysed}
    for source in sources:
        for match in re.finditer(
            r"CREATE\s+TABLE\s+(?P<name>[A-Za-z0-9_.]+)\s*\((?P<body>.*?)\)\s*;",
            source.content_excerpt,
            re.IGNORECASE | re.DOTALL,
        ):
            table_name = match.group("name").split(".")[-1]
            if table_name in profiled_names:
                continue
            definitions = split_definitions(match.group("body"))
            columns = [
                definition.split()[0].strip('"`[]')
                for definition in definitions
                if definition
                and not definition.upper().startswith(
                    ("PRIMARY KEY", "FOREIGN KEY", "CONSTRAINT", "UNIQUE", "CHECK")
                )
            ]
            keys = primary_keys(definitions)
            column_profiles = [
                SourceColumnAnalysis(
                    name=column,
                    key_role=(
                        "PK"
                        if any(column in key.split(" + ") for key in keys)
                        else "none"
                    ),
                    nullable=False
                    if any(column in key.split(" + ") for key in keys)
                    else None,
                )
                for column in columns
            ]
            analysed.append(
                AnalysedSource(
                    table_name=table_name,
                    role=infer_role(table_name),
                    column_count=len(columns),
                    columns=columns,
                    candidate_keys=keys,
                    business_keys=infer_business_keys(column_profiles),
                    column_profiles=column_profiles,
                    **history_fields(table_name, column_profiles),
                    description=f"Source table parsed from {source.name}",
                    evidence=[f"DDL supplied in {source.name}"],
                )
            )
    return analysed


def profile_sources(sources: list[SourceMetadata]) -> list[AnalysedSource]:
    analysed: list[AnalysedSource] = []
    for source in sources:
        tables = source.profile.get("tables", [])
        if not isinstance(tables, list):
            continue
        for table in tables:
            if not isinstance(table, dict):
                continue
            columns_data = table.get("columns", [])
            column_profiles = [
                SourceColumnAnalysis.model_validate(column)
                for column in columns_data
                if isinstance(column, dict) and column.get("name")
            ]
            columns = [
                str(column.get("name"))
                for column in columns_data
                if isinstance(column, dict) and column.get("name")
            ]
            table_name = str(table.get("name") or source.name)
            analysed.append(
                AnalysedSource(
                    table_name=table_name,
                    role=infer_role(table_name),
                    column_count=len(columns),
                    columns=columns,
                    candidate_keys=infer_candidate_keys(
                        columns,
                        column_profiles,
                        [str(item) for item in table.get("primary_key", [])],
                    ),
                    business_keys=infer_business_keys(column_profiles),
                    column_profiles=column_profiles,
                    **history_fields(table_name, column_profiles),
                    description=f"Profiled from {source.name}",
                    evidence=[
                        f"Parsed {source.format.upper()} metadata from {source.name}",
                        f"Sampled {int(table.get('row_sample_count') or 0)} rows",
                    ],
                )
            )
    return analysed


def infer_candidate_keys(
    columns: list[str],
    profiles: list[SourceColumnAnalysis] | None = None,
    primary_key: list[str] | None = None,
) -> list[str]:
    if primary_key:
        return [" + ".join(primary_key)]
    scored = [
        profile.name
        for profile in profiles or []
        if profile.key_role in {"PK", "business_key"}
        or (profile.candidate_key_score or 0) >= 0.98
    ]
    if scored:
        return scored[:3]
    candidates = [
        column for column in columns if column.lower() == "id" or column.lower().endswith("_id")
    ]
    return candidates[:3]


def infer_business_keys(profiles: list[SourceColumnAnalysis]) -> list[str]:
    return [
        profile.name
        for profile in profiles
        if profile.key_role == "business_key"
        or (
            (profile.candidate_key_score or 0) >= 0.98
            and profile.name.lower() != "id"
            and not profile.name.lower().endswith("_key")
        )
    ][:5]


def history_fields(
    table_name: str, profiles: list[SourceColumnAnalysis]
) -> dict[str, object]:
    names = {profile.name.lower() for profile in profiles}
    temporal = names & {
        "effective_from",
        "effective_to",
        "valid_from",
        "valid_to",
        "start_date",
        "end_date",
        "is_current",
    }
    role = infer_role(table_name)
    if role != "Master data":
        return {"history_recommendation": "not_applicable", "history_evidence": []}
    if temporal:
        return {
            "history_recommendation": "type_2",
            "history_evidence": [
                "Temporal columns detected: " + ", ".join(sorted(temporal))
            ],
        }
    return {
        "history_recommendation": "type_1",
        "history_evidence": ["No temporal history columns were profiled"],
    }


def named_sources(brief: ModellingBrief) -> list[AnalysedSource]:
    return [
        AnalysedSource(
            table_name=name,
            role=infer_role(name),
            column_count=0,
            columns=[],
            candidate_keys=[],
            description="Named by the modeller; column metadata was not supplied",
            evidence=["Named in the modelling brief"],
        )
        for name in brief.source_objects
    ]


def split_definitions(body: str) -> list[str]:
    definitions: list[str] = []
    current: list[str] = []
    depth = 0
    for character in body:
        if character == "(":
            depth += 1
        elif character == ")":
            depth = max(0, depth - 1)
        if character == "," and depth == 0:
            definitions.append("".join(current).strip())
            current = []
        else:
            current.append(character)
    if current:
        definitions.append("".join(current).strip())
    return definitions


def primary_keys(definitions: list[str]) -> list[str]:
    keys: list[str] = []
    for definition in definitions:
        upper = definition.upper()
        if upper.startswith("PRIMARY KEY"):
            match = re.search(r"\((.*?)\)", definition)
            if match:
                keys.append(" + ".join(part.strip() for part in match.group(1).split(",")))
        elif "PRIMARY KEY" in upper:
            keys.append(definition.split()[0].strip('"`[]'))
    return keys


def infer_role(table_name: str) -> str:
    normalized = table_name.upper()
    if normalized in {"VBAP", "VBRP", "EKPO"} or any(
        token in normalized for token in ("ITEM", "LINE", "TRANSACTION", "FACT")
    ):
        return "Transaction"
    if normalized in {"VBAK", "VBRK", "EKKO"} or "HEADER" in normalized:
        return "Header"
    if normalized in {"KNA1", "MARA", "LFA1"} or any(
        token in normalized for token in ("CUSTOMER", "PRODUCT", "MATERIAL", "MASTER")
    ):
        return "Master data"
    if normalized.startswith("T") or any(token in normalized for token in ("REFERENCE", "LOOKUP")):
        return "Reference"
    return "Unknown"


def safe_identifier(value: str, *, fallback: str) -> str:
    words = re.findall(r"[A-Za-z0-9]+", value)
    return "".join(word[:1].upper() + word[1:] for word in words) or fallback


def snake_identifier(value: str, *, fallback: str) -> str:
    words = re.findall(r"[A-Za-z0-9]+", value)
    return "_".join(word.lower() for word in words) or fallback
