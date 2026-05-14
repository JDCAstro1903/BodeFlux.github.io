from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, dashboard, inventory, products, providers, provider_orders, sales, waste


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AgroStack API",
    description="Backend API para el Sistema de Gestión de Inventario Agrícola",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the React frontend (any localhost port for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
