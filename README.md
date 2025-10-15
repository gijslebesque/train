# Sporty 🚴‍♂️

A FastAPI-based application that integrates with Strava to provide AI-powered training recommendations for cyclists.

## Features

- **Strava Integration**: OAuth2 authentication with Strava API
- **Activity Analysis**: Fetch and analyze recent cycling activities
- **AI-Powered Recommendations**: Get personalized training suggestions using OpenAI's GPT-4
- **RESTful API**: Clean FastAPI endpoints for easy integration

## API Endpoints

- `GET /auth/strava` - Get Strava OAuth2 authorization URL
- `GET /exchange_token?code={code}` - Exchange authorization code for access token
- `GET /activities` - Fetch recent Strava activities
- `GET /recommendations` - Get AI-powered training recommendations
- `GET /docs` - Interactive API documentation (Swagger UI)

## Prerequisites

- Python 3.12+
- Strava API credentials
- OpenAI API key

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
OPENAI_API_KEY=your_openai_api_key_here
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here
```

### 5. Get API Credentials

#### Strava API Setup
1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Set the authorization callback domain to `http://localhost:8000`
4. Copy your Client ID and Client Secret

#### OpenAI API Setup
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key to your `.env` file

## Running the Application

### Development Mode

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

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
│   └── main.py          # FastAPI application
├── venv/                # Virtual environment (ignored by git)
├── .env                 # Environment variables (ignored by git)
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Dependencies

- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI
- **OpenAI**: AI client for generating recommendations
- **Requests**: HTTP library for Strava API calls
- **Python-dotenv**: Environment variable management

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
