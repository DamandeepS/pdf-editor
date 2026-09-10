---
id: inq-billeditor-knowledge-bundle
type: index
title: Inq BillEditor Knowledge Graph Bundle
description: Curated Open Knowledge Format (OKF) bundle for the Inq BillEditor monorepo architecture, design token pipeline, UI component library, and vector PDF processing engine.
tags:
  - knowledge-graph
  - okf-spec
  - monorepo
  - architecture
created: 2026-09-10T15:45:00Z
updated: 2026-09-10T15:45:00Z
status: active
version: 1.0.0
---

# Inq BillEditor Knowledge Graph (OKF Bundle)

Welcome to the **Open Knowledge Format (OKF)** bundle for Inq BillEditor. This repository knowledge graph organizes structural metadata, system topology, component contracts, and transformation pipelines into a traversable semantic graph for human engineers and AI agents.

## Knowledge Graph Nodes

- [**System Architecture**](./system-architecture.md): Monorepo workspace topology, dependency graph, package boundaries, and application execution flow.
- [**IPC & Protocol Architecture**](./ipc-architecture.md): Interprocess communication analysis (tRPC vs. MQTT vs. WebSockets), router topologies, and client-server synchronization.
- [**UI Component Library**](./ui-component-graph.md): `@inq/ui` component hierarchy, `@inq/tokens` design token mappings, colocation contracts, and accessibility standards.
- [**Vector PDF Processing Engine**](./pdf-engine-graph.md): Vector PDF assembly pipeline, coordinate inversion transformations (Screen DPI to PDF 72pt), and font embedding.
- [**Change History Log**](./log.md): Record of changes, version updates, and bundle evolution.

## Graph Traversal Convention

As defined by the OKF specification, all inter-concept edges in this bundle are expressed as standard relative Markdown links (e.g., `[label](./target.md)`). Nodes contain YAML frontmatter declaring their unique `id`, `type`, `status`, and metadata attributes.
