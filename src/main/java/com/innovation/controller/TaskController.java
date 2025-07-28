package com.innovation.controller;

import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.camunda.bpm.engine.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime; // <-- Add new import
import java.time.ZoneId;      // <-- Add new import
import java.util.Date;        // <-- Add new import
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasksForGroup(@RequestParam(name = "group") String group) {
        List<Task> tasks = taskService.createTaskQuery()
                .taskCandidateGroup(group)
                .active()
                .list();

        List<TaskDto> taskDtos = tasks.stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(taskDtos);
    }

    // THIS METHOD IS UPDATED
    @PostMapping("/{taskId}/complete")
    public ResponseEntity<Void> completeTask(@PathVariable String taskId, @RequestBody Map<String, Object> variables) {

        // Check if a due date variable is being passed as a String
        if (variables.containsKey("dateEcheance")) {
            Object dateValue = variables.get("dateEcheance");
            if (dateValue instanceof String) {
                // Convert the String to a Java Date object
                LocalDateTime localDateTime = LocalDateTime.parse((String) dateValue);
                Date dueDate = Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());

                // Replace the String with the Date object in the map
                variables.put("dateEcheance", dueDate);
            }
        }

        taskService.complete(taskId, variables);
        return ResponseEntity.ok().build();
    }
}