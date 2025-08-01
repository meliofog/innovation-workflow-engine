package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IdeaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(IdeaService.class);

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private RuntimeService runtimeService; // This is needed for the updated method

    @Autowired
    private TaskService taskService;

    public Idea createIdea(Idea idea) {
        Idea savedIdea = ideaRepository.save(idea);
        Map<String, Object> variables = new HashMap<>();
        variables.put("ideaId", savedIdea.getId());
        // We use the ideaId as the business key to link them
        runtimeService.startProcessInstanceByKey("innovation_process", savedIdea.getId().toString(), variables);
        return savedIdea;
    }

    // --- THIS METHOD IS NOW CORRECTED ---
    public Idea prioritizeIdea(String processInstanceId, String priority) {
        LOGGER.info("Attempting to prioritize idea for process instance ID: {}", processInstanceId);

        // Step 1: Use the processInstanceId to get the ideaId variable from Camunda
        Long ideaId = (Long) runtimeService.getVariable(processInstanceId, "ideaId");
        if (ideaId == null) {
            throw new RuntimeException("Could not find ideaId for process instance: " + processInstanceId);
        }

        // Step 2: Find and update the idea in our database
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));
        idea.setPriority(priority);
        ideaRepository.save(idea);
        LOGGER.info("Set priority to '{}' for idea ID: {}", priority, ideaId);

        // Step 3: Find the active task using the processInstanceId
        LOGGER.info("Searching for 'Priorisation / Filtrage' task for process instance: {}", processInstanceId);
        Task task = taskService.createTaskQuery()
                .processInstanceId(processInstanceId) // Use processInstanceId for a direct lookup
                .taskDefinitionKey("Activity_10rvc7h") // The ID of the "Priorisation / Filtrage" task
                .singleResult();

        if (task != null) {
            LOGGER.info("Task found! Task ID: {}, Task Name: {}. Completing it now.", task.getId(), task.getName());
            // This task is followed by a gateway that needs the 'retenue' variable
            Map<String, Object> variables = new HashMap<>();
            variables.put("retenue", true);
            taskService.complete(task.getId(), variables);
            LOGGER.info("Task completed successfully.");
        } else {
            LOGGER.error("!!! TASK NOT FOUND for process instance: {}", processInstanceId);
        }
        return idea;
    }

    public List<Idea> getAllIdeas() {
        return ideaRepository.findAll();
    }
}