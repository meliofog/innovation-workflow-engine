package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.slf4j.Logger; // <-- Add import
import org.slf4j.LoggerFactory; // <-- Add import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IdeaService {

    // Add this logger
    private static final Logger LOGGER = LoggerFactory.getLogger(IdeaService.class);

    @Autowired
    private IdeaRepository ideaRepository;
    @Autowired
    private RuntimeService runtimeService;
    @Autowired
    private TaskService taskService;

    public Idea createIdea(Idea idea) {
        Idea savedIdea = ideaRepository.save(idea);
        Map<String, Object> variables = new HashMap<>();
        variables.put("ideaId", savedIdea.getId());
        runtimeService.startProcessInstanceByKey("innovation_process", savedIdea.getId().toString(), variables);
        return savedIdea;
    }

    public Idea prioritizeIdea(Long ideaId, String priority) {
        LOGGER.info("Attempting to prioritize idea ID: {}", ideaId);
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));
        idea.setPriority(priority);
        ideaRepository.save(idea);

        LOGGER.info("Searching for 'Priorisation / Filtrage' task for business key: {}", ideaId.toString());
        Task task = taskService.createTaskQuery()
                .processInstanceBusinessKey(ideaId.toString())
                .taskDefinitionKey("Activity_10rvc7h") // ID for "Priorisation / Filtrage"
                .singleResult();

        if (task != null) {
            LOGGER.info("Task found! Task ID: {}, Task Name: {}. Completing it now.", task.getId(), task.getName());
            Map<String, Object> variables = new HashMap<>();
            variables.put("retenue", true);
            taskService.complete(task.getId(), variables);
            LOGGER.info("Task completed successfully.");
        } else {
            LOGGER.error("!!! TASK NOT FOUND for business key: {}", ideaId.toString());
            // Let's see if any other task is active for this process instance
            List<Task> allTasksForInstance = taskService.createTaskQuery().processInstanceBusinessKey(ideaId.toString()).list();
            if (allTasksForInstance.isEmpty()) {
                LOGGER.error("No active tasks found for this process instance at all.");
            } else {
                allTasksForInstance.forEach(t -> LOGGER.error("Found other active task instead: ID={}, Name={}, DefinitionKey={}", t.getId(), t.getName(), t.getTaskDefinitionKey()));
            }
        }
        return idea;
    }

    public List<Idea> getAllIdeas() {
        return ideaRepository.findAll();
    }
}