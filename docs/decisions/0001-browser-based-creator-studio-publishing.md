# ADR-0001: Browser-Based Creator Studio Publishing via WebRTC

## Status

Accepted (Architectural Direction — Implementation Unproven)

## Date

2026-10-20

## Context

Streamline is an open-source live video streaming infrastructure platform designed to support creator broadcasting, media ingestion, processing, delivery, and viewer interaction at scale.

A critical design requirement is accessibility for creators:
- The primary creator workflow **must work directly through our own browser-based Creator Studio**.
- Broadcasters must **not be required to install or configure external software like OBS (Open Broadcaster Software)** to broadcast live.
- Audio and video must be captured in-browser via standard Web APIs (`getUserMedia()` for camera and microphone, with `getDisplayMedia()` planned for screen sharing in an upcoming milestone).
- Traditional browser-to-server ingest protocols like RTMP cannot run natively in standard modern web browsers without plugins or legacy runtimes.
- Conversely, downstream viewer delivery requires scaling cost-effectively to thousands or tens of thousands of concurrent viewers per stream without prohibitive media server or bandwidth costs.

We must decide on:
1. The primary ingest protocol from the browser Creator Studio to the media server.
2. The role of session signaling versus raw media transport.
3. The delivery protocol for viewers and playback architecture.
4. The role of external broadcasting tools (e.g., OBS).

## Decision

1. **Browser-Based Creator Studio as Primary**:
   - The primary broadcast workflow is hosted in the browser web application (`apps/web`).
   - Camera and microphone media are captured using the browser `navigator.mediaDevices.getUserMedia()` API.
   - Screen capture using `navigator.mediaDevices.getDisplayMedia()` is planned as an incremental browser capability for an upcoming milestone.

2. **WebRTC for Creator Ingest**:
   - Creators publish live media to the platform using WebRTC (via WHIP — WebRTC-HTTP Ingestion Protocol, or equivalent MediaMTX WebRTC endpoint).
   - WebRTC provides sub-second ingest latency, built-in adaptive bitrate encoding, jitter buffering, and native browser support without external software.

3. **Signaling vs. Media Plane Separation**:
   - WebRTC requires a signaling step (SDP offer/answer exchange and ICE candidate negotiation) between the browser Creator Studio and the backend API / media server.
   - **Signaling negotiates the session; it is not itself the video stream.**
   - Once negotiated, the media streams over secure transport (SRTP/UDP/TCP) directly to the media server.

4. **MediaMTX as Ingest and Routing Server**:
   - MediaMTX serves as the media gateway, accepting WebRTC ingest from browsers.
   - MediaMTX routes the incoming media stream to FFmpeg for processing and transcoding when required.

5. **HLS for Initial Viewer Delivery**:
   - FFmpeg transcodes the stream into multi-bitrate Adaptive Bitrate (ABR) HLS streams (manifests `.m3u8` and media segments `.ts` / `.m4s`).
   - Media segments and playlists are stored on MinIO / S3-compatible object storage (or local file/HTTP cache).
   - Viewers consume the stream via standard HTTP using `hls.js` integrated with the HTML5 `<video>` element on the viewer page.

6. **OBS as Optional External Publishing Only**:
   - OBS and RTMP are **not required** for creators.
   - RTMP ingestion may be retained on MediaMTX solely as an optional secondary path for power users or external hardware encoders.

## Media Flow

```text
Browser Creator Studio
  │ (getUserMedia: camera/mic; planned getDisplayMedia: screen)
  │
  ├── 1. Signaling (SDP Offer/Answer via API / MediaMTX) ──► Session Setup
  │
  ▼ 2. WebRTC Media Publishing (SRTP/UDP/TCP)
MediaMTX (Ingest & Routing Gateway)
  │
  ▼ 3. Internal Stream Route
FFmpeg Transcoder (when required)
  │
  ▼ 4. ABR HLS Generation (.m3u8 playlists + media segments)
MinIO / S3 Storage & HTTP Delivery Cache
  │
  ▼ 5. Standard HTTP Requests
Viewer Browser (hls.js + HTML5 <video> Element)
```

## Why WebRTC is Selected for Creator Publishing

