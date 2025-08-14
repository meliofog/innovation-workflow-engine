package com.innovation.controller;

import com.innovation.domain.Idea;
import com.innovation.dto.TaskDetailsDto;
import com.innovation.repository.IdeaRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.engine.task.TaskQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
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

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private IdeaRepository ideaRepository;

    @GetMapping
    public ResponseEntity<?> getMyTasks(
            @RequestParam(required = false) String ideaName,
            @RequestParam(required = false) String taskDefinitionKey, // New filter
            HttpServletRequest request) {

        String username = (String) request.getAttribute("username");
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");

        if (username == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not found in token.");
        }

        List<Task> allTasks = new ArrayList<>();

        if (userGroups != null && userGroups.contains("camunda-admin")) {
            TaskQuery query = taskService.createTaskQuery().active();
            if (taskDefinitionKey != null && !taskDefinitionKey.isEmpty()) {
                query.taskDefinitionKey(taskDefinitionKey);
            }
            allTasks = query.list();
        } else {
            // Your robust logic for regular users
            TaskQuery assignedQuery = taskService.createTaskQuery().taskAssignee(username).active();
            TaskQuery groupQuery = (userGroups == null || userGroups.isEmpty()) ? null :
                    taskService.createTaskQuery().taskCandidateGroupIn(userGroups).taskUnassigned().active();

            if (taskDefinitionKey != null && !taskDefinitionKey.isEmpty()) {
                assignedQuery.taskDefinitionKey(taskDefinitionKey);
                if (groupQuery != null) {
                    groupQuery.taskDefinitionKey(taskDefinitionKey);
                }
            }

            allTasks.addAll(assignedQuery.list());
            if (groupQuery != null) {
                allTasks.addAll(groupQuery.list());
            }
        }

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

    // --- getTaskDetails, claimTask, unclaimTask, and completeTask methods remain exactly as you provided them ---
    @GetMapping("/{taskId}/details")
    public ResponseEntity<?> getTaskDetails(@PathVariable String taskId) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found.");
        }
        Long ideaId = (Long) runtimeService.getVariable(task.getProcessInstanceId(), "ideaId");
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found for task."));
        TaskDetailsDto taskDetails = new TaskDetailsDto(TaskDto.fromEntity(task), idea);
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
        if (task == null || !username.equals(task.getAssignee())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is not the assignee of this task.");
        }
        try {
            taskService.setAssignee(taskId, null);
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