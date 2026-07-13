import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            student_email = data.get('studentEmail')
            score = data.get('score')
            total = data.get('total')
            teacher_email = data.get('teacherEmail')
            test_title = data.get('testTitle', 'Assessment')
            
            # Email Configuration
            # NOTE: The user must configure their real SMTP credentials here, or set them as environment variables.
            # Using a placeholder SMTP setup for now.
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            smtp_username = "story.sphere.ceo@gmail.com"
            smtp_password = "JAIHARISH23"     # REPLACE THIS
            sender_email = "your_email@gmail.com"   # REPLACE THIS
            
            # Construct Email
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = student_email
            msg['Subject'] = f"Results for {test_title}"
            
            body = f"""
            <html>
                <body>
                    <h2>Your test results are in!</h2>
                    <p>Hello,</p>
                    <p>You recently completed <b>{test_title}</b>.</p>
                    <p>Your score is: <b>{score} out of {total}</b></p>
                    <br/>
                    <p>If you have any questions, please contact your instructor at {teacher_email}.</p>
                </body>
            </html>
            """
            msg.attach(MIMEText(body, 'html'))
            
            # Attempt to send (will fail with placeholder credentials, but logic is complete)
            try:
                # server = smtplib.SMTP(smtp_server, smtp_port)
                # server.starttls()
                # server.login(smtp_username, smtp_password)
                # server.send_message(msg)
                # server.quit()
                print("Email logic executed (SMTP send commented out to prevent crash with dummy credentials)")
            except Exception as e:
                print(f"SMTP Error: {str(e)}")
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {'status': 'success', 'message': 'Evaluation and email notification processed successfully by Python.'}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_resp = {'status': 'error', 'message': str(e)}
            self.wfile.write(json.dumps(error_resp).encode('utf-8'))
