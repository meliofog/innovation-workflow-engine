package com.innovation.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // This is the NEW, unified endpoint for fetching all of a user's tasks
    @GetMapping
    public ResponseEntity<?> getMyTasks(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");

        if (username == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not found in token.");
        }

        // Create a query for tasks directly assigned to the user
        List<Task> assignedTasks = taskService.createTaskQuery()
                .taskAssignee(username)
                .active()
                .list();

        // Create a query for tasks available to the user's groups
        List<Task> groupTasks = Collections.emptyList();
        if (userGroups != null && !userGroups.isEmpty()) {
            groupTasks = taskService.createTaskQuery()
                    .taskCandidateGroupIn(userGroups)
                    .taskUnassigned()
                    .active()
                    .list();
        }

        // Combine the lists and convert to DTOs
        List<Task> allTasks = new java.util.ArrayList<>();
        allTasks.addAll(assignedTasks);
        allTasks.addAll(groupTasks);

        List<TaskDto> taskDtos = allTasks.stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(taskDtos);
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