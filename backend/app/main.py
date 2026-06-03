# Deployment fix: force clean redeployment to clear corrupted multiRegionConfig (invalid region "sfo")
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware as OriginalCORSMiddleware

from .database import Base, engine
from .routers import auth, dashboard, inventory, presentations, products, providers, provider_orders, sales, users, waste

_DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:3000",
    # Production Vercel deployment
    "https://bodeflux.vercel.app",
    # All Vercel preview deployments (wildcard supported in Starlette ≥ 0.40)
    "https://*.vercel.app",
]

def _get_allowed_origins() -> list[str]:
    extra = os.getenv("CORS_ORIGINS", "")
    extras = [o.strip() for o in extra.split(",") if o.strip()]
    return _DEFAULT_ORIGINS + extras


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup (non-fatal if DB is unavailable)."""
    try:
        Base.metadata.create_all(bind=engine)
        print("[startup] Database tables verified/created.", flush=True)
        print("[startup] Clean deployment — multiRegionConfig reset.", flush=True)
    except Exception as exc:
        print(f"[startup] WARNING: Could not create tables: {exc}", flush=True)
    yield


app = FastAPI(
    title="AgroStack API",
    description="Backend API para el Sistema de Gestión de Inventario Agrícola",
    version="1.0.0",
    lifespan=lifespan,
)

class CustomCORSMiddleware(OriginalCORSMiddleware):
    def is_allowed_origin(self, origin: str) -> bool:
        # Permitir cualquier dominio de vercel nativamente
        if origin and origin.endswith(".vercel.app"):
            return True
        return super().is_allowed_origin(origin)

app.add_middleware(
    CustomCORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Atrapa errores 500 no controlados (como caídas de base de datos)
    e inyecta la cabecera CORS para que el frontend pueda leer el error real
    en lugar de fallar con un TypeError o CORS Policy Blocked.
    """
    origin = request.headers.get("origin")
    headers = {}
    if origin and (origin in _get_allowed_origins() or "bodeflux.vercel.app" in origin):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    else:
        headers["Access-Control-Allow-Origin"] = "*"
        
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)},
        headers=headers
    )

# Mount routers
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(providers.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(waste.router)
app.include_router(provider_orders.router)
app.include_router(dashboard.router)
app.include_router(users.router)
app.include_router(presentations.router)


@app.get("/")
def root():
    return {
        "message": "🌾 AgroStack API está funcionando",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
