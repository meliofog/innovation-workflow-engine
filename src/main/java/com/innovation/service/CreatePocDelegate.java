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

import java.time.LocalDateTime; // <-- Add import
import java.time.ZoneId;      // <-- Add import
import java.util.Date;        // <-- Add import

@Component("createPocDelegate")
public class CreatePocDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(CreatePocDelegate.class);

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private POCRepository pocRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        LOGGER.info("Creating POC record for idea ID: {}", ideaId);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        // Update idea status
        idea.setStatut("POC_EN_COURS");
        ideaRepository.save(idea);

        // Create and save the new POC record
        POC newPoc = new POC();
        newPoc.setIdea(idea);
        pocRepository.save(newPoc);

        // --- ADD THIS LOGIC ---
        // Set a deadline for the POC, e.g., 10 days from now
        LocalDateTime deadline = LocalDateTime.now().plusDays(10);
        Date dateEcheance = Date.from(deadline.atZone(ZoneId.systemDefault()).toInstant());
        execution.setVariable("dateEcheance", dateEcheance);

        LOGGER.info("POC record created for idea ID: {} with deadline: {}", ideaId, dateEcheance);
    }
}