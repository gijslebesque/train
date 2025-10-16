# app/controllers/base_controller.py
"""
Base controller class for common functionality.
"""

from abc import ABC
from typing import Dict, Any


class BaseController(ABC):
    """Base controller with common functionality."""
    
    def success_response(self, data: Any, message: str = "Success") -> Dict[str, Any]:
        """Create a success response."""
        return {
            "success": True,
            "message": message,
            "data": data
        }
    
    def error_response(self, message: str, error_code: str = "error") -> Dict[str, Any]:
        """Create an error response."""
        return {
            "success": False,
            "error": error_code,
            "message": message
        }
