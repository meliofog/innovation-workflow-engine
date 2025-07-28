package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("saveQualificationStatusDelegate")
public class SaveQualificationStatusDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(SaveQualificationStatusDelegate.class);

    @Autowired
    private IdeaRepository ideaRepository;

    // In SaveQualificationStatusDelegate.java

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        String result = (String) execution.getVariable("resultatQualification");

        LOGGER.info("Executing SaveQualificationStatusDelegate for idea ID: {} with result: {}", ideaId, result);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        if (result != null) {
            idea.setStatut(result);

            // If the result is REJETEE, also save the rejection reason
            if ("REJETEE".equals(result)) {
                String motif = (String) execution.getVariable("motifRejet");
                idea.setMotifRejet(motif);
            }

            ideaRepository.save(idea);
            LOGGER.info("Idea {} status updated to {}", ideaId, result);
        } else {
            LOGGER.warn("resultatQualification variable was null for idea ID: {}", ideaId);
        }
    }
}