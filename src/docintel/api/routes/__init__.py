from fastapi import APIRouter

from docintel.api.routes.documents import router as documents_router
from docintel.api.routes.health import router as health_router
from docintel.api.routes.profiles import ontology_router, profile_output_router
from docintel.api.routes.profiles import router as profiles_router
from docintel.api.routes.search import router as search_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(documents_router)
api_router.include_router(search_router)
api_router.include_router(profiles_router)
api_router.include_router(ontology_router)
api_router.include_router(profile_output_router)
