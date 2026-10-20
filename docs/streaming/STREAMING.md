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

StreamLine's core publishing model is browser-native: **OBS is not required**.

The primary live streaming pipeline is:

```text
Browser Creator Studio
  │ • Audio/video capture via navigator.mediaDevices.getUserMedia()
  │ • Screen capture planned via navigator.mediaDevices.getDisplayMedia()
  │
  ├── 1. WebRTC Signaling (SDP Offer/Answer + ICE via API / MediaMTX WHIP)
  │      [Negotiates the WebRTC session — signaling is NOT the video stream]
  │
  ▼ 2. WebRTC Media Stream (SRTP audio/video tracks)
MediaMTX Ingest & Routing Gateway
  │
  ▼ 3. Stream Routing
FFmpeg Transcoder Worker (when required for multi-bitrate ABR)
  │
  ▼ 4. HLS Packaging (.m3u8 playlists + .ts/.m4s media segments)
MinIO / S3-compatible Object Storage & HTTP Delivery Cache
  │
  ▼ 5. HTTP Segment Requests
Stream Viewing Page (hls.js + HTML5 <video> element)
```

### Optional External Publishing (OBS / RTMP)

Creators wishing to stream from desktop applications or dedicated hardware encoders may optionally publish via RTMP to MediaMTX using their generated stream key. This is an optional secondary ingestion method and is not a prerequisite for broadcasting.

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
