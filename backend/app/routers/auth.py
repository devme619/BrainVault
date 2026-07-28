from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.database.database import get_db, engine
from app.database import models
from app.schemas.auth import UserSignUp, UserLogin, GoogleAuthInput, TokenResponse, UserProfileResponse
from app.core.security import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Auto create tables on startup if missing
models.Base.metadata.create_all(bind=engine)

@router.post("/signup", response_model=TokenResponse)
def signup(user_data: UserSignUp, db: Session = Depends(get_db)):
    email_clean = user_data.email.strip().lower()
    
    # Check existing user
    existing_user = db.query(models.User).filter(models.User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email address is already registered. Please sign in."
        )

    # Create new user
    new_user = models.User(
        full_name=user_data.full_name.strip(),
        email=email_clean,
        hashed_password=hash_password(user_data.password),
        auth_provider="local",
        is_new_user=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
    return TokenResponse(access_token=token, user=UserProfileResponse.model_validate(new_user))


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email_clean = credentials.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email_clean).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please sign up first."
        )

    if user.auth_provider == "google" and not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account was registered with Google. Please use Google Sign-In."
        )

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Existing returning user is not new
    user_response = UserProfileResponse.model_validate(user)
    user_response.is_new_user = False

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=token, user=user_response)


@router.post("/google", response_model=TokenResponse)
def google_auth(data: GoogleAuthInput, db: Session = Depends(get_db)):
    email_clean = data.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email_clean).first()
    
    is_new = False
    if not user:
        is_new = True
        user = models.User(
            full_name=data.full_name,
            email=email_clean,
            hashed_password=None,
            auth_provider="google",
            avatar_url=data.avatar_url,
            is_new_user=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    user_resp = UserProfileResponse.model_validate(user)
    user_resp.is_new_user = is_new

    return TokenResponse(access_token=token, user=user_resp)


@router.get("/me", response_model=UserProfileResponse)
def get_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserProfileResponse.model_validate(user)
