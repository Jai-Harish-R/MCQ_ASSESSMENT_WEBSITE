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
            total = data.get('totalQuestions')
            teacher_email = data.get('teacherEmail')
            test_title = data.get('testTitle', 'Assessment')
            questions = data.get('questions', [])
            
            # Email Configuration
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            smtp_username = "stroy.sphere.ceo@gmail.com"
            smtp_password = "JAIHARISH23"
            sender_email = "stroy.sphere.ceo@gmail.com"
            
            # Construct Email
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = student_email
            msg['Subject'] = f"Results & Review: {test_title}"
            
            # Generate Questions HTML
            questions_html = ""
            for idx, q in enumerate(questions):
                status_color = "#10b981" if q.get('isCorrect') else "#ef4444"
                status_icon = "✅" if q.get('isCorrect') else "❌"
                
                questions_html += f"""
                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #f8fafc;">
                    <div style="font-weight: bold; margin-bottom: 8px;">Q{idx + 1}: {q.get('text')} {status_icon}</div>
                    <div style="margin-left: 12px; font-size: 14px;">
                        <div style="color: {status_color}; margin-bottom: 4px;"><strong>Your Answer:</strong> {q.get('selectedOption')}</div>
                        <div style="color: #64748b;"><strong>Correct Answer:</strong> {q.get('correctOption')}</div>
                    </div>
                </div>
                """
            
            # Final Body
            body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; padding: 20px; background-color: #0f172a; color: white; border-radius: 8px 8px 0 0;">
                        <h2 style="margin: 0;">Test Results</h2>
                        <h3 style="margin: 10px 0 0 0; font-weight: normal;">{test_title}</h3>
                    </div>
                    
                    <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                        <p>Hello,</p>
                        <p>You have successfully submitted your assessment. Here is your final score and a detailed review of your answers.</p>
                        
                        <div style="text-align: center; margin: 24px 0; padding: 16px; background-color: #f1f5f9; border-radius: 8px;">
                            <span style="font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: bold;">Final Score</span>
                            <div style="font-size: 32px; font-weight: bold; color: #0f172a;">{score} / {total}</div>
                        </div>
                        
                        <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Answer Review</h3>
                        {questions_html}
                        
                        <p style="margin-top: 24px; font-size: 12px; color: #64748b; text-align: center;">
                            If you have any questions, please contact your instructor at {teacher_email}.
                        </p>
                    </div>
                </body>
            </html>
            """
            msg.attach(MIMEText(body, 'html'))
            
            # Attempt to send
            try:
                server = smtplib.SMTP(smtp_server, smtp_port)
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.send_message(msg)
                server.quit()
                print("Email successfully sent via SMTP!")
            except Exception as e:
                print(f"SMTP Error: {str(e)}")
                raise Exception(f"SMTP Error: {str(e)}")
            
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
