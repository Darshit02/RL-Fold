from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.config import settings
import redis.asyncio as aioredis
import asyncio
import json

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/metrics/{job_id}")
async def metrics_ws(websocket: WebSocket, job_id: str):
    await websocket.accept()
    r = aioredis.from_url(settings.REDIS_URL)
    pubsub = r.pubsub()
    await pubsub.subscribe(f"metrics:{job_id}")

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                await websocket.send_json(data)
    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe(f"metrics:{job_id}")
        await r.aclose()
