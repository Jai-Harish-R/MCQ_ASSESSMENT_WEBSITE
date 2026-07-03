package com.assessment.controller;

import com.assessment.model.AssessmentPayload;
import com.assessment.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*") // Allow Vite frontend requests from any local development port
public class AssessmentController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateAndMail(@RequestBody AssessmentPayload payload) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("Received assessment evaluation request for student: " + payload.getStudentEmail());
        System.out.println("Test title: " + payload.getTestTitle() + " | Score: " + payload.getScore() + "/" + payload.getTotalQuestions());

        try {
            emailService.sendEmailReport(payload);
            
            response.put("success", true);
            response.put("message", "Grading report compiled and email successfully sent to: " + payload.getStudentEmail());
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (IllegalStateException e) {
            System.err.println("Illegal State: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("notice", "App is running, but mail service is simulated (SMTP server is offline/unconfigured).");
            // Return OK since it's a known simulated configuration for demo fallback
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Failed to send assessment email: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
