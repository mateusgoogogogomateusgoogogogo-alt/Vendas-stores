from __future__ import annotations

import hashlib
import json
import os
import secrets
import time
from urllib.parse import unquote
from pathlib import Path
from threading import Lock
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "store.json"
PUBLIC_DIR = ROOT
WRITE_LOCK = Lock()
ATTEMPTS: dict[str, tuple[int, float]] = {}

app = FastAPI(title="MTGX Stores API", version="1.0.0", docs_url="/api/docs", redoc_url="/api/redoc")
allowed_origin = os.getenv("CORS_ORIGIN", "").strip()
if allowed_origin:
    app.add_middleware(CORSMiddleware, allow_origins=[allowed_origin], allow_credentials=True, allow_methods=["GET", "POST", "PATCH", "DELETE"], allow_headers=["*"])


class Payload(BaseModel):
    model_config = ConfigDict(extra="allow")


class StatusPayload(BaseModel):
    status: str


class KeyPayload(BaseModel):
    key: str = Field(min_length=1)


def trpc_input(raw: Any) -> dict[str, Any]:
    """Extract the first tRPC input object from a single or batched request."""
    value = raw
    if isinstance(value, dict) and "0" in value:
        value = value["0"]
    if isinstance(value, dict) and "json" in value:
        value = value["json"]
    return value if isinstance(value, dict) else {}


def trpc_result(value: Any) -> dict[str, Any]:
    return {"result": {"data": {"json": value}}}


def trpc_batch_result(values: dict[str, Any]) -> dict[str, Any]:
    return {key: {"result": {"data": {"json": value}}} for key, value in values.items()}


def require_trpc_admin(request: Request) -> None:
    key = request.headers.get("x-admin-key")
    if not key or not verify_key(key):
        raise HTTPException(status_code=403, detail="Admin key invalid")


def read_state() -> dict[str, Any]:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text(json.dumps({"settings": {}, "products": [], "tickets": [], "suggestions": [], "announcements": [], "stockRequests": [], "leads": [], "portfolio": [], "users": []}, ensure_ascii=False, indent=2), encoding="utf-8")
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def write_state(state: dict[str, Any]) -> None:
    temporary = DATA_FILE.with_suffix(".tmp")
    temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(DATA_FILE)


def next_id(items: list[dict[str, Any]]) -> int:
    return max((int(item.get("id", 0)) for item in items), default=0) + 1


def add_item(collection: str, payload: dict[str, Any]) -> dict[str, Any]:
    with WRITE_LOCK:
        state = read_state()
        item = {**payload, "id": next_id(state.get(collection, [])), "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        state.setdefault(collection, []).append(item)
        write_state(state)
        return item


def update_item(collection: str, item_id: int, payload: dict[str, Any]) -> dict[str, Any] | None:
    with WRITE_LOCK:
        state = read_state()
        for item in state.get(collection, []):
            if int(item.get("id", 0)) == item_id:
                item.update(payload)
                write_state(state)
                return item
    return None


def remove_item(collection: str, item_id: int) -> bool:
    with WRITE_LOCK:
        state = read_state()
        original = state.get(collection, [])
        state[collection] = [item for item in original if int(item.get("id", 0)) != item_id]
        changed = len(original) != len(state[collection])
        if changed:
            write_state(state)
        return changed


def verify_key(value: str) -> bool:
    state = read_state()
    expected = str(state.get("settings", {}).get("adminKeyHash", ""))
    received = hashlib.sha256(value.strip().encode()).hexdigest()
    return bool(len(expected) == 64 and secrets.compare_digest(received, expected))


def allow_attempt(ip: str) -> bool:
    now = time.time()
    count, reset = ATTEMPTS.get(ip, (0, now + 600))
    if reset <= now:
        ATTEMPTS[ip] = (1, now + 600)
        return True
    if count >= 8:
        return False
    ATTEMPTS[ip] = (count + 1, reset)
    return True


async def admin_guard(request: Request, x_admin_key: str | None = Header(default=None)) -> str:
    if not x_admin_key or not verify_key(x_admin_key):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin key inválida")
    return x_admin_key


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "mtgx-fastapi", "database": "json"}


@app.get("/api/store")
def store() -> dict[str, Any]:
    state = read_state()
    products = [item for item in state.get("products", []) if item.get("active", True) is not False]
    return {"settings": state.get("settings", {}), "products": products, "announcements": state.get("announcements", []), "portfolio": state.get("portfolio", [])}


@app.get("/api/products")
def products() -> list[dict[str, Any]]:
    return store()["products"]


@app.get("/api/announcements")
def announcements() -> list[dict[str, Any]]:
    return read_state().get("announcements", [])


@app.get("/api/portfolio")
def portfolio() -> list[dict[str, Any]]:
    return read_state().get("portfolio", [])


