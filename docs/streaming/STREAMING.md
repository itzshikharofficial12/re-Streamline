# Streaming Architecture

## Objective

StreamLine must demonstrate a complete live streaming workflow rather than simply playing uploaded video.

## Phase 1 Proof of Concept

The first isolated media proof should establish:

```text
Local video
    |
  FFmpeg
    |
Multi-quality HLS
    |
hls.js
```

This should be proven before full application integration.

## Phase 2 End-to-End Pipeline

The expected flow is:

```text
OBS
 |
RTMP
 |
MediaMTX
 |
FFmpeg Worker
 |
HLS
 |
MinIO / S3-compatible storage
 |
Stream page
 |
hls.js
```

## Reliability Considerations

Streaming code must account for:

- creator disconnect
- creator reconnect
- interrupted streams
- FFmpeg failure
- missing HLS segments
- delayed segment availability
- stale stream state
- viewer playback failure

## Adaptive Streaming

A stream may expose multiple quality variants.

The player should be able to select an appropriate quality based on viewing conditions.

## Stream Lifecycle

The authoritative stream lifecycle/state machine must be documented before being treated as a cross-service contract.

Potential conceptual states include:

```text
CREATED
READY
LIVE
INTERRUPTED
ENDED
RECORDED
```

These are a starting point for design, not yet an immutable implementation contract.
