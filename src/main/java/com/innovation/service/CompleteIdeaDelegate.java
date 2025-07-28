package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("completeIdeaDelegate")
public class CompleteIdeaDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(CompleteIdeaDelegate.class);

    @Autowired
    private IdeaRepository ideaRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        // Get the ideaId from the process variables
        Long ideaId = (Long) execution.getVariable("ideaId");
        LOGGER.info("Executing CompleteIdeaDelegate for idea ID: {}", ideaId);

        // Load the idea from the database
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        // Implement your logic here, for example, updating the status
        idea.setStatut("EN_COURS_DE_QUALIFICATION");
        ideaRepository.save(idea);

        LOGGER.info("Idea {} status updated to EN_COURS_DE_QUALIFICATION", ideaId);
    }
}