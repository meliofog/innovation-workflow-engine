package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("archiveIdeaDelegate")
public class ArchiveIdeaDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(ArchiveIdeaDelegate.class);

    @Autowired
    private IdeaRepository ideaRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        // Get the ideaId from the process variables
        Long ideaId = (Long) execution.getVariable("ideaId");
        LOGGER.info("Executing ArchiveIdeaDelegate for idea ID: {}", ideaId);

        // Load the idea from the database
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        // Update the status to ARCHIVEE
        idea.setStatut("ARCHIVEE");
        ideaRepository.save(idea);

        LOGGER.info("Idea {} status updated to ARCHIVEE", ideaId);
    }
}