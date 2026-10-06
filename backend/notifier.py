import httpx
from config import TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, ENABLE_TELEGRAM

async def send_telegram_alert(message: str):
    """
    Envía un mensaje de alerta a través de Telegram usando el bot.
    """
    if not ENABLE_TELEGRAM:
        print("[INFO] Notificaciones por Telegram desactivadas (ENABLE_TELEGRAM=false).")
        return

    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID or TELEGRAM_TOKEN == "tu_token_aqui":
        print("[ADVERTENCIA] Credenciales de Telegram no configuradas. Omitiendo notificación.")
        return
        
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            print("[OK] Notificación enviada correctamente a Telegram.")
        except Exception as e:
            print(f"[ERROR] Falló el envío del mensaje de Telegram: {e}")
