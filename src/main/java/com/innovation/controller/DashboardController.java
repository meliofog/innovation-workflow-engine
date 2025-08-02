package com.innovation.controller;

import com.innovation.repository.IdeaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private IdeaRepository ideaRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        // --- Existing Stats ---
        long totalIdeas = ideaRepository.count();
        long ideasInProgress = ideaRepository.countByStatutIn(
                List.of("EN_COURS_DE_QUALIFICATION", "POC_EN_COURS", "EN_DEVELOPPEMENT")
        );
        long ideasRealisee = ideaRepository.countByStatut("REALISEE");
        long ideasAjournee = ideaRepository.countByStatut("AJOURNEE");

        // --- NEW: Priority Stats ---
        long highPriority = ideaRepository.countByPriority("High");
        long mediumPriority = ideaRepository.countByPriority("Medium");
        long lowPriority = ideaRepository.countByPriority("Low");
        long unassignedPriority = ideaRepository.countByPriority(null);

        // Use a mutable HashMap to build the response
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalIdeas", totalIdeas);
        stats.put("ideasInProgress", ideasInProgress);
        stats.put("ideasRealisee", ideasRealisee);
        stats.put("ideasAjournee", ideasAjournee);

        // Add the new priority counts to the map
        Map<String, Long> priorityStats = Map.of(
                "high", highPriority,
                "medium", mediumPriority,
                "low", lowPriority,
                "unassigned", unassignedPriority
        );
        stats.put("priorityStats", priorityStats);

        return ResponseEntity.ok(stats);
    }
}