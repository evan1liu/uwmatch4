# from passlib.context import CryptContext
import smtplib
from email.mime.text import MIMEText
from backend.config import Settings

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

### NO LONGER USED (DELETED THE PROCESS OF HAVING TO ENTER PASSWORD) ###

# def get_hashed_password(password: str) -> str:
#     return pwd_context.hash(password)

# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password) 

def send_verification_email(email: str, token: str):
    # Construct the verification URL (adjust domain based on your deployment)
    verification_url = f"https://www.uwmatch.com/api/verify?token={token}&email={email}"
    subject = "Verify Your Email for UW Match"
    body = f"""
    Hello,

    Please click the link below to verify your email and log in to UW Match:
    {verification_url}

    This link will expire in 10 minutes.
    """

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = Settings.SMTP_USERNAME
    msg["To"] = email

    try:
        with smtplib.SMTP(Settings.SMTP_HOST, Settings.SMTP_PORT) as server:
            server.starttls()
            server.set_debuglevel(1) 
            server.login(Settings.SMTP_USERNAME, Settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")
    
if __name__ == "__main__":
    send_verification_email("eliu59@wisc.edu", "soduhjf")