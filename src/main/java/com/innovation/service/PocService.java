package com.innovation.service;

import com.innovation.domain.POC;
import com.innovation.repository.POCRepository;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PocService {

    @Autowired
    private POCRepository pocRepository;

    @Autowired
    private TaskService taskService;

    public POC getPocByIdeaId(Long ideaId) {
        return pocRepository.findByIdeaId(ideaId)
                .orElseThrow(() -> new RuntimeException("POC not found for ideaId: " + ideaId));
    }

    public POC updatePoc(Long pocId, Map<String, Object> updates) {
        POC poc = pocRepository.findById(pocId)
                .orElseThrow(() -> new RuntimeException("POC not found with id: " + pocId));

        // Update fields if they are provided in the request
        updates.forEach((key, value) -> {
            switch (key) {
                case "chargeEstimee":
                    poc.setChargeEstimee((String) value);
                    break;
                case "coutEstime":
                    poc.setCoutEstime(((Number) value).doubleValue());
                    break;
                case "businessModel":
                    poc.setBusinessModel((String) value);
                    break;
            }
        });

        return pocRepository.save(poc);
    }

    public POC concludePoc(Long pocId, String conclusion, String decision) {
        // Step 1: Find and update the POC record
        POC poc = pocRepository.findById(pocId)
                .orElseThrow(() -> new RuntimeException("POC not found with id: " + pocId));
        poc.setConclusion(conclusion);
        poc.setDecision(decision);
        pocRepository.save(poc);

        // Step 2: Find the related Camunda task using the business key from the Idea
        Long ideaId = poc.getIdea().getId();
        Task task = taskService.createTaskQuery()
                .processInstanceBusinessKey(ideaId.toString())
                .taskDefinitionKey("Activity_1oplie6") // ID for "Saisir la conclusion du POC"
                .singleResult();

        if (task != null) {
            // Step 3: Complete the task and pass the 'avis' variable to the gateway
            Map<String, Object> variables = new HashMap<>();
            variables.put("avis", decision);
            taskService.complete(task.getId(), variables);
        }

        return poc;
    }
}