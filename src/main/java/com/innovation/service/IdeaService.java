package com.innovation.service;

import com.innovation.domain.Developpement;
import com.innovation.domain.Document;
import com.innovation.domain.Idea;
import com.innovation.domain.POC;
import com.innovation.dto.FullIdeaDetailsDto;
import com.innovation.repository.DeveloppementRepository;
import com.innovation.repository.DocumentRepository;
import com.innovation.repository.IdeaRepository;
import com.innovation.repository.POCRepository;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IdeaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(IdeaService.class);

    @Autowired private IdeaRepository ideaRepository;
    @Autowired private RuntimeService runtimeService;
    @Autowired private TaskService taskService;

    @Autowired private DocumentRepository documentRepository;
    @Autowired private POCRepository pocRepository;
    @Autowired private DeveloppementRepository developpementRepository;

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

    @Transactional
    public void deleteIdea(Long ideaId) {
        documentRepository.deleteAll(documentRepository.findByIdeaId(ideaId));
        pocRepository.findByIdeaId(ideaId).ifPresent(pocRepository::delete);
        developpementRepository.findByIdeaId(ideaId).ifPresent(developpementRepository::delete);

        ProcessInstance processInstance = runtimeService.createProcessInstanceQuery()
                .processInstanceBusinessKey(ideaId.toString())
                .singleResult();

        if (processInstance != null) {
            runtimeService.deleteProcessInstance(processInstance.getId(), "Idea deleted by user.");
            LOGGER.info("Deleted process instance {} for idea ID: {}", processInstance.getId(), ideaId);
        } else {
            LOGGER.warn("No running process instance found for idea ID: {}", ideaId);
        }

        ideaRepository.deleteById(ideaId);
        LOGGER.info("Deleted idea with ID: {}", ideaId);
    }

    public FullIdeaDetailsDto getIdeaDetails(Long ideaId) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        POC poc = pocRepository.findByIdeaId(ideaId).orElse(null);
        Developpement developpement = developpementRepository.findByIdeaId(ideaId).orElse(null);
        List<Document> documents = documentRepository.findByIdeaId(ideaId);

        return new FullIdeaDetailsDto(idea, poc, developpement, documents);
    }

    // Existing global filter (unchanged)
    public List<Idea> getFilteredIdeas(String status, String priority) {
        boolean hasStatus = status != null && !status.isEmpty();
        boolean hasPriority = priority != null && !priority.isEmpty();

        if (hasStatus && hasPriority) {
            return ideaRepository.findByStatutAndPriority(status, priority);
        } else if (hasStatus) {
            return ideaRepository.findByStatut(status);
        } else if (hasPriority) {
            return ideaRepository.findByPriority(priority);
        } else {
            return ideaRepository.findAll();
        }
    }

    // NEW: same filter but scoped to a specific creator (DB-side)
    public List<Idea> getFilteredIdeasForCreator(String status, String priority, String createdBy) {
        if (createdBy == null || createdBy.isEmpty()) {
            return getFilteredIdeas(status, priority);
        }

        boolean hasStatus = status != null && !status.isEmpty();
        boolean hasPriority = priority != null && !priority.isEmpty();

        if (hasStatus && hasPriority) {
            return ideaRepository.findByStatutAndPriorityAndCreatedBy(status, priority, createdBy);
        } else if (hasStatus) {
            return ideaRepository.findByStatutAndCreatedBy(status, createdBy);
        } else if (hasPriority) {
            return ideaRepository.findByPriorityAndCreatedBy(priority, createdBy);
        } else {
            return ideaRepository.findByCreatedBy(createdBy);
        }
    }
}
