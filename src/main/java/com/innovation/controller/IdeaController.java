package com.innovation.controller;

import com.innovation.domain.Idea;
import com.innovation.domain.POC;
import com.innovation.service.IdeaService;
import com.innovation.service.PocService;
import com.innovation.dto.IdeaDetailsDto;
import jakarta.servlet.http.HttpServletRequest; // <-- Add this import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // <-- Add this import
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ideas")
public class IdeaController {

    @Autowired
    private IdeaService ideaService;

    @Autowired
    private PocService pocService;

    @GetMapping
    public ResponseEntity<List<Idea>> getIdeas() {
        List<Idea> ideas = ideaService.getAllIdeas();
        return ResponseEntity.ok(ideas);
    }

    @GetMapping("/{ideaId}/poc")
    public ResponseEntity<POC> getPocForIdea(@PathVariable Long ideaId) {
        POC poc = pocService.getPocByIdeaId(ideaId);
        return ResponseEntity.ok(poc);
    }

    @PostMapping
    public ResponseEntity<?> submitIdea(@RequestBody Idea idea, HttpServletRequest request) {
        // Authorization Check: Only users in the 'EM' group can submit ideas
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");
        if (userGroups == null || !userGroups.contains("EM")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Emetteur users can submit ideas.");
        }

        Idea createdIdea = ideaService.createIdea(idea);
        return ResponseEntity.ok(createdIdea);
    }

    // NEW ENDPOINT for updating an idea
    @PutMapping("/{ideaId}")
    public ResponseEntity<?> updateIdea(@PathVariable Long ideaId, @RequestBody Idea ideaDetails, HttpServletRequest request) {
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");
        if (userGroups == null || !userGroups.contains("EM")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Emetteur users can update ideas.");
        }

        Idea updatedIdea = ideaService.updateIdea(ideaId, ideaDetails);
        return ResponseEntity.ok(updatedIdea);
    }

    // NEW ENDPOINT for deleting an idea
    @DeleteMapping("/{ideaId}")
    public ResponseEntity<?> deleteIdea(@PathVariable Long ideaId, HttpServletRequest request) {
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");
        if (userGroups == null || !userGroups.contains("EM")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Emetteur users can delete ideas.");
        }

        ideaService.deleteIdea(ideaId);
        return ResponseEntity.ok().body("Idea deleted successfully.");
    }

    @PostMapping("/{processInstanceId}/prioritize")
    public ResponseEntity<Idea> prioritizeIdea(@PathVariable String processInstanceId, @RequestBody Map<String, String> request) {
        String priority = request.get("priority");
        Idea updatedIdea = ideaService.prioritizeIdea(processInstanceId, priority);
        return ResponseEntity.ok(updatedIdea);
    }

    @GetMapping("/{ideaId}")
    public ResponseEntity<IdeaDetailsDto> getIdeaById(@PathVariable Long ideaId) {
        IdeaDetailsDto ideaDetails = ideaService.getIdeaDetails(ideaId);
        return ResponseEntity.ok(ideaDetails);
    }

}