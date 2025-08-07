package com.innovation.controller;

import com.innovation.domain.Idea;
import com.innovation.dto.FullIdeaDetailsDto;
import com.innovation.service.IdeaService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ideas")
public class IdeaController {

    @Autowired
    private IdeaService ideaService;

    // We no longer need PocService here, as IdeaService handles everything.

    @GetMapping
    public ResponseEntity<List<Idea>> getIdeas(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        List<Idea> ideas = ideaService.getFilteredIdeas(status, priority);
        return ResponseEntity.ok(ideas);
    }

    // This is now the single, definitive endpoint for getting all details for an idea.
    @GetMapping("/{ideaId}")
    public ResponseEntity<FullIdeaDetailsDto> getIdeaById(@PathVariable Long ideaId) {
        FullIdeaDetailsDto ideaDetails = ideaService.getIdeaDetails(ideaId);
        return ResponseEntity.ok(ideaDetails);
    }

    @PostMapping
    public ResponseEntity<?> submitIdea(@RequestBody Idea idea, HttpServletRequest request) {
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");
        if (userGroups == null || !userGroups.contains("EM")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Emetteur users can submit ideas.");
        }
        Idea createdIdea = ideaService.createIdea(idea);
        return ResponseEntity.ok(createdIdea);
    }

    @PutMapping("/{ideaId}")
    public ResponseEntity<?> updateIdea(@PathVariable Long ideaId, @RequestBody Idea ideaDetails, HttpServletRequest request) {
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");
        if (userGroups == null || !userGroups.contains("EM")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Emetteur users can update ideas.");
        }
        Idea updatedIdea = ideaService.updateIdea(ideaId, ideaDetails);
        return ResponseEntity.ok(updatedIdea);
    }

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
}