#!/usr/bin/env python3
"""Build the narrated Enterprise Knowledge Assembly Studio demo video."""

from __future__ import annotations

import argparse
import subprocess
import tempfile
import wave
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "docs" / "walkthrough-assets"
OUTPUT = ROOT / "docs" / "Enterprise-Knowledge-Assembly-Studio-Demo.mp4"
CAPTIONS = ROOT / "docs" / "Enterprise-Knowledge-Assembly-Studio-Demo.srt"
POSTER = ROOT / "docs" / "Enterprise-Knowledge-Assembly-Studio-Demo-Poster.jpg"
DEFAULT_FFMPEG = Path(
    "/private/tmp/codex-video-tools/node_modules/ffmpeg-static/ffmpeg"
)

WIDTH = 1920
HEIGHT = 1080
FPS = 24
VOICE = "Samantha"
VOICE_RATE = "168"

INK = "#111827"
SLATE = "#475569"
MUTED = "#64748B"
ORANGE = "#F4511E"
ORANGE_DARK = "#D93E0B"
ORANGE_PALE = "#FFF1EB"
GREEN = "#15803D"
BLUE = "#2563EB"
PAGE = "#F5F7FA"
WHITE = "#FFFFFF"
NAVY = "#0F172A"
BORDER = "#D9DEE7"

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


@dataclass(frozen=True)
class Scene:
    title: str
    route: str
    image: str | None
    bullets: tuple[str, ...]
    narration: tuple[str, ...]
    chapter: str


