import smtplib
from email.mime.text import MIMEText

# SMTP configuration based on GoDaddy's response
SMTP_HOST = "smtp.office365.com"
SMTP_PORT = 587  # Port for STARTTLS
SMTP_USERNAME = "evanliu@uwmatch.com"  # Your email address
SMTP_PASSWORD = "A170021476"  # Replace with your actual password or app-specific password

# try:
#     # Create SMTP server instance with debug mode enabled
#     server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
#     server.set_debuglevel(1)  # Print detailed logs for troubleshooting

#     # Enable STARTTLS for encryption
#     server.starttls()

#     # Attempt to log in with your credentials
#     server.login(SMTP_USERNAME, SMTP_PASSWORD)

#     print("Connection successful!")
#     server.quit()

# except smtplib.SMTPConnectError as e:
#     print(f"Failed to connect to the server: {e}")
# except smtplib.SMTPAuthenticationError as e:
#     print(f"Authentication failed: {e}")
# except smtplib.SMTPException as e:
#     print(f"SMTP error occurred: {e}")
# except Exception as e:
#     print(f"General error: {e}")

msg = MIMEText("This is a test email sent using smtplib.")
msg["Subject"] = "Test Email"
msg["From"] = "evanliu@uwmatch.com"
msg["To"] = "eliu59@wisc.edu"

# Connect and send the email
with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
    server.starttls()  # Enable TLS encryption
    server.login(SMTP_USERNAME, SMTP_PASSWORD)  # Authenticate
    server.send_message(msg)  # Send the email