# StreamLine Architecture

## Architectural Goal

Build a reliable, maintainable streaming platform while keeping the initial system understandable for a four-developer team.

The architecture should support future scale without prematurely introducing unnecessary distributed-system complexity.

## Major Components

```text
                    StreamLine
                        |
          +-------------+-------------+
          |             |             |
         Web            API         Services
          |             |             |
       Viewer/       Core domain    Media
       Creator       operations    Realtime
       Dashboard                    Analytics
```

## Streaming Path

StreamLine is designed so that broadcasting occurs directly through our browser-based Creator Studio. **OBS is not required** for creators to broadcast; external software publishing (e.g., OBS via RTMP) is supported solely as an optional secondary ingest path.

The primary media pipeline is:

```text
Browser Creator Studio
  │ (getUserMedia: camera/mic; planned getDisplayMedia: screen)
  │
  ├── WebRTC Signaling (SDP/ICE via API/MediaMTX) [Session negotiation only]
  │
  ▼ WebRTC Media Publishing (SRTP/UDP/TCP)
MediaMTX (Ingest & Routing Gateway)
  │
  ▼ Internal Media Route
FFmpeg (Processing & Transcoding when required)
  │
  ▼ Multi-quality ABR HLS (.m3u8 playlists & media segments)
Object Storage / Delivery (MinIO / S3)
  │
  ▼ HTTP Delivery
Viewer Page (hls.js + HTML5 <video> Element)
```

> **Signaling Note:** WebRTC signaling negotiates the peer connection session (exchanging SDP offers/answers and ICE network candidates) between the browser and the ingestion gateway. Signaling is control plane coordination, not the video stream itself. Once the connection is established, video and audio flow directly over secure media transport.

## Application Responsibilities

### Web

Owns user-facing experiences:

- browser-based Creator Studio (camera/mic capture via `getUserMedia()`, planned screen share via `getDisplayMedia()`, WebRTC publishing)
- authentication UI
- stream discovery
- stream viewing (`hls.js` + HTML5 video)
- creator dashboard
- chat UI
- moderation UI
- analytics UI
- notifications

### API

Owns core application/business operations:

- users
- authentication & authorization
- stream session negotiation & WebRTC signaling coordination
- streams & stream keys
- follows
- discovery metadata
- moderation
- recordings
- analytics APIs
- notifications

### Media Services

Own media infrastructure:

- `ingest`: WebRTC ingestion & routing via MediaMTX (with optional RTMP fallback)
- `transcoder`: FFmpeg processing and adaptive multi-quality HLS packaging when required
- `recorder`: recording and VOD packaging

### Realtime

Own:

- WebSockets
- chat delivery
- presence
- realtime fan-out
- Redis Pub/Sub coordination

### Analytics

Own:

- event processing
- aggregation
- historical metrics

## Architectural Rules

1. Keep boundaries explicit.
2. Avoid circular dependencies.
3. Do not access another service's database directly unless explicitly designed.
4. Use shared packages for stable contracts.
5. Document important architectural decisions.
6. Prefer simple designs until scale requirements justify complexity.
