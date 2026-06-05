import json

import typer

from docintel.config import Settings

app = typer.Typer(help="Local document intelligence development CLI.")


@app.command()
def health() -> None:
    """Print local application configuration health."""

    settings = Settings()
    settings.ensure_local_directories()
    typer.echo(json.dumps({"status": "ok", "app_env": settings.app_env}))
