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

### Live Streaming (Primary Browser Flow)

Broadcasting in StreamLine is browser-based by default. **OBS is not required**.

```text
1. Media Capture (Browser Creator Studio)
   ├── camera & mic capture: navigator.mediaDevices.getUserMedia()
   └── screen capture (planned): navigator.mediaDevices.getDisplayMedia()
         │
2. Signaling Phase (Control Plane — Session Negotiation)
   ├── Creator Studio <─── SDP Offer/Answer & ICE Candidates ───> API / MediaMTX WHIP
   └── Note: Signaling negotiates the WebRTC connection; it is not the video stream
         │
3. Media Publishing Phase (Data Plane)
   └── WebRTC media stream (SRTP audio/video tracks) ───────────► MediaMTX Ingestion
         │
4. Processing & Routing Phase
   └── MediaMTX routes media stream to FFmpeg (transcoding when required for ABR)
         │
5. Packaging & Storage Phase
   └── Multi-bitrate HLS (.m3u8 playlists & .ts/.m4s segments) ──► Object Storage (MinIO / S3)
         │
6. Playback Phase
   └── Viewer page fetches HLS segments via HTTP ───────────────► hls.js + HTML5 <video>
```

### Optional External Broadcasting Flow (OBS / RTMP)

External broadcasting software (e.g., OBS Studio) is supported as an optional secondary ingest mechanism, not the core workflow:

```text
OBS Studio (RTMP stream + stream key)
  -> MediaMTX (RTMP port)
  -> FFmpeg (transcoder worker)
  -> HLS Packaging
  -> Object Storage / Delivery
  -> Viewer Browser (hls.js)
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
