package com.innovation.controller;

import com.innovation.domain.Idea;
import com.innovation.dto.TaskDetailsDto;
import com.innovation.repository.IdeaRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private IdeaRepository ideaRepository;

    // THIS METHOD IS UPDATED to return rich details for each task
    @GetMapping
    public ResponseEntity<?> getMyTasks(
            @RequestParam(required = false) String ideaName,
            HttpServletRequest request) {

        String username = (String) request.getAttribute("username");
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");

        if (username == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not found in token.");
        }

        // Explicitly fetch assigned tasks
        List<Task> assignedTasks = taskService.createTaskQuery().taskAssignee(username).active().list();
        // Explicitly fetch unassigned tasks for the user's groups
        List<Task> groupTasks = (userGroups == null || userGroups.isEmpty()) ? Collections.emptyList() :
                taskService.createTaskQuery().taskCandidateGroupIn(userGroups).taskUnassigned().active().list();

        List<Task> allTasks = new ArrayList<>();
        allTasks.addAll(assignedTasks);
        allTasks.addAll(groupTasks);

        List<TaskDetailsDto> detailedTasks = allTasks.stream().map(task -> {
            Long ideaId = (Long) runtimeService.getVariable(task.getProcessInstanceId(), "ideaId");
            Idea idea = ideaId != null ? ideaRepository.findById(ideaId).orElse(null) : null;
            return new TaskDetailsDto(TaskDto.fromEntity(task), idea);
        }).collect(Collectors.toList());

        if (ideaName != null && !ideaName.isEmpty()) {
            detailedTasks = detailedTasks.stream()
                    .filter(dto -> dto.getIdea() != null && dto.getIdea().getTitre().toLowerCase().contains(ideaName.toLowerCase()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(detailedTasks);
    }

    // --- THIS IS THE MISSING ENDPOINT ---
    @GetMapping("/{taskId}/details")
    public ResponseEntity<?> getTaskDetails(@PathVariable String taskId) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found.");
        }

        // Get the ideaId from the process variables
        Long ideaId = (Long) runtimeService.getVariable(task.getProcessInstanceId(), "ideaId");
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found for task."));

        TaskDto taskDto = TaskDto.fromEntity(task);
        TaskDetailsDto taskDetails = new TaskDetailsDto(taskDto, idea);

        return ResponseEntity.ok(taskDetails);
    }

    @PostMapping("/{taskId}/claim")
    public ResponseEntity<?> claimTask(@PathVariable String taskId, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not found in token.");
        }

        try {
            taskService.claim(taskId, username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not claim task: " + e.getMessage());
        }
    }

    @PostMapping("/{taskId}/unclaim")
    public ResponseEntity<?> unclaimTask(@PathVariable String taskId, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not found in token.");
        }

        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        // Security check: Only the current assignee can unclaim the task.
        if (task == null || !username.equals(task.getAssignee())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is not the assignee of this task.");
        }

        try {
            taskService.setAssignee(taskId, null); // Setting assignee to null unclaims the task
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not unclaim task: " + e.getMessage());
        }
    }

    @PostMapping("/{taskId}/complete")
    public ResponseEntity<?> completeTask(@PathVariable String taskId, @RequestBody Map<String, Object> variables, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();

        if (task == null || !username.equals(task.getAssignee())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is not authorized to complete this task.");
        }

        if (variables.containsKey("dateEcheance")) {
            Object dateValue = variables.get("dateEcheance");
            if (dateValue instanceof String) {
                LocalDateTime localDateTime = LocalDateTime.parse((String) dateValue);
                Date dueDate = Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
                variables.put("dateEcheance", dueDate);
            }
        }

        taskService.complete(taskId, variables);
        return ResponseEntity.ok().build();
    }
}