- **Zero Install Requirement**: Standard web browsers natively support WebRTC and `getUserMedia()`. Creators can start streaming immediately with a browser tab.
- **Low Latency & Resiliency**: WebRTC runs primarily over UDP with built-in congestion control, packet loss recovery (NACK/FEC), and adaptive bitrate throttling suited for unpredictable residential upload links.
- **Industry Standardization**: WebRTC-HTTP Ingestion Protocol (WHIP / RFC 9334) standardizes WebRTC ingest to media servers such as MediaMTX, reducing proprietary signaling coupling.

## Why HLS is Selected for Initial Viewer Delivery

- **Scalability and CDN Caching**: HLS segments are standard static HTTP files (`.ts` / `.m4s`). They can be cached by standard HTTP reverse proxies and CDNs, allowing a single stream to fan out to 50,000+ viewers without scaling stateful media server connections linearly.
- **Adaptive Bitrate Streaming (ABR)**: HLS natively supports multiple variant playlists (e.g., 1080p, 720p, 480p, 360p). Viewers automatically adapt to bandwidth conditions using `hls.js`.
- **Browser Compatibility**: With `hls.js` on Media Source Extensions (MSE) and native HLS on Safari/iOS, HLS works across virtually 100% of modern desktop and mobile browsers.

## Consequences and Trade-offs

### Trade-offs & HLS Latency
- **End-to-End Latency**: Unlike end-to-end WebRTC which achieves sub-second latency, standard HLS introduces a 2–6 second (or longer) glass-to-glass latency due to segment duration boundaries and player buffer requirements. For broadcast streaming with interactive chat, this latency is an acceptable industry standard tradeoff to achieve massive scale and low distribution cost.
- **Transcoding Overhead**: WebRTC video codecs (VP8/VP9/H.264) and audio codecs (Opus) must be packaged or transcoded by FFmpeg into HLS-compliant formats (typically H.264/AAC), which consumes CPU/GPU resources on the media processing layer.
- **Architectural Duality**: Operating WebRTC on ingest and HLS on egress requires managing two media paradigms (stateful peer connections on ingest, stateless chunked HTTP on distribution).

## Security Considerations

- **Signaling Authentication**: WebRTC signaling endpoints must authenticate creators via secure session tokens or stream keys before allowing session negotiation.
- **Media Encryption**: WebRTC media is encrypted by specification using DTLS-SRTP.
- **Browser Permissions**: Explicit user consent is mandated by the browser for `getUserMedia()` and `getDisplayMedia()`. The UI must handle permission denials, device disconnection, and permission changes gracefully.
- **Stream Hijacking & Replay Prevention**: Session tokens must be short-lived, bound to specific stream IDs, and revoked upon stream termination.

## Unresolved Technical Risks and Validation Requirements

1. **MediaMTX WHIP / WebRTC Container Setup**: MediaMTX WebRTC support in local Docker containers requires validating port ranges (UDP/TCP candidate ports), ICE server configuration, and container network bindings.
2. **Codec Compatibility**: Browser WebRTC audio is Opus by default; standard HLS historically preferred AAC. FFmpeg transcoding performance (audio transcoding vs pass-through) must be measured.
3. **NAT Traversal (STUN/TURN)**: Creators on restrictive symmetric NATs or corporate firewalls will require TURN relays; local vs. cloud STUN/TURN behavior must be tested.
4. **End-to-End Prototype Validation**: This decision is accepted as the architectural baseline, but the end-to-end pipeline (Browser `getUserMedia` → WebRTC → MediaMTX → FFmpeg → HLS → `hls.js`) must be proven with a working prototype in the upcoming milestones before production lock-in.

## Affected Components

- `apps/web`: Creator Studio UI, media capture, WebRTC publishing client, viewer player (`hls.js`).
- `apps/api`: Signaling / token endpoints and stream authorization.
- `services/media/ingest`: MediaMTX configuration for WebRTC (WHIP) and routing.
- `services/media/transcoder`: FFmpeg worker pipeline for HLS generation.
- `infrastructure`: MediaMTX, MinIO, and network port mappings for WebRTC and HLS.

## Follow-up

- Implement and validate Milestone 1: Foundations and HLS playback proof of concept.
- Implement Milestone 2: Live Ingest Pipeline with browser WebRTC publishing to MediaMTX.
