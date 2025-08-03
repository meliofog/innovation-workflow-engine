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
    public ResponseEntity<?> getMyTasks(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");

        if (username == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not found in token.");
        }

        List<Task> assignedTasks = taskService.createTaskQuery().taskAssignee(username).active().list();
        List<Task> groupTasks = (userGroups == null || userGroups.isEmpty()) ? Collections.emptyList() :
                taskService.createTaskQuery().taskCandidateGroupIn(userGroups).taskUnassigned().active().list();

        List<Task> allTasks = new java.util.ArrayList<>();
        allTasks.addAll(assignedTasks);
        allTasks.addAll(groupTasks);

        List<TaskDto> taskDtos = allTasks.stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(taskDtos);
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