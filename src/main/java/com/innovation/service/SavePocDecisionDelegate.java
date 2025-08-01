package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.domain.POC;
import com.innovation.repository.IdeaRepository;
import com.innovation.repository.POCRepository;
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

    @Autowired
    private POCRepository pocRepository; // This is needed to find the POC

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        String avis = (String) execution.getVariable("avis");
        // NEW: Get the conclusion from the process variables
        String conclusion = (String) execution.getVariable("conclusion");

        LOGGER.info("Executing SavePocDecisionDelegate for idea ID: {} with avis: {}", ideaId, avis);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        // Find the related POC record
        POC poc = pocRepository.findByIdeaId(ideaId)
                .orElseThrow(() -> new RuntimeException("POC not found for idea id: " + ideaId));

        // NEW: Update the POC entity with the conclusion and decision
        poc.setConclusion(conclusion);
        poc.setDecision(avis);
        pocRepository.save(poc);

        // Update the Idea status
        idea.setStatut("POC_TERMINE_" + avis.toUpperCase());
        ideaRepository.save(idea);

        LOGGER.info("Idea {} status updated to {}", ideaId, idea.getStatut());
    }
}