# System Flows

This document will contain detailed request, event, and media flow diagrams.

## Planned Flows

### Authentication

```text
Browser
  -> API
  -> Auth
  -> Database
```

### Stream Creation

```text
Creator
  -> Web
  -> API
  -> Database
  -> Stream credentials/state
```

### Live Streaming

```text
OBS
  -> MediaMTX
  -> FFmpeg
  -> HLS
  -> Storage/Delivery
  -> Browser
```

### Viewer Presence

```text
Viewer
  -> Socket.io
  -> Realtime Service
  -> Redis
```

### Chat

```text
Sender
  -> Socket.io
  -> Realtime Service
  -> Redis Pub/Sub
  -> Connected viewers

Chat persistence
  -> PostgreSQL
```

Detailed diagrams and exact contracts should be added as implementation stabilizes.