SCENES = (
    Scene(
        title="Enterprise Knowledge Assembly Studio",
        route="Conference demonstration",
        image=None,
        chapter="INTRODUCTION",
        bullets=(
            "Governed enterprise assets",
            "Reusable knowledge products",
            "Customer 360 implementation example",
        ),
        narration=(
            "Welcome to Enterprise Knowledge Assembly Studio.",
            "This prototype demonstrates how an enterprise connects governed outputs from existing data, metadata, master data, lineage, semantic, document, and graph platforms.",
            "Customer 360 is the implementation example, while the studio and its project workflow remain generic.",
        ),
    ),
    Scene(
        title="Start from the enterprise workspace",
        route="/",
        image="01-home.jpg",
        chapter="ORIENT",
        bullets=(
            "Enterprise-wide health at a glance",
            "Launch a new knowledge project",
            "Continue the Customer 360 example",
        ),
        narration=(
            "The Home page is the launch point for the entire experience.",
            "Its compact navigation stays focused on projects, enterprise assets, knowledge products, and administration.",
            "The summary cards establish the connected story: discover governed assets, assemble knowledge, validate it, publish it, and measure consumption.",
        ),
    ),
    Scene(
        title="Review the project portfolio",
        route="/projects",
        image="02-projects.jpg",
        chapter="ORIENT",
        bullets=(
            "One focused implementation example",
            "Visible readiness and review status",
            "New project remains available",
        ),
        narration=(
            "Knowledge Projects shows the governed assembly initiatives in the organization.",
            "The prototype contains one active example, Customer 360, so the conference story remains focused and internally consistent.",
            "A presenter can open the existing project or choose New Knowledge Project to recreate it through the guided workflow.",
        ),
    ),
    Scene(
        title="Explore governed enterprise assets",
        route="/assets",
        image="03-enterprise-assets.jpg",
        chapter="DISCOVER",
        bullets=(
            "Outputs from existing enterprise platforms",
            "Filter by source, domain, role, and quality",
            "Inspect readiness before selection",
        ),
        narration=(
            "Enterprise Assets is the governed inventory available for knowledge assembly.",
            "Source-system identities make it clear that the studio orchestrates existing platform outputs rather than replacing those systems.",
            "Teams can filter by source, domain, knowledge role, status, and quality before including an asset in a project.",
        ),
    ),
    Scene(
        title="Inspect reusable knowledge products",
        route="/products",
        image="04-knowledge-products.jpg",
        chapter="DISCOVER",
        bullets=(
            "Published and in-progress products",
            "Endpoints, consumers, and governance",
            "Contextual inspector for details",
        ),
        narration=(
            "Knowledge Products represents the reusable result of an assembly project.",
            "The Customer 360 product exposes its version, quality, serving endpoints, active consumers, and governance state.",
            "The right-side inspector gives decision makers enough context without leaving the portfolio view.",
        ),
    ),
    Scene(
        title="Define scope and domains",
        route="/projects/new",
        image="05-wizard-scope.jpg",
        chapter="CREATE",
        bullets=(
            "Business objective and domain boundaries",
            "Target consumers and key questions",
            "Sensitivity and approval expectations",
        ),
        narration=(
            "Project creation begins with business scope, not technical configuration.",
            "The owner defines the objective, domain boundaries, target consumers, key business questions, and the expected knowledge product.",
            "Customer 360 values are pre-seeded for a reliable demonstration, but every field remains part of a generic project workflow.",
        ),
    ),
    Scene(
        title="Connect sources and select assets",
        route="/projects/new · Sources & Assets",
        image="06-wizard-sources.jpg",
        chapter="CREATE",
        bullets=(
            "Connected source-system health",
            "Include or exclude governed assets",
            "Auditable recommendations",
        ),
        narration=(
            "The second step connects enterprise source systems and presents discovered assets for selection.",
            "Users can search, filter, include, or exclude assets while monitoring relevance and role coverage.",
            "Agent recommendations remain auditable suggestions and can be accepted only when they improve the intended outcome.",
        ),
    ),
    Scene(
        title="Set measurable success criteria",
        route="/projects/new · Success Criteria",
        image="07-wizard-success.jpg",
        chapter="CREATE",
        bullets=(
            "Quality and retrieval targets",
            "Measurement methods and criticality",
            "Publication acceptance criteria",
        ),
        narration=(
            "Success Criteria translates the business objective into measurable targets.",
            "Entity resolution, provenance, relationship validity, policy coverage, retrieval quality, freshness, and availability each have an explicit threshold and measurement method.",
            "These targets later drive validation results and publishing gates.",
        ),
    ),
    Scene(
        title="Configure governance and access",
        route="/projects/new · Governance & Access",
        image="08-wizard-governance.jpg",
        chapter="CREATE",
        bullets=(
            "Classifications and policy tags",
            "Owners, stewards, and access groups",
            "Approval workflow before publishing",
        ),
        narration=(
            "Governance is configured before assembly begins.",
            "The project records classifications, policy tags, business ownership, technical ownership, stewardship, access groups, and approval requirements.",
            "Sensitive and personally identifiable information therefore remains governed throughout modelling, validation, publishing, and consumption.",
        ),
    ),
    Scene(
        title="Review and create the project",
        route="/projects/new · Review & Create",
        image="09-wizard-review.jpg",
        chapter="CREATE",
        bullets=(
            "Complete configuration summary",
            "Return to any step without losing work",
            "Start governed initialization",
        ),
        narration=(
            "The final wizard step summarizes scope, assets, success criteria, and governance controls.",
            "Each section can be edited before creation without losing the rest of the configuration.",
            "Create Project starts deterministic enterprise services and records their observable execution evidence.",
        ),
    ),
    Scene(
        title="Monitor project initialization",
        route="/projects/new · Initialization",
        image="10-project-initialization.jpg",
        chapter="ASSEMBLE",
        bullets=(
            "Visible initialization stages",
            "Governed services and event evidence",
            "Reliable deterministic demo progress",
        ),
        narration=(
            "Initialization makes the automated work visible without presenting agents as conversational characters.",
            "The status view follows asset discovery, semantic mapping, graph construction, validation, and draft publication.",
            "Activated services and event evidence show what is running, what is queued, and when human review will be required.",
        ),
    ),
    Scene(
        title="Read the Customer 360 overview",
        route="/projects/customer-360",
        image="11-project-overview.jpg",
        chapter="ASSEMBLE",
        bullets=(
            "Progress, entities, relationships, and quality",
            "Health, timeline, and source coverage",
            "Next governed actions",
        ),
        narration=(
            "The project Overview is the shared status page for the Customer 360 assembly.",
            "It brings together current progress, assets, entities, relationships, quality, freshness, health, activity, and source coverage.",
            "Next Governed Actions and quick links move the operator into the correct project workspace tab.",
        ),
    ),
    Scene(
        title="Manage project assets and sources",
        route="/projects/customer-360/assets",
        image="12-assets-sources.jpg",
        chapter="ASSEMBLE",
        bullets=(
            "Project-scoped source health",
            "Selected asset inventory",
            "Coverage-driven recommendations",
        ),
        narration=(
            "Assets and Sources narrows the enterprise inventory to the current project.",
            "Operators can monitor connection health, search the selected inventory, and inspect readiness by source, domain, and knowledge role.",
            "Coverage recommendations identify high-impact missing assets while preserving human control.",
        ),
    ),
    Scene(
        title="Explore the knowledge graph",
        route="/projects/customer-360/graph",
        image="13-graph-model.jpg",
        chapter="MODEL",
        bullets=(
            "Industry-style connected graph",
            "Business, semantic, governance, and application layers",
            "Provenance and contextual inspection",
        ),
        narration=(
            "Graph and Model presents Customer 360 as an enterprise knowledge graph rather than a simple database diagram.",
            "Business entities, semantic assets, governance controls, knowledge products, and applications are connected with labelled directional relationships.",
            "Search, focus, zoom, layouts, layer controls, and the inspector support professional graph investigation.",
        ),
    ),
    Scene(
        title="Run Build and Govern",
        route="/projects/customer-360/build",
        image="14-build-govern.jpg",
        chapter="GOVERN",
        bullets=(
            "Run the assembly pipeline",
            "Review mappings and recommendations",
            "Inspect governed service evidence",
        ),
        narration=(
            "Build and Govern assembles semantic assets and attaches the required controls.",
            "The pipeline makes concept extraction, entity alignment, semantic mapping, relationship inference, policy attachment, and provenance assembly visible.",
            "Every service run exposes objective, inputs, tools, output, evidence, confidence, duration, status, and human-review requirement.",
        ),
    ),
    Scene(
        title="Validate quality and monitoring",
        route="/projects/customer-360/quality",
        image="15-quality-monitoring.jpg",
        chapter="VALIDATE",
        bullets=(
            "Quality dimensions and trend",
            "Pipeline and freshness monitoring",
            "Resolve findings before publication",
        ),
        narration=(
            "Quality and Monitoring closes the loop with the success criteria defined during project creation.",
            "The screen combines the overall score, quality dimensions, check outcomes, issue severity, pipeline health, and source freshness.",
            "Critical findings must be resolved before the knowledge product can move through its publication gate.",
        ),
    ),
    Scene(
        title="Publish and serve the product",
        route="/projects/customer-360/publish",
        image="16-publish-serve.jpg",
        chapter="PUBLISH",
        bullets=(
            "Governed release pipeline",
            "Published artifacts and endpoints",
            "Consumers, policies, and deployment history",
        ),
        narration=(
            "Publish and Serve promotes an approved assembly version into governed endpoints.",
            "The release retains its quality evidence, provenance, policy bindings, access controls, ownership, and version history.",
            "Applications, analytics, copilots, and agents can consume graph, retrieval, vector-search, and service endpoints without receiving an unmanaged data export.",
        ),
    ),
    Scene(
        title="Measure usage and insights",
        route="/projects/customer-360/usage",
        image="17-usage-insights.jpg",
        chapter="MEASURE",
        bullets=(
            "Adoption and endpoint consumption",
            "Applications, assets, and geography",
            "Search insights for the next version",
        ),
        narration=(
            "Usage and Insights measures whether the published product is creating value.",
            "Adoption, applications, endpoint calls, response time, satisfaction, consumer types, geography, and top knowledge assets are visible together.",
            "Search behavior and unmet queries become inputs to the next governed assembly cycle.",
        ),
    ),
    Scene(
        title="Audit activity and agent runs",
        route="/projects/customer-360/activity",
        image="18-activity.jpg",
        chapter="OPERATE",
        bullets=(
            "User, system, pipeline, and quality events",
            "Filterable auditable activity",
            "No hidden chain of thought",
        ),
        narration=(
            "Activity provides the operational audit trail for the project.",
            "Teams can filter user actions, system events, pipeline runs, and quality checks, then inspect the evidence associated with a governed service run.",
            "The experience intentionally exposes observable execution facts, not hidden chain of thought.",
        ),
    ),
    Scene(
        title="Configure project settings",
        route="/projects/customer-360/settings",
        image="19-settings.jpg",
        chapter="OPERATE",
        bullets=(
            "Project metadata and integrations",
            "Build, access, and notification defaults",
            "Versioning and lifecycle controls",
        ),
        narration=(
            "Project Settings keeps operational configuration inside the project workspace.",
            "Owners can manage metadata, integrations, synchronization behavior, access defaults, approvals, notifications, versioning, and lifecycle controls.",
            "Platform-wide concerns remain separated in top-level administration.",
        ),
    ),
    Scene(
        title="From governed assets to measurable knowledge",
        route="End of demonstration",
        image=None,
        chapter="SUMMARY",
        bullets=(
            "Connect existing enterprise capabilities",
            "Attach governance and evidence throughout",
            "Publish reusable, measurable knowledge products",
        ),
        narration=(
            "Enterprise Knowledge Assembly Studio connects the outputs of capabilities the enterprise already owns.",
            "Governance, lineage, quality, and execution evidence remain attached throughout the workflow rather than being added after publication.",
            "The result is a reusable and measurable knowledge product for retrieval, copilots, analytics, applications, and governed agents.",
            "Thank you for watching.",
        ),
    ),
)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def wrap_lines(
    draw: ImageDraw.ImageDraw,
    text: str,
    selected_font: ImageFont.FreeTypeFont,
    max_width: int,
) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        trial = " ".join(current + [word])
        if draw.textbbox((0, 0), trial, font=selected_font)[2] <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    selected_font: ImageFont.FreeTypeFont,
    fill: str,
    max_width: int,
    spacing: int = 8,
    max_lines: int | None = None,
) -> int:
    lines = wrap_lines(draw, text, selected_font, max_width)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        final = lines[-1]
        while draw.textbbox((0, 0), final + "…", font=selected_font)[2] > max_width:
            final = final[:-1]
        lines[-1] = final + "…"
    x, y = xy
    line_height = selected_font.size + spacing
    for line in lines:
        draw.text((x, y), line, font=selected_font, fill=fill)
        y += line_height
    return y


