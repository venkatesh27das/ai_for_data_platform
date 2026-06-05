from __future__ import annotations

import socket
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class Service:
    name: str
    host: str
    port: int


SERVICES = (
    Service("postgres", "localhost", 5432),
    Service("redis", "localhost", 6379),
    Service("qdrant", "localhost", 6333),
    Service("neo4j", "localhost", 7687),
    Service("minio", "localhost", 9000),
)


def is_open(host: str, port: int, timeout_seconds: float = 1.0) -> bool:
    """Return whether a TCP endpoint accepts connections."""

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(timeout_seconds)
        return sock.connect_ex((host, port)) == 0


def main() -> None:
    deadline = time.monotonic() + 90
    pending = set(SERVICES)
    while pending and time.monotonic() < deadline:
        pending = {service for service in pending if not is_open(service.host, service.port)}
        if pending:
            time.sleep(2)

    if pending:
        names = ", ".join(sorted(service.name for service in pending))
        raise SystemExit(f"timed out waiting for services: {names}")

    print("all local services are reachable")


if __name__ == "__main__":
    main()
