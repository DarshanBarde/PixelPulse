import os
from django.core.asgi import get_asgi_application
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uuid
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.db import IntegrityError

# to start the server use this --- uvicorn pixelpulse_backend.asgi:application --host 0.0.0.0 --port 8000

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pixelpulse_backend.settings')
django_asgi_app = get_asgi_application()

fastapi_app = FastAPI()

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CustomUser = get_user_model()

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str | None = None  # Optional field

class UserLogin(BaseModel):
    username: str
    password: str

@fastapi_app.post("/api/signup/")
async def signup(user: UserCreate):
    # Check if username exists
    user_exists = await sync_to_async(CustomUser.objects.filter(username=user.username).exists)()
    if user_exists:
        return JSONResponse({"error": "Username already exists"}, status_code=400)
    
    # Check if email exists
    email_exists = await sync_to_async(CustomUser.objects.filter(email=user.email).exists)()
    if email_exists:
        return JSONResponse({"error": "Email already exists"}, status_code=400)
    
    try:
        # Create the user
        new_user = await sync_to_async(CustomUser.objects.create_user)(
            username=user.username,
            email=user.email,
            password=user.password,
            full_name=user.full_name
        )
        from django.contrib.auth.tokens import default_token_generator
        token = default_token_generator.make_token(new_user)
        return JSONResponse({
            "message": "User created successfully",
            "username": user.username,
            "token": token
        }, status_code=201)
    except IntegrityError as e:
        return JSONResponse({"error": "An error occurred during signup. Please try again."}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": "An unexpected error occurred"}, status_code=400) 

@fastapi_app.post("/api/login/")
async def login(user: UserLogin):
    from django.contrib.auth import authenticate
    # Use sync_to_async for authenticate
    user_auth = await sync_to_async(authenticate)(username=user.username, password=user.password)
    if user_auth is not None:
        from django.contrib.auth.tokens import default_token_generator
        token = default_token_generator.make_token(user_auth)
        return JSONResponse({
            "message": "Login successful",
            "token": token
        }, status_code=200)
    return JSONResponse({"error": "Invalid credentials"}, status_code=401)

@fastapi_app.post("/api/dashboard/")
async def dashboard(token: str = Form(...), file: UploadFile = File(...)):
    # Implement proper token validation (placeholder for now)
    from django.contrib.auth.tokens import default_token_generator
    user_exists = await sync_to_async(lambda: any(default_token_generator.make_token(u) == token for u in CustomUser.objects.all()))()
    if not user_exists:
        return JSONResponse({"error": "Invalid or expired token"}, status_code=401)
    if not file.filename.endswith('.glb'):
        return JSONResponse({"error": "Only .glb files are allowed"}, status_code=400)
    unique_filename = f"model_{uuid.uuid4()}.glb"
    file_path = os.path.join(os.getcwd(), unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return JSONResponse({"message": "File uploaded successfully", "file_path": file_path}, status_code=200)

@fastapi_app.get("/api/dashboard/")
async def dashboard_status(token: str = Form(...)):
    from django.contrib.auth.tokens import default_token_generator
    user_exists = await sync_to_async(lambda: any(default_token_generator.make_token(u) == token for u in CustomUser.objects.all()))()
    if not user_exists:
        return JSONResponse({"error": "Invalid or expired token"}, status_code=401)
    glb_files = [f for f in os.listdir(os.getcwd()) if f.endswith('.glb')]
    return {"message": "Dashboard status", "uploaded_files": glb_files}

async def application(scope, receive, send):
    if scope["type"] == "http":
        request = Request(scope, receive)
        if scope["path"].startswith("/api/"):
            return await fastapi_app(scope, receive, send)
        return await django_asgi_app(scope, receive, send)
    await django_asgi_app(scope, receive, send)