package com.innovation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MailTestController {

    private final JavaMailSender mailSender;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.mail.from}")
    private String from;

    @GetMapping("/api/test-mail")
    public String testMail() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setFrom(from);
            message.setSubject("✅ Manual Mail Test");
            message.setText("This is a test email sent via REST endpoint.");

            mailSender.send(message);

            return "📧 Mail sent successfully to " + adminEmail;
        } catch (Exception e) {
            return "❌ Failed to send email: " + e.getMessage();
        }
    }
}
