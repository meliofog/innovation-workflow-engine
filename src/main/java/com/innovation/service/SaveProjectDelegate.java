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
        LOGGER.info("Enregistrement du projet final pour l'idée ID: {}", ideaId);

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idée non trouvée avec l'id: " + ideaId));

        // Mettre à jour l'idée avec son statut final
        idea.setStatut("REALISEE");
        idea.setDateStatus(LocalDateTime.now());
        ideaRepository.save(idea);

        // Trouver et mettre à jour l'enregistrement de développement
        Developpement developpement = developpementRepository.findByIdeaId(ideaId)
                .orElseThrow(() -> new RuntimeException("Développement non trouvé pour l'idée id: " + ideaId));

        developpement.setStatutDev("TERMINE");
        developpement.setDateFin(LocalDate.now());
        developpementRepository.save(developpement);

        LOGGER.info("Le projet pour l'idée ID: {} a été enregistré et son statut mis à jour.", ideaId);
    }
}