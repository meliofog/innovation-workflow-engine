package com.innovation.service;

import com.innovation.domain.Idea;
import com.innovation.repository.IdeaRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component("setPrioritizationDateDelegate")
public class SetPrioritizationDateDelegate implements JavaDelegate {

    @Autowired
    private IdeaRepository ideaRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found: " + ideaId));

        idea.setDatePriorisation(LocalDateTime.now());
        ideaRepository.save(idea);
    }
}