def draw_brand_mark(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    points = ((x, y + 16), (x + 18, y), (x + 36, y + 16))
    draw.line(points, fill=ORANGE, width=4)
    for px, py in points:
        draw.ellipse((px - 6, py - 6, px + 6, py + 6), fill=WHITE, outline=ORANGE, width=4)


def regular_frame(scene: Scene, scene_index: int, caption: str) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), PAGE)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, WIDTH, 8), fill=ORANGE)
    draw.rectangle((0, 8, WIDTH, 138), fill=WHITE)
    draw.line((0, 137, WIDTH, 137), fill=BORDER, width=2)

    draw_brand_mark(draw, 45, 47)
    draw.text((98, 31), "ENTERPRISE KNOWLEDGE", font=font(20, True), fill=INK)
    draw.text((98, 58), "ASSEMBLY STUDIO", font=font(16, True), fill=ORANGE_DARK)

    draw.text((388, 27), scene.title, font=font(36, True), fill=INK)
    draw.rounded_rectangle((388, 78, 1085, 116), radius=14, fill="#EEF2F7")
    draw.text((408, 84), scene.route, font=font(19, True), fill=BLUE)

    progress = f"{scene_index + 1:02d} / {len(SCENES):02d}"
    draw.text((1760, 38), progress, font=font(20, True), fill=MUTED)
    progress_left = 1590
    progress_width = 250
    draw.rounded_rectangle(
        (progress_left, 83, progress_left + progress_width, 93),
        radius=5,
        fill="#E2E8F0",
    )
    completed = progress_width * (scene_index + 1) / len(SCENES)
    draw.rounded_rectangle(
        (progress_left, 83, progress_left + completed, 93),
        radius=5,
        fill=ORANGE,
    )

    screenshot = Image.open(ASSETS / scene.image).convert("RGB")
    screenshot = screenshot.resize((1280, 800), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", (1300, 820), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        (12, 12, 1292, 812), radius=18, fill=(15, 23, 42, 32)
    )
    canvas.paste(shadow, (28, 148), shadow)
    canvas.paste(screenshot, (38, 158))
    draw.rounded_rectangle((38, 158, 1318, 958), radius=12, outline=BORDER, width=2)

    panel = (1350, 158, 1882, 958)
    draw.rounded_rectangle(panel, radius=18, fill=WHITE, outline=BORDER, width=2)
    draw.text((1384, 188), scene.chapter, font=font(16, True), fill=ORANGE_DARK)
    draw.text((1384, 222), "ON THIS SCREEN", font=font(26, True), fill=INK)
    draw.line((1384, 266, 1848, 266), fill=BORDER, width=2)

    y = 304
    for number, bullet in enumerate(scene.bullets, start=1):
        draw.ellipse((1384, y, 1422, y + 38), fill=ORANGE_PALE)
        badge = str(number)
        badge_width = draw.textbbox((0, 0), badge, font=font(18, True))[2]
        draw.text(
            (1403 - badge_width / 2, y + 8),
            badge,
            font=font(18, True),
            fill=ORANGE_DARK,
        )
        y = draw_wrapped(
            draw,
            (1440, y + 2),
            bullet,
            font(22, True),
            INK,
            395,
            spacing=8,
            max_lines=3,
        )
        y += 36

    draw.rounded_rectangle((1384, 795, 1848, 910), radius=14, fill="#F0FDF4")
    draw.ellipse((1406, 821, 1434, 849), fill="#DCFCE7")
    draw.ellipse((1413, 828, 1427, 842), fill=GREEN)
    draw.text((1448, 816), "CONNECTED STORY", font=font(15, True), fill=GREEN)
    draw_wrapped(
        draw,
        (1406, 853),
        "Discover → assemble → govern → validate → publish → measure",
        font(18, True),
        SLATE,
        414,
        spacing=6,
        max_lines=2,
    )

    draw.rectangle((0, 974, WIDTH, HEIGHT), fill=NAVY)
    draw.rectangle((0, 974, 14, HEIGHT), fill=ORANGE)
    caption_font = font(28, True)
    caption_lines = wrap_lines(draw, caption, caption_font, 1780)
    line_height = 37
    total_height = len(caption_lines) * line_height
    caption_y = 974 + (106 - total_height) // 2
    for line in caption_lines[:2]:
        draw.text((72, caption_y), line, font=caption_font, fill=WHITE)
        caption_y += line_height
    return canvas


