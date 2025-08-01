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
import java.time.LocalDateTime;

@Component("saveProjectDelegate")
public class SaveProjectDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(SaveProjectDelegate.class);

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private DeveloppementRepository developpementRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        String conclusion = (String) execution.getVariable("conclusion"); // "ok" or "nok"

        LOGGER.info("Saving final project status for idea ID: {} with conclusion: {}", ideaId, conclusion);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        Developpement developpement = developpementRepository.findByIdeaId(ideaId)
                .orElseThrow(() -> new RuntimeException("Development record not found for idea id: " + ideaId));

        if ("ok".equalsIgnoreCase(conclusion)) {
            // Happy path: The project is realized
            idea.setStatut("REALISEE");
            idea.setDateStatus(LocalDateTime.now());

            developpement.setStatutDev("TERMINE");
            developpement.setDateFin(LocalDate.now());
        } else {
            // Negative feedback path
            String avisNegatif = (String) execution.getVariable("avisNegatif");
            developpement.setAvisNegatif(avisNegatif);
            // The idea status might remain "EN_DEVELOPPEMENT" for further action
            idea.setStatut("MVP_REFUSE");
        }

        ideaRepository.save(idea);
        developpementRepository.save(developpement);

        LOGGER.info("Project for idea ID: {} has been saved. Final status: {}", ideaId, idea.getStatut());
    }
}