from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str
    FIREBASE_SERVICE_ACCOUNT_KEY_PATH: str

    class Config:
        env_file = ".env"

settings = Settings()