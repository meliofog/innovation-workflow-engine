package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.engine.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Component("sendAlertDelegate")
public class SendAlertDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(SendAlertDelegate.class);

    private final TaskService taskService;
    private final IdentityService identityService;
    private final EmailService emailService;
    private final IdeaRepository ideaRepository;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.mail.from:no-reply@innovation.local}")
    private String fromEmail;

    public SendAlertDelegate(TaskService taskService,
                             IdentityService identityService,
                             EmailService emailService,
                             IdeaRepository ideaRepository) {
        this.taskService = taskService;
        this.identityService = identityService;
        this.emailService = emailService;
        this.ideaRepository = ideaRepository;
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        String processInstanceId = execution.getProcessInstanceId();

        // Try to fetch the idea for nicer subject/body content (optional).
        String ideaTitle = ideaRepository.findById(ideaId)
                .map(Idea::getTitre)
                .orElse("(unknown title)");

        // Find currently active tasks for this process instance
        List<Task> tasks = taskService.createTaskQuery()
                .processInstanceId(processInstanceId)
                .active()
                .list();

        // Prefer the first task that has an assignee
        Optional<String> assigneeUserId = tasks.stream()
                .map(Task::getAssignee)
                .filter(Objects::nonNull)
                .findFirst();

        // Resolve email
        String toEmail = assigneeUserId
                .map(this::getEmailForUser)
                .filter(email -> email != null && !email.isBlank())
                .orElse(adminEmail);

        // Compose email
        String subject = "[Innovation] Deadline passed for Idea #" + ideaId + " – " + ideaTitle;
        String body = buildBody(ideaId, ideaTitle, processInstanceId, assigneeUserId.orElse(null));

        // Send
        emailService.sendPlainText(toEmail, subject, body, fromEmail);

        LOGGER.info("Alert email sent to '{}' for ideaId={} (procInst={})", toEmail, ideaId, processInstanceId);
    }

    private String getEmailForUser(String userId) {
        try {
            User user = identityService.createUserQuery().userId(userId).singleResult();
            return user != null ? user.getEmail() : null;
        } catch (Exception e) {
            LOGGER.warn("Could not resolve email for Camunda user '{}': {}", userId, e.getMessage());
            return null;
        }
    }

    private String buildBody(Long ideaId, String ideaTitle, String processInstanceId, String assignee) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello,\n\n");
        sb.append("A deadline has passed for the following item:\n\n");
        sb.append("• Idea ID: ").append(ideaId).append("\n");
        sb.append("• Title: ").append(ideaTitle).append("\n");
        sb.append("• Process Instance: ").append(processInstanceId).append("\n");
        if (assignee != null) {
            sb.append("• Assigned to: ").append(assignee).append("\n");
        } else {
            sb.append("• Assigned to: (none) – sent to admin\n");
        }
        sb.append("\nPlease review and take action.\n\n");
        sb.append("Regards,\nInnovation Workflow");
        return sb.toString();
    }
}
