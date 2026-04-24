"""WebSocket connection manager — maps session_id to active connections."""

from typing import Dict
from fastapi import WebSocket


class ConnectionManager:
    """Manages WebSocket connections keyed by exam session_id."""

    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, session_id: str, ws: WebSocket):
        await ws.accept()
        self.active[session_id] = ws

    def disconnect(self, session_id: str):
        self.active.pop(session_id, None)

    async def send_json(self, session_id: str, data: dict):
        ws = self.active.get(session_id)
        if ws:
            try:
                await ws.send_json(data)
            except Exception:
                self.disconnect(session_id)

    async def broadcast(self, data: dict):
        dead = []
        for sid, ws in self.active.items():
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(sid)
        for sid in dead:
            self.disconnect(sid)


manager = ConnectionManager()
