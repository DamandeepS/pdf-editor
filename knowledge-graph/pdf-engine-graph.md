---
id: pdf-engine-graph
type: processing-pipeline
title: Vector PDF Engine Graph (@inq/pdf-engine)
description: Transformation pipelines, coordinate inversion metrics, and vector assembly stages in @inq/pdf-engine.
tags:
  - pdf
  - pdf-lib
  - fontkit
  - vector
  - pipeline
created: 2026-09-10T15:45:00Z
updated: 2026-09-10T15:45:00Z
status: active
related:
  - ./system-architecture.md
  - ./index.md
---

# PDF Engine Graph (`@inq/pdf-engine`)

This document describes the vector PDF modification pipeline, coordinate transformation logic, and TrueType font embedding workflow. For repository architecture, see [System Architecture](./system-architecture.md).

```mermaid
flowchart TD
    subgraph ClientInput ["Client Canvas Space"]
        CS["Viewport Coordinates<br/>(DPI Scaled, Origin: Top-Left)"]
        DELTA["Modification Delta<br/>(Text Edits, Whiteouts, Image Stamps)"]
    end

    subgraph Transformation ["Coordinate & Metric Transformation"]
        TRANS["Coordinate Inversion & Scale<br/>X_pdf = X_viewport * (72 / dpi)<br/>Y_pdf = PageHeight_pt - (Y_viewport + Height) * (72 / dpi)"]
    end

    subgraph PDFPipeline ["pdf-lib Vector Assembly Pipeline"]
        LOAD["Load Original PDF Buffer<br/>(Preserves original streams, fonts, vectors)"]
        WO["Vector Redaction Layer<br/>Draws precise fill rectangle over old bounding box"]
        FONT["Font Resolver & Embedder<br/>Standard 14 Fonts (Helvetica, Times, Courier)<br/>or Embedded TrueType/OpenType (@pdf-lib/fontkit)"]
        TEXT["Vector Text Injection<br/>Draws new text at exact baseline, fontSize, color, letterSpacing"]
        IMG["Vector Image Embedder<br/>Embeds PNG/JPEG with aspect ratio & coordinates"]
    end

    subgraph Output ["Generated Output"]
        OUT["Pixel-Accurate Native Vector PDF<br/>(Selectable text, crisp lines, zero raster blur)"]
    end

    CS & DELTA --> TRANS
    TRANS --> LOAD
    LOAD --> WO
    WO --> FONT
    FONT --> TEXT
    TEXT --> IMG
    IMG --> OUT
```

---

## Coordinate Mapping Formulas

| Dimension | Viewport Space (Web UI) | PDF Space (pdf-lib) |
| :--- | :--- | :--- |
| **Origin** | Top-Left `(0, 0)` | Bottom-Left `(0, 0)` |
| **Unit** | CSS Pixels (`px`) | Points (`pt`, 72 pt = 1 inch) |
| **X Coordinate** | `x_px` | `x_pt = x_px * scale` |
| **Y Coordinate** | `y_px` (increases downward) | `y_pt = pageHeight_pt - (y_px + height_px) * scale` |
| **Font Size** | `fontSize_px` | `fontSize_pt = fontSize_px * scale` |

Return to [Bundle Index](./index.md).
