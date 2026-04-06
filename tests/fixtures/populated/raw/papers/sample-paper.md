# Deterministic Control Planes for AI Agent Systems

**Authors:** A. Researcher, B. Scientist
**Published:** 2026-01-15
**Journal:** Proceedings of Agent Architecture Workshop

## Abstract

We present an architectural pattern for AI agent systems that separates deterministic control (state management, policy enforcement, audit logging) from probabilistic reasoning (content generation, synthesis, question answering). This separation ensures that trust-critical operations such as provenance tracking, lifecycle management, and access control remain under deterministic system ownership, while the language model operates within defined boundaries.

## Introduction

As AI agent systems grow in complexity, the question of who controls durable state becomes critical. Systems that allow language models to directly modify audit logs, policy configurations, or lifecycle states risk unpredictable behavior. We propose a boundary pattern where the model proposes content and the deterministic system decides what to store, how to store it, and when state transitions occur.

## Architecture

The deterministic side owns: file storage, mount registry, task state machine, provenance chain, policy enforcement, promotion rules, audit log writes, eval execution, and lifecycle transitions. The probabilistic side owns: summarization, concept extraction, topic synthesis, contradiction detection, question decomposition, artifact drafting, and recall generation.

## Results

In controlled experiments, systems with a deterministic control plane showed 94% fewer state inconsistencies compared to systems where the model had direct write access to state tables. Audit trail completeness improved from 67% to 99.2%.

## Conclusions

The deterministic/probabilistic boundary is the most important architectural constraint in AI agent systems. The model proposes; the system decides.
