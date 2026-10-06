import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Credenciales de Telegram
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
ENABLE_TELEGRAM = os.getenv("ENABLE_TELEGRAM", "true").lower() in ("true", "1", "yes")

# Credenciales de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# Preferimos service_role key para que el backend pueda escribir sin ser bloqueado por RLS, o fallback a key general
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY") or ""

# Ubicaciones a monitorear
LOCATIONS = [
    {"name": "Valentín Alsina, AMBA", "lat": -34.670, "lon": -58.420},
    {"name": "La Boca, CABA", "lat": -34.636, "lon": -58.363},
    {"name": "Puerto Madero, CABA", "lat": -34.611, "lon": -58.361}
]

TIMEZONE = "America/Argentina/Buenos_Aires"
