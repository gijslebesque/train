# app/controllers/system_controller.py
"""
System controller for application status and configuration.
"""

import os
from typing import Dict, Any
from ..controllers.base_controller import BaseController


class SystemController(BaseController):
    """Controller for system operations."""
    
    def get_storage_info(self) -> Dict[str, Any]:
        """Get information about the current storage method."""
        use_database = os.getenv("USE_DATABASE", "false").lower() == "true"
        
        return self.success_response({
            "storage_type": "database" if use_database else "in_memory",
            "database_url": os.getenv("DATABASE_URL") if use_database else None,
            "description": "Tokens persist across restarts" if use_database else "Tokens lost on restart"
        }, "Storage information retrieved")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get application health status."""
        return self.success_response({
            "status": "healthy",
            "version": "1.0.0",
            "environment": "development"
        }, "Application is healthy")
