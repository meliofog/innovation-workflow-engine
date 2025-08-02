package com.innovation.service;

import com.innovation.domain.Document;
import com.innovation.domain.Idea;
import com.innovation.dto.IdeaDetailsDto;
import com.innovation.repository.DocumentRepository;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.ProcessInstance; // <-- Add this import
import org.camunda.bpm.engine.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- Add this import

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IdeaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(IdeaService.class);

    @Autowired
    private IdeaRepository ideaRepository;
    @Autowired
    private RuntimeService runtimeService;
    @Autowired
    private TaskService taskService;
    @Autowired
    private DocumentRepository documentRepository;

    public Idea createIdea(Idea idea) {
        Idea savedIdea = ideaRepository.save(idea);
        Map<String, Object> variables = new HashMap<>();
        variables.put("ideaId", savedIdea.getId());
        runtimeService.startProcessInstanceByKey("innovation_process", savedIdea.getId().toString(), variables);
        return savedIdea;
    }

    public Idea prioritizeIdea(String processInstanceId, String priority) {
        Long ideaId = (Long) runtimeService.getVariable(processInstanceId, "ideaId");
        if (ideaId == null) {
            throw new RuntimeException("Could not find ideaId for process instance: " + processInstanceId);
        }
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));
        idea.setPriority(priority);
        ideaRepository.save(idea);

        Task task = taskService.createTaskQuery()
                .processInstanceId(processInstanceId)
                .taskDefinitionKey("Activity_10rvc7h")
                .singleResult();

        if (task != null) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("retenue", true);
            taskService.complete(task.getId(), variables);
        }
        return idea;
    }

    public List<Idea> getAllIdeas() {
        return ideaRepository.findAll();
    }

    public Idea updateIdea(Long ideaId, Idea ideaDetails) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));
        idea.setTitre(ideaDetails.getTitre());
        idea.setDescription(ideaDetails.getDescription());
        return ideaRepository.save(idea);
    }

    // --- THIS METHOD IS NOW CORRECTED ---
    @Transactional // Ensures both operations (Camunda and DB) succeed or fail together
    public void deleteIdea(Long ideaId) {
        // Step 1: Find the running process instance using the ideaId as the business key.
        ProcessInstance processInstance = runtimeService.createProcessInstanceQuery()
                .processInstanceBusinessKey(ideaId.toString())
                .singleResult();

        // Step 2: If a process instance exists, delete it.
        if (processInstance != null) {
            runtimeService.deleteProcessInstance(processInstance.getId(), "Idea deleted by user.");
            LOGGER.info("Deleted process instance {} for idea ID: {}", processInstance.getId(), ideaId);
        } else {
            LOGGER.warn("No running process instance found for idea ID: {}", ideaId);
        }

        // Step 3: Delete the idea from our application's database.
        ideaRepository.deleteById(ideaId);
        LOGGER.info("Deleted idea with ID: {}", ideaId);
    }

    public IdeaDetailsDto getIdeaDetails(Long ideaId) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));
        List<Document> documents = documentRepository.findByIdeaId(ideaId);
        return new IdeaDetailsDto(idea, documents);
    }
}
