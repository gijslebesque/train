# app/controllers/base_controller.py
"""
Base controller class for common functionality.
"""

from abc import ABC
from typing import Dict, Any, Optional


class BaseController(ABC):
    """Base controller with common functionality."""
    
    def __init__(self):
        """Initialize base controller with default status codes."""
        # Default status codes - can be overridden per response
        self.default_status_codes = {
            "success": 200,
            "created": 201,
            "accepted": 202,
            "no_content": 204,
            "error": 400,
            "unauthorized": 401,
            "forbidden": 403,
            "not_found": 404,
            "internal_error": 500
        }
    
    def success_response(self, data: Any, message: str = "Success", status_code: Optional[int] = None) -> Dict[str, Any]:
        """Create a success response with configurable status code."""
        return {
            "success": True,
            "message": message,
            "data": data,
            "_status_code": status_code or self.default_status_codes["success"]
        }
    
    def created_response(self, data: Any, message: str = "Created", status_code: Optional[int] = None) -> Dict[str, Any]:
        """Create a created response (201) with configurable status code."""
        return {
            "success": True,
            "message": message,
            "data": data,
            "_status_code": status_code or self.default_status_codes["created"]
        }
    
    def accepted_response(self, data: Any, message: str = "Accepted", status_code: Optional[int] = None) -> Dict[str, Any]:
        """Create an accepted response (202) with configurable status code."""
        return {
            "success": True,
            "message": message,
            "data": data,
            "_status_code": status_code or self.default_status_codes["accepted"]
        }
    
    def no_content_response(self, message: str = "No Content", status_code: Optional[int] = None) -> Dict[str, Any]:
        """Create a no content response (204) with configurable status code."""
        return {
            "success": True,
            "message": message,
            "data": None,
            "_status_code": status_code or self.default_status_codes["no_content"]
        }
    
    def error_response(self, message: str, error_code: str = "error", status_code: Optional[int] = None) -> Dict[str, Any]:
        """Create an error response with configurable status code."""
        return {
            "success": False,
            "error": error_code,
            "message": message,
            "_status_code": status_code or self.default_status_codes["error"]
        }
    
    def unauthorized_response(self, message: str = "Unauthorized", status_code: Optional[int] = None) -> Dict[str, Any]:
        """Create an unauthorized response (401) with configurable status code."""
        return {
            "success": False,
            "error": "unauthorized",
            "message": message,
            "_status_code": status_code or self.default_status_codes["unauthorized"]
        }
    
    def forbidden_response(self, message: str = "Forbidden", status_code: Optional[int] = None) -> Dict[str, Any]:
        """Create a forbidden response (403) with configurable status code."""
        return {
            "success": False,
            "error": "forbidden",
            "message": message,
            "_status_code": status_code or self.default_status_codes["forbidden"]
        }
    
    def not_found_response(self, message: str = "Not Found", status_code: Optional[int] = None) -> Dict[str, Any]:
        """Create a not found response (404) with configurable status code."""
        return {
            "success": False,
            "error": "not_found",
            "message": message,
            "_status_code": status_code or self.default_status_codes["not_found"]
        }
    
    def internal_error_response(self, message: str = "Internal Server Error", status_code: Optional[int] = None) -> Dict[str, Any]:
        """Create an internal server error response (500) with configurable status code."""
        return {
            "success": False,
            "error": "internal_error",
            "message": message,
            "_status_code": status_code or self.default_status_codes["internal_error"]
        }