def title_frame(scene: Scene, scene_index: int, caption: str) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), NAVY)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, 18, HEIGHT), fill=ORANGE)
    draw.rectangle((18, 0, WIDTH, 8), fill=ORANGE)

    draw_brand_mark(draw, 88, 86)
    draw.text((142, 68), "ENTERPRISE KNOWLEDGE", font=font(24, True), fill=WHITE)
    draw.text((142, 101), "ASSEMBLY STUDIO", font=font(19, True), fill=ORANGE)

    draw.text((90, 248), scene.chapter, font=font(22, True), fill=ORANGE)
    draw_wrapped(
        draw,
        (90, 298),
        scene.title,
        font(64, True),
        WHITE,
        1320,
        spacing=14,
        max_lines=3,
    )
    draw.rounded_rectangle((90, 515, 780, 563), radius=18, fill="#1E293B")
    draw.text((116, 524), scene.route, font=font(22, True), fill="#93C5FD")

    y = 640
    for bullet in scene.bullets:
        draw.ellipse((96, y + 5, 114, y + 23), fill=ORANGE)
        draw.text((140, y), bullet, font=font(28, True), fill="#E2E8F0")
        y += 66

    progress = f"{scene_index + 1:02d} / {len(SCENES):02d}"
    draw.text((1698, 90), progress, font=font(22, True), fill="#94A3B8")

    draw.rectangle((18, 942, WIDTH, HEIGHT), fill="#111C31")
    draw.rectangle((18, 942, 32, HEIGHT), fill=ORANGE)
    caption_font = font(30, True)
    lines = wrap_lines(draw, caption, caption_font, 1760)
    line_height = 41
    total_height = len(lines) * line_height
    y = 942 + (138 - total_height) // 2
    for line in lines[:2]:
        draw.text((88, y), line, font=caption_font, fill=WHITE)
        y += line_height
    return canvas