@app.post("/api/admin/key/verify")
def key_verify(payload: KeyPayload, request: Request):
    ip = request.client.host if request.client else "unknown"
    if not allow_attempt(ip):
        raise HTTPException(status_code=429, detail="Muitas tentativas. Aguarde alguns minutos.")
    return {"valid": verify_key(payload.key)}


@app.post("/api/tickets", status_code=201)
def create_ticket(payload: Payload):
    return add_item("tickets", payload.model_dump())


@app.post("/api/leads", status_code=201)
def create_lead(payload: Payload):
    return add_item("leads", payload.model_dump())


@app.post("/api/suggestions", status_code=201)
def create_suggestion(payload: Payload):
    return add_item("suggestions", payload.model_dump())


@app.post("/api/stock-requests", status_code=201)
def create_stock_request(payload: Payload):
    return add_item("stockRequests", payload.model_dump())


@app.get("/api/admin/stats")
def admin_stats(_: str = Depends(admin_guard)):
    state = read_state()
    products = state.get("products", [])
    return {"products": len([p for p in products if p.get("active", True)]), "lowStock": len([p for p in products if int(p.get("stock", 0)) <= 2]), "tickets": len(state.get("tickets", [])), "requests": len(state.get("stockRequests", [])), "suggestions": len(state.get("suggestions", [])), "leads": len(state.get("leads", []))}


@app.get("/api/admin/inbox")
def admin_inbox(_: str = Depends(admin_guard)):
    state = read_state()
    return {key: state.get(key, []) for key in ("tickets", "leads", "suggestions", "stockRequests")}


@app.post("/api/admin/products", status_code=201)
def admin_create_product(payload: Payload, _: str = Depends(admin_guard)):
    return add_item("products", payload.model_dump())


@app.patch("/api/admin/products/{item_id}")
def admin_update_product(item_id: int, payload: Payload, _: str = Depends(admin_guard)):
    item = update_item("products", item_id, payload.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return item


@app.delete("/api/admin/products/{item_id}")
def admin_delete_product(item_id: int, _: str = Depends(admin_guard)):
    if not update_item("products", item_id, {"active": False}):
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"success": True}


@app.post("/api/admin/announcements", status_code=201)
def admin_create_announcement(payload: Payload, _: str = Depends(admin_guard)):
    return add_item("announcements", payload.model_dump())


@app.delete("/api/admin/announcements/{item_id}")
def admin_delete_announcement(item_id: int, _: str = Depends(admin_guard)):
    return {"success": remove_item("announcements", item_id)}


@app.post("/api/admin/portfolio", status_code=201)
def admin_create_portfolio(payload: Payload, _: str = Depends(admin_guard)):
    return add_item("portfolio", payload.model_dump())


@app.delete("/api/admin/portfolio/{item_id}")
def admin_delete_portfolio(item_id: int, _: str = Depends(admin_guard)):
    return {"success": remove_item("portfolio", item_id)}


@app.patch("/api/admin/tickets/{item_id}")
def admin_ticket_status(item_id: int, payload: StatusPayload, _: str = Depends(admin_guard)):
    return update_item("tickets", item_id, {"status": payload.status}) or {"success": False}


@app.patch("/api/admin/suggestions/{item_id}")
def admin_suggestion_status(item_id: int, payload: StatusPayload, _: str = Depends(admin_guard)):
    return update_item("suggestions", item_id, {"status": payload.status}) or {"success": False}


@app.patch("/api/admin/stock-requests/{item_id}")
def admin_stock_status(item_id: int, payload: StatusPayload, _: str = Depends(admin_guard)):
    return update_item("stockRequests", item_id, {"status": payload.status}) or {"success": False}


@app.patch("/api/admin/leads/{item_id}")
def admin_lead_status(item_id: int, payload: StatusPayload, _: str = Depends(admin_guard)):
    return update_item("leads", item_id, {"status": payload.status}) or {"success": False}


@app.patch("/api/admin/settings")
def admin_settings(payload: Payload, _: str = Depends(admin_guard)):
    with WRITE_LOCK:
        state = read_state()
        values = payload.model_dump(exclude_unset=True)
        new_key = values.pop("adminKey", None)
        if new_key:
            values["adminKeyHash"] = hashlib.sha256(str(new_key).strip().encode()).hexdigest()
        state["settings"] = {**state.get("settings", {}), **values}
        write_state(state)
        return state["settings"]


