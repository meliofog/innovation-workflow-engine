package com.innovation.service;

import com.innovation.domain.Developpement;
import com.innovation.domain.Idea;
import com.innovation.repository.DeveloppementRepository;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component("createDeveloppementDelegate")
public class CreateDeveloppementDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(CreateDeveloppementDelegate.class);

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private DeveloppementRepository developpementRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        LOGGER.info("Creating Developpement record for idea ID: {}", ideaId);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        // Update idea status
        idea.setStatut("EN_DEVELOPPEMENT");
        ideaRepository.save(idea);

        // Create and save the new Developpement record
        Developpement newDeveloppement = new Developpement();
        newDeveloppement.setIdea(idea);
        newDeveloppement.setStatutDev("EN_COURS");
        newDeveloppement.setDateLancement(LocalDate.now());
        developpementRepository.save(newDeveloppement);

        LOGGER.info("Developpement record created for idea ID: {}", ideaId);
    }
}