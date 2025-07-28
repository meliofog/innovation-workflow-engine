package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("savePocDecisionDelegate")
public class SavePocDecisionDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(SavePocDecisionDelegate.class);

    @Autowired
    private IdeaRepository ideaRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        String avis = (String) execution.getVariable("avis");

        LOGGER.info("Executing SavePocDecisionDelegate for idea ID: {} with avis: {}", ideaId, avis);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        // Let's set a new status to show the POC is complete
        idea.setStatut("POC_TERMINE_" + avis.toUpperCase());
        ideaRepository.save(idea);

        LOGGER.info("Idea {} status updated to {}", ideaId, idea.getStatut());
    }
}