@app.api_route("/api/trpc/{procedures:path}", methods=["GET", "POST"])
async def trpc_compat(procedures: str, request: Request):
    """Compatibility adapter for the compiled original React/tRPC client."""
    names = [unquote(name) for name in procedures.split(",") if name]
    raw_input: Any = {}
    if request.method == "GET":
        query_input = request.query_params.get("input", "{}")
        try:
            raw_input = json.loads(query_input)
        except json.JSONDecodeError:
            raw_input = {}
    else:
        try:
            raw_input = await request.json()
        except Exception:
            raw_input = {}

    state = read_state()
    responses: dict[str, Any] = {}
    for index, name in enumerate(names):
        payload = raw_input.get(str(index), raw_input) if isinstance(raw_input, dict) else raw_input
        value = trpc_input(payload)
        if name == "adminAccess.verifyKey" and request.method == "POST":
            responses[name] = verify_key(str(value.get("key", "")))
        elif name.startswith("admin."):
            require_trpc_admin(request)
            if name == "admin.settings":
                responses[name] = state.get("settings", {})
            elif name == "admin.saveSettings" and request.method == "POST":
                values = dict(value)
                new_key = values.pop("adminKey", None)
                if new_key:
                    values["adminKeyHash"] = hashlib.sha256(str(new_key).strip().encode()).hexdigest()
                state["settings"] = {**state.get("settings", {}), **values}
                write_state(state)
                responses[name] = state["settings"]
            elif name == "admin.products":
                responses[name] = state.get("products", [])
            elif name == "admin.createProduct" and request.method == "POST":
                responses[name] = add_item("products", value)
            elif name == "admin.updateProduct" and request.method == "POST":
                product_id = int(value.get("id", 0))
                values = {key: item for key, item in value.items() if key != "id"}
                responses[name] = update_item("products", product_id, values) or {"success": False}
            elif name == "admin.deleteProduct" and request.method == "POST":
                responses[name] = bool(update_item("products", int(value.get("id", 0)), {"active": False}))
            elif name == "admin.stats":
                responses[name] = admin_stats(request.headers.get("x-admin-key"))
            elif name == "admin.tickets":
                responses[name] = state.get("tickets", [])
            elif name == "admin.suggestions":
                responses[name] = state.get("suggestions", [])
            elif name == "admin.leads":
                responses[name] = state.get("leads", [])
            elif name == "admin.stockRequests":
                responses[name] = state.get("stockRequests", [])
            elif name == "admin.announcements":
                responses[name] = state.get("announcements", [])
            elif name == "admin.createAnnouncement" and request.method == "POST":
                responses[name] = add_item("announcements", value)
            elif name == "admin.deleteAnnouncement" and request.method == "POST":
                responses[name] = {"success": remove_item("announcements", int(value.get("id", 0)))}
            elif name == "admin.portfolio":
                responses[name] = state.get("portfolio", [])
            elif name == "admin.createPortfolio" and request.method == "POST":
                responses[name] = add_item("portfolio", value)
            elif name == "admin.updatePortfolio" and request.method == "POST":
                portfolio_id = int(value.get("id", 0))
                values = {key: item for key, item in value.items() if key != "id"}
                responses[name] = update_item("portfolio", portfolio_id, values) or {"success": False}
            elif name == "admin.deletePortfolio" and request.method == "POST":
                responses[name] = {"success": remove_item("portfolio", int(value.get("id", 0)))}
            elif name in {"admin.updateTicket", "admin.updateSuggestion", "admin.updateStockRequest", "admin.updateLead"} and request.method == "POST":
                collection = {"admin.updateTicket": "tickets", "admin.updateSuggestion": "suggestions", "admin.updateStockRequest": "stockRequests", "admin.updateLead": "leads"}[name]
                responses[name] = update_item(collection, int(value.get("id", 0)), {"status": value.get("status")}) is not None
            else:
                raise HTTPException(status_code=404, detail=f"Procedimento administrativo não suportado: {name}")
        elif name == "store.settings":
            responses[name] = state.get("settings", {})
        elif name == "store.products":
            responses[name] = [item for item in state.get("products", []) if item.get("active", True) is not False]
        elif name == "store.announcements":
            responses[name] = state.get("announcements", [])
        elif name == "store.portfolio":
            responses[name] = state.get("portfolio", [])
        elif name == "leads.create" and request.method == "POST":
            responses[name] = add_item("leads", value)
        elif name == "tickets.create" and request.method == "POST":
            responses[name] = add_item("tickets", value)
        elif name == "suggestions.create" and request.method == "POST":
            responses[name] = add_item("suggestions", value)
        elif name == "stock.request" and request.method == "POST":
            responses[name] = add_item("stockRequests", value)
        else:
            raise HTTPException(status_code=404, detail=f"Procedimento tRPC não suportado: {name}")
    if len(responses) == 1:
        return trpc_result(next(iter(responses.values())))
    return {str(index): {"result": {"data": {"json": value}}} for index, value in enumerate(responses.values())}


# Static files are served after API routes so /api/* remains JSON.
@app.get("/admin")
@app.get("/admin/")
def admin_page() -> FileResponse:
    return FileResponse(PUBLIC_DIR / "admin-index.html")


app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="site")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_server:app", host=os.getenv("HOST", "0.0.0.0"), port=int(os.getenv("PORT", "3000")), reload=False)
