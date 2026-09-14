# Realtime Architecture

## Technology

The realtime system is expected to use:

- Socket.io
- WebSockets
- Redis Pub/Sub

## Responsibilities

Realtime infrastructure will eventually support:

- live chat
- viewer presence
- viewer count
- realtime stream events
- moderation events
- notification-related events where appropriate

## Conceptual Flow

```text
Browser
   |
Socket.io
   |
Realtime Service
   |
Redis Pub/Sub
   |
Connected clients
```

## Reliability

WebSocket connections are unreliable by nature.

The system must consider:

- connection
- disconnection
- reconnection
- duplicate events
- stale connections
- authorization
- message ordering where relevant

## Persistence

Realtime delivery and persistent storage are separate concerns.

For example, chat may be delivered through Socket.io while persistent chat history is stored in PostgreSQL.

## Redis

Redis may be used for:

- Pub/Sub
- ephemeral presence
- counters
- realtime coordination

Do not treat Redis as the permanent source of truth for business-critical persistent data without an explicit decision.
