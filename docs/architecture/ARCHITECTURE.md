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

The expected conceptual media path is:

```text
OBS / Creator
     |
    RTMP
     |
  MediaMTX
     |
  FFmpeg
     |
 Multi-quality HLS
     |
Object Storage / Delivery
     |
Browser + hls.js
```

## Application Responsibilities

### Web

Owns user-facing experiences:

- authentication UI
- stream discovery
- stream viewing
- creator dashboard
- chat UI
- moderation UI
- analytics UI
- notifications

### API

Owns core application/business operations:

- users
- authentication
- streams
- follows
- discovery metadata
- moderation
- recordings
- analytics APIs
- notifications

### Media Services

Own media infrastructure:

- ingestion
- transcoding
- recording/VOD

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
