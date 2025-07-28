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

@Component("calculateDelayDelegate")
public class CalculateDelayDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(CalculateDelayDelegate.class);

    @Autowired
    private IdeaRepository ideaRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found: " + ideaId));

        // For now, let's hardcode the delay to 1 day for testing
        long delayInHours = 24;

        LocalDateTime startDate = idea.getDateDernierRappel() != null ? idea.getDateDernierRappel() : idea.getDatePriorisation();

        boolean delaiDepasse = false;
        if (startDate != null) {
            LocalDateTime dueDate = startDate.plusHours(delayInHours);
            if (LocalDateTime.now().isAfter(dueDate)) {
                delaiDepasse = true;
            }
        }

        execution.setVariable("delaiDepasse", delaiDepasse);
        idea.setDateDernierRappel(LocalDateTime.now());
        ideaRepository.save(idea);

        LOGGER.info("Deadline check for Idea {}: delaiDepasse = {}", ideaId, delaiDepasse);
    }
}