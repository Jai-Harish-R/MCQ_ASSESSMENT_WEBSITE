package com.assessment.service;

import com.assessment.model.AssessmentPayload;
import com.assessment.model.QuestionResult;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmailReport(AssessmentPayload payload) throws MessagingException {
        if (mailSender == null) {
            throw new IllegalStateException("SMTP MailSender bean is not configured. Please supply SMTP properties in application.properties.");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(payload.getStudentEmail());
        helper.setSubject("Assessment Report: " + payload.getTestTitle() + " (Score: " + payload.getScore() + "/" + payload.getTotalQuestions() + ")");
        
        String htmlBody = buildHtmlBody(payload);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    private String buildHtmlBody(AssessmentPayload payload) {
        int pct = (int) Math.round(((double) payload.getScore() / payload.getTotalQuestions()) * 100);
        String scoreColor = pct >= 50 ? "#15803d" : "#ba1a1a";

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>");
        sb.append("<html>");
        sb.append("<head>");
        sb.append("<meta charset='utf-8'>");
        sb.append("<style>");
        sb.append("body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9ff; margin: 0; padding: 20px; color: #171c25; }");
        sb.append(".email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dee2ef; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }");
        sb.append(".header { background-color: #003875; padding: 24px; text-align: center; color: #ffffff; }");
        sb.append(".header h1 { margin: 0; font-size: 20px; font-weight: bold; font-family: sans-serif; }");
        sb.append(".body { padding: 32px; }");
        sb.append(".metrics-box { text-align: center; margin: 24px 0; padding: 20px; background-color: #f0f3ff; border-radius: 6px; border: 1px solid #bdc7dc; }");
        sb.append(".metrics-score { font-size: 40px; font-weight: 800; color: #003875; line-height: 1; }");
        sb.append(".chip { display: inline-block; padding: 4px 12px; font-size: 13px; font-weight: bold; border-radius: 12px; margin-top: 8px; color: #ffffff; }");
        sb.append(".table-info { width: 100%; border-collapse: collapse; margin-bottom: 24px; }");
        sb.append(".table-info td { padding: 10px; border-bottom: 1px solid #dee2ef; font-size: 14px; }");
        sb.append(".table-info td.label { font-weight: bold; color: #3d4758; width: 35%; }");
        sb.append(".question-card { border: 1px solid #bdc7dc; border-radius: 6px; padding: 16px; margin-bottom: 16px; background-color: #ffffff; }");
        sb.append(".question-title { font-size: 15px; font-weight: bold; margin-bottom: 12px; color: #171c25; }");
        sb.append(".option-pill { padding: 8px 12px; margin: 4px 0; border-radius: 4px; border: 1px solid #dee2ef; font-size: 13px; }");
        sb.append(".option-correct { border: 1px solid #15803d; background-color: #dcfce7; color: #166534; }");
        sb.append(".option-incorrect { border: 1px solid #ba1a1a; background-color: #ffdad6; color: #93000a; }");
        sb.append(".footer { padding: 20px; text-align: center; font-size: 12px; color: #6d778a; background-color: #f0f3ff; border-top: 1px solid #dee2ef; }");
        sb.append("</style>");
        sb.append("</head>");
        sb.append("<body>");
        sb.append("<div class='email-container'>");
        
        // Header
        sb.append("<div class='header'>");
        sb.append("<h1>EduVerify Pro Assessment Engine</h1>");
        sb.append("</div>");
        
        // Body
        sb.append("<div class='body'>");
        sb.append("<p style='font-size:15px;'>Hello Student,</p>");
        sb.append("<p style='font-size:14px;'>You have successfully completed the examination. Below is the compiled performance scorecard and question review transcript for your records.</p>");
        
        // Stats table
        sb.append("<table class='table-info'>");
        sb.append("<tr><td class='label'>Student Email</td><td>").append(payload.getStudentEmail()).append("</td></tr>");
        sb.append("<tr><td class='label'>Teacher Email</td><td>").append(payload.getTeacherEmail()).append("</td></tr>");
        sb.append("<tr><td class='label'>Assessment Title</td><td>").append(payload.getTestTitle()).append("</td></tr>");
        sb.append("</table>");
        
        // Metrics score box
        sb.append("<div class='metrics-box'>");
        sb.append("<span style='font-size: 11px; color: #6d778a; font-weight: bold; text-transform: uppercase;'>FINAL SCORE</span>");
        sb.append("<div class='metrics-score'>").append(payload.getScore()).append(" <span style='font-size:18px; color:#6d778a; font-weight:normal;'>/ ").append(payload.getTotalQuestions()).append("</span></div>");
        sb.append("<div class='chip' style='background-color: ").append(scoreColor).append(";'>").append(pct).append("% Grade</div>");
        sb.append("</div>");
        
        // Questions review
        sb.append("<h2 style='font-size: 16px; margin: 24px 0 16px; border-bottom: 2px solid #003875; padding-bottom: 6px;'>Question Transcript</h2>");
        List<QuestionResult> questions = payload.getQuestions();
        for (int i = 0; i < questions.size(); i++) {
            QuestionResult qr = questions.get(i);
            sb.append("<div class='question-card'>");
            sb.append("<div class='question-title'>Question #").append(i + 1).append(": ").append(qr.getText()).append("</div>");
            
            // Render image if present in email report
            if (qr.getImageUrl() != null && !qr.getImageUrl().trim().isEmpty()) {
                sb.append("<div style='margin-bottom:12px; border:1px solid #dee2ef; border-radius:4px; text-align:center; background-color:#f8fafc; padding:8px;'>");
                sb.append("<img src='").append(qr.getImageUrl()).append("' style='max-width:100%; max-height:180px; object-fit:contain;' alt='Question Diagram' />");
                sb.append("</div>");
            }
            
            // Display options
            for (String opt : qr.getOptions()) {
                boolean isSelected = opt.equals(qr.getSelectedOption());
                boolean isCorrect = opt.equals(qr.getCorrectOption());
                
                String cssClass = "";
                String indicator = "";
                if (isCorrect) {
                    cssClass = " option-correct";
                    indicator = " (Correct Answer)";
                } else if (isSelected) {
                    cssClass = " option-incorrect";
                    indicator = " (Your Selection)";
                }
                
                sb.append("<div class='option-pill").append(cssClass).append("'>");
                sb.append("<span>").append(opt).append("</span>");
                if (!indicator.isEmpty()) {
                    sb.append("<span style='float:right; font-size:10px; font-weight:bold; text-transform:uppercase;'>").append(indicator).append("</span>");
                }
                sb.append("</div>");
            }
            sb.append("</div>");
        }
        
        sb.append("</div>"); // end body
        
        // Footer
        sb.append("<div class='footer'>");
        sb.append("<p>This is an automated score receipt. Do not reply to this email.</p>");
        sb.append("<p>© 2026 EduVerify Pro. All rights reserved.</p>");
        sb.append("</div>");
        
        sb.append("</div>");
        sb.append("</body>");
        sb.append("</html>");

        return sb.toString();
    }
}