def create_frame(
    scene: Scene, scene_index: int, sentence: str, path: Path
) -> None:
    image = (
        title_frame(scene, scene_index, sentence)
        if scene.image is None
        else regular_frame(scene, scene_index, sentence)
    )
    image.save(path, format="PNG", optimize=True)


def synthesize(sentence: str, output_path: Path) -> float:
    subprocess.run(
        [
            "say",
            "-v",
            VOICE,
            "-r",
            VOICE_RATE,
            "-o",
            str(output_path),
            "--file-format=WAVE",
            "--data-format=LEI16@22050",
            sentence,
        ],
        check=True,
    )
    with wave.open(str(output_path), "rb") as audio:
        return audio.getnframes() / audio.getframerate()


def encode_segment(
    ffmpeg: Path,
    frame_path: Path,
    audio_path: Path,
    duration: float,
    output_path: Path,
) -> None:
    subprocess.run(
        [
            str(ffmpeg),
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-loop",
            "1",
            "-framerate",
            str(FPS),
            "-i",
            str(frame_path),
            "-i",
            str(audio_path),
            "-filter_complex",
            "[1:a]apad=pad_dur=0.45,aresample=48000[a]",
            "-map",
            "0:v",
            "-map",
            "[a]",
            "-t",
            f"{duration:.3f}",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-tune",
            "stillimage",
            "-crf",
            "21",
            "-pix_fmt",
            "yuv420p",
            "-r",
            str(FPS),
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-ar",
            "48000",
            "-ac",
            "2",
            str(output_path),
        ],
        check=True,
    )


