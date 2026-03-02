"""Client Orders routes – FastAPI + Motor (async MongoDB)."""
from __future__ import annotations

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

from ...db import get_db
from ..schemas import OrderCreate, OrderUpdate

router = APIRouter()


def _utc_now() -> str:
    return datetime.utcnow().isoformat() + "Z"


def _serialize_order(doc: dict) -> dict:
    return {
        "id": doc.get("id"),
        "userId": doc.get("userId"),
        "items": doc.get("items", []),
        "subtotal": doc.get("subtotal"),
        "tax": doc.get("tax"),
        "loyaltyDiscount": doc.get("loyaltyDiscount"),
        "loyaltyPointsRedeemed": doc.get("loyaltyPointsRedeemed"),
        "total": doc.get("total"),
        "status": doc.get("status"),
        "type": doc.get("type"),
        "date": doc.get("date"),
        "deliveryAddress": doc.get("deliveryAddress"),
        "invoiceUrl": doc.get("invoiceUrl"),
        "tableNumber": doc.get("tableNumber"),
        "customerName": doc.get("customerName"),
    }


@router.get("/orders")
async def list_orders(userId: Optional[str] = Query(None)):
    db = get_db()
    orders = db.get_collection("orders")
    query = {"userId": userId} if userId else {}
    cursor = orders.find(query).sort([("date", -1)])
    rows = await cursor.to_list(length=1000)
    return {"orders": [_serialize_order(o) for o in rows]}


@router.get("/orders/{order_id}")
async def get_order(order_id: str):
    db = get_db()
    orders = db.get_collection("orders")
    o = await orders.find_one({"id": order_id})
    if not o:
        raise HTTPException(status_code=404, detail="not_found")
    return _serialize_order(o)


@router.post("/orders", status_code=201)
async def create_order(body: OrderCreate):
    db = get_db()
    orders = db.get_collection("orders")

    doc = {
        "id": body.id,
        "userId": body.userId,
        "items": body.items,
        "subtotal": body.subtotal,
        "tax": body.tax,
        "loyaltyDiscount": body.loyaltyDiscount,
        "loyaltyPointsRedeemed": body.loyaltyPointsRedeemed,
        "total": float(body.total),
        "status": body.status,
        "type": body.type,
        "date": body.date,
        "deliveryAddress": body.deliveryAddress,
        "invoiceUrl": body.invoiceUrl,
        "tableNumber": body.tableNumber,
        "customerName": body.customerName,
        "createdAt": _utc_now(),
        "updatedAt": _utc_now(),
    }

    await orders.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
    return _serialize_order(doc)


@router.patch("/orders/{order_id}")
async def update_order(order_id: str, body: OrderUpdate):
    db = get_db()
    orders = db.get_collection("orders")
    existing = await orders.find_one({"id": order_id})
    if not existing:
        raise HTTPException(status_code=404, detail="not_found")

    updates: dict = {}
    if body.status is not None:
        updates["status"] = body.status
    if body.invoiceUrl is not None:
        updates["invoiceUrl"] = body.invoiceUrl

    if updates:
        updates["updatedAt"] = _utc_now()
        await orders.update_one({"id": order_id}, {"$set": updates})
        existing.update(updates)

    return _serialize_order(existing)
