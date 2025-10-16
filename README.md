# Sporty 🚴‍♂️

A FastAPI-based application that integrates with Strava to provide AI-powered training recommendations for cyclists.

## Features

- **Strava Integration**: OAuth2 authentication with Strava API
- **Activity Analysis**: Fetch and analyze recent cycling activities
- **AI-Powered Recommendations**: Get personalized training suggestions using multiple AI providers
- **Clean Architecture**: Domain-driven design with easy provider swapping
- **RESTful API**: Clean FastAPI endpoints for easy integration
- **React Frontend**: Modern Material-UI interface

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint
- `GET /auth/strava` - Get Strava OAuth2 authorization URL
- `GET /exchange_token?code={code}` - Exchange authorization code for access token
- `GET /token_status` - Get current token status
- `GET /storage_info` - Get storage method information
- `GET /activities` - Fetch recent Strava activities
- `GET /recommendations` - Get AI-powered training recommendations
- `GET /ai_provider_info` - Get current AI provider information
- `GET /docs` - Interactive API documentation (Swagger UI)

## Prerequisites

- Python 3.12+
- Strava API credentials
- AI Provider credentials (OpenAI API key OR Ollama setup)
- Node.js 18+ (for React frontend)

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd sporty
```

### 2. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
# Database Configuration (optional)
USE_DATABASE=false
DATABASE_URL=postgresql://user:password@localhost:5432/sporty

# AI Provider Configuration
AI_PROVIDER=openai
# Options: openai, ollama

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Ollama Configuration (when AI_PROVIDER=ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Strava Configuration
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here
```

### 5. Database Setup (Optional)

**Option A: Use In-Memory Storage (Default)**
- No additional setup required
- Tokens are stored in memory (lost on restart)

**Option B: Use PostgreSQL Database**
- **Using Docker (Recommended):**
  ```bash
  docker-compose up -d
  ```
- **Using Local PostgreSQL:**
  ```bash
  ./setup_database.sh
  ```
- **Manual Setup:**
  1. Install PostgreSQL
  2. Create database: `createdb sporty`
  3. Set `USE_DATABASE=true` in `.env`

### 6. Get API Credentials

#### Strava API Setup
1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Set the authorization callback domain to `http://localhost:8000`
4. Copy your Client ID and Client Secret

#### AI Provider Setup

**Option A: OpenAI (Recommended)**
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key to your `.env` file
4. Set `AI_PROVIDER=openai` in `.env`

**Option B: Ollama (Free Alternative)**
1. Install Ollama: https://ollama.ai/
2. Pull a model: `ollama pull llama2`
3. Start Ollama server: `ollama serve`
4. Set `AI_PROVIDER=ollama` in `.env`

## Running the Application

### Backend (FastAPI)

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

The React app will be available at:
- **Frontend**: http://localhost:3000

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Usage

### 1. Authenticate with Strava

Visit: `http://localhost:8000/auth/strava`

This will return a Strava authorization URL. Click the URL to authorize the application.

### 2. Exchange Authorization Code

After authorization, Strava will redirect to:
`http://localhost:8000/exchange_token?code={authorization_code}`

This will exchange the code for an access token.

### 3. Get Activities

```bash
curl http://localhost:8000/activities
```

### 4. Get AI Recommendations

```bash
curl http://localhost:8000/recommendations
```

## Project Structure

```
sporty/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── data_processor.py      # Strava data processing utilities
│   ├── container.py           # Dependency injection container
│   ├── domain/                # Domain layer (business logic)
│   │   ├── models.py          # Domain entities
│   │   ├── repositories.py    # Repository interfaces
│   │   ├── ai_models.py       # AI domain models
│   │   └── ai_service.py      # AI service interface
│   ├── infrastructure/        # Infrastructure layer
│   │   ├── repositories.py    # Repository implementations
│   │   ├── database.py        # Database configuration
│   │   └── ai_providers/      # AI provider implementations
│   │       ├── __init__.py
│   │       ├── openai_provider.py  # OpenAI implementation
│   │       └── ollama_provider.py  # Ollama implementation
│   ├── services/              # Service layer
│   │   ├── token_service.py   # Token management service
│   │   └── recommendation_service.py # AI recommendation service
│   └── controllers/            # Controller layer
│       ├── base_controller.py # Base controller class
│       ├── auth_controller.py # Authentication controller
│       ├── activity_controller.py # Activity controller
│       ├── recommendation_controller.py # AI recommendations controller
│       └── system_controller.py # System controller
├── frontend/                  # React frontend with Material-UI
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (not in git)
├── env.example               # Environment variables template
├── docker-compose.yml        # PostgreSQL database setup
├── setup_database.sh         # Database setup script
└── README.md                  # This file
```

## Clean Architecture

This project follows Clean Architecture principles with clear separation of concerns:

### 🏗️ Architecture Layers

1. **Domain Layer** (`app/domain/`)
   - Contains business logic and entities
   - Defines interfaces and contracts
   - Independent of external frameworks

2. **Infrastructure Layer** (`app/infrastructure/`)
   - Implements external dependencies
   - Database repositories
   - AI provider implementations

3. **Service Layer** (`app/services/`)
   - Contains application business logic
   - Orchestrates domain operations
   - Coordinates between layers

4. **Controller Layer** (`app/controllers/`)
   - Handles HTTP requests/responses
   - Input validation and error handling
   - Thin layer that delegates to services

### 🔄 AI Provider Swapping

The clean architecture makes it easy to swap AI providers:

```python
# Switch to OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=your_key_here

# Switch to Ollama
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```

### 🎯 Benefits

- **Testability**: Easy to mock dependencies
- **Flexibility**: Swap implementations without changing business logic
- **Maintainability**: Clear separation of concerns
- **Scalability**: Add new providers easily

## Dependencies

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI
- **OpenAI**: AI client for generating recommendations
- **Requests**: HTTP library for Strava API calls
- **Python-dotenv**: Environment variable management
- **SQLAlchemy**: ORM for database operations
- **Tiktoken**: Token counting for OpenAI

### Frontend
- **React**: JavaScript library for building user interfaces
- **Material-UI**: React component library
- **Vite**: Fast build tool and dev server
- **Axios**: HTTP client for API calls

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure
- The current implementation uses in-memory token storage (suitable for development only)
- For production, implement proper token storage and refresh logic

## Development

### Adding New Features

1. Create feature branches from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

### Code Style

- Follow PEP 8 guidelines
- Use type hints
- Add docstrings to functions
- Keep functions focused and small

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure you're in the virtual environment
2. **API Errors**: Check your `.env` file has correct credentials
3. **Port Already in Use**: Change the port with `--port 8001`

### Getting Help

- Check the [FastAPI documentation](https://fastapi.tiangolo.com/)
- Review the [Strava API documentation](https://developers.strava.com/)
- Check the [OpenAI API documentation](https://platform.openai.com/docs)

## License

This project is for educational purposes. Please respect Strava's and OpenAI's terms of service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Happy cycling! 🚴‍♂️💨**