def srt_time(seconds: float) -> str:
    milliseconds = round(seconds * 1000)
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    secs, millis = divmod(remainder, 1000)
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"


def build(ffmpeg: Path) -> None:
    if not ffmpeg.exists():
        raise FileNotFoundError(
            f"ffmpeg was not found at {ffmpeg}. Install ffmpeg-static first."
        )
    for scene in SCENES:
        if scene.image and not (ASSETS / scene.image).exists():
            raise FileNotFoundError(ASSETS / scene.image)

    caption_rows: list[tuple[float, float, str]] = []
    elapsed = 0.0

    with tempfile.TemporaryDirectory(
        prefix="knowledge-studio-video-", dir="/private/tmp"
    ) as temp_name:
        temp = Path(temp_name)
        segment_paths: list[Path] = []
        segment_number = 0

        for scene_index, scene in enumerate(SCENES):
            for sentence in scene.narration:
                segment_number += 1
                stem = f"{segment_number:03d}"
                frame_path = temp / f"{stem}.png"
                audio_path = temp / f"{stem}.wav"
                segment_path = temp / f"{stem}.mp4"

                create_frame(scene, scene_index, sentence, frame_path)
                audio_duration = synthesize(sentence, audio_path)
                duration = max(audio_duration + 0.45, 2.2)
                encode_segment(
                    ffmpeg,
                    frame_path,
                    audio_path,
                    duration,
                    segment_path,
                )
                segment_paths.append(segment_path)
                caption_rows.append((elapsed, elapsed + audio_duration, sentence))
                elapsed += duration
                print(
                    f"[{segment_number:03d}] {scene.chapter}: "
                    f"{audio_duration:.1f}s narration"
                )

        concat_file = temp / "segments.txt"
        concat_file.write_text(
            "".join(f"file '{path.as_posix()}'\n" for path in segment_paths),
            encoding="utf-8",
        )
        subprocess.run(
            [
                str(ffmpeg),
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat_file),
                "-c",
                "copy",
                "-movflags",
                "+faststart",
                str(OUTPUT),
            ],
            check=True,
        )

    srt_parts = []
    for index, (start, end, sentence) in enumerate(caption_rows, start=1):
        srt_parts.append(
            f"{index}\n{srt_time(start)} --> {srt_time(end)}\n{sentence}\n"
        )
    CAPTIONS.write_text("\n".join(srt_parts), encoding="utf-8")

    poster = title_frame(SCENES[0], 0, "From governed assets to measurable knowledge")
    poster.save(POSTER, format="JPEG", quality=92, optimize=True)

    print(f"Video: {OUTPUT}")
    print(f"Captions: {CAPTIONS}")
    print(f"Poster: {POSTER}")
    print(f"Duration: {elapsed / 60:.1f} minutes")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--ffmpeg",
        type=Path,
        default=DEFAULT_FFMPEG,
        help="Path to the ffmpeg executable.",
    )
    args = parser.parse_args()
    build(args.ffmpeg.resolve())


if __name__ == "__main__":
    main()
