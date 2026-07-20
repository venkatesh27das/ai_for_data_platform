from functools import lru_cache
from pathlib import Path

PROMPT_DIR = Path(__file__).with_name("prompts")


@lru_cache
def load_prompt(name: str) -> str:
    return (PROMPT_DIR / name).read_text(encoding="utf-8").strip()
