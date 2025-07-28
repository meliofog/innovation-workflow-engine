package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component("recycleIdeaDelegate")
public class RecycleIdeaDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecycleIdeaDelegate.class);

    @Autowired
    private IdeaRepository ideaRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        LOGGER.info("Recycling idea ID: {}", ideaId);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        // Change status and set the status date
        idea.setStatut("EN_ATTENTE_DE_QUALIFICATION");
        idea.setDateStatus(LocalDateTime.now());
        ideaRepository.save(idea);

        LOGGER.info("Idea {} has been recycled. Status is now EN_ATTENTE_DE_QUALIFICATION.", ideaId);
    }
}