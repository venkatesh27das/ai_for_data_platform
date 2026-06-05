from fastapi import APIRouter

from docintel.api.routes.documents import router as documents_router
from docintel.api.routes.health import router as health_router
from docintel.api.routes.search import router as search_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(documents_router)
api_router.include_router(search_router)
