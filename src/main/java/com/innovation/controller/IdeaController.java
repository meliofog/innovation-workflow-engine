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

    private boolean isEmetteurOrAdmin(HttpServletRequest request) {
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");
        return userGroups != null && (userGroups.contains("EM") || userGroups.contains("camunda-admin"));
    }

    // Helper: get caller identity (adjust key names if your auth filter differs)
    private String currentUsername(HttpServletRequest request) {
        Object u = request.getAttribute("username");
        if (u == null) u = request.getAttribute("userEmail");
        return u == null ? null : u.toString();
    }

    @GetMapping
    public ResponseEntity<List<Idea>> getIdeas(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            HttpServletRequest request) {

        List<String> userGroups = (List<String>) request.getAttribute("userGroups");
        boolean isAdmin = userGroups != null && userGroups.contains("camunda-admin");
        boolean isEmetteur = userGroups != null && userGroups.contains("EM");

        if (isEmetteur && !isAdmin) {
            String me = currentUsername(request);
            List<Idea> ideas = ideaService.getFilteredIdeasForCreator(status, priority, me);
            return ResponseEntity.ok(ideas);
        } else {
            List<Idea> ideas = ideaService.getFilteredIdeas(status, priority);
            return ResponseEntity.ok(ideas);
        }
    }

    @GetMapping("/{ideaId}")
    public ResponseEntity<FullIdeaDetailsDto> getIdeaById(@PathVariable Long ideaId) {
        FullIdeaDetailsDto ideaDetails = ideaService.getIdeaDetails(ideaId);
        return ResponseEntity.ok(ideaDetails);
    }

    @PostMapping
    public ResponseEntity<?> submitIdea(@RequestBody Idea idea, HttpServletRequest request) {
        if (!isEmetteurOrAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Emetteur or Admin users can submit ideas.");
        }
        // Stamp creator
        String me = currentUsername(request);
        if (me != null && (idea.getCreatedBy() == null || idea.getCreatedBy().isEmpty())) {
            idea.setCreatedBy(me);
        }
        Idea createdIdea = ideaService.createIdea(idea);
        return ResponseEntity.ok(createdIdea);
    }

    @PutMapping("/{ideaId}")
    public ResponseEntity<?> updateIdea(@PathVariable Long ideaId, @RequestBody Idea ideaDetails, HttpServletRequest request) {
        if (!isEmetteurOrAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Emetteur or Admin users can update ideas.");
        }
        Idea updatedIdea = ideaService.updateIdea(ideaId, ideaDetails);
        return ResponseEntity.ok(updatedIdea);
    }

    @DeleteMapping("/{ideaId}")
    public ResponseEntity<?> deleteIdea(@PathVariable Long ideaId, HttpServletRequest request) {
        if (!isEmetteurOrAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Emetteur or Admin users can delete ideas.");
        }
        ideaService.deleteIdea(ideaId);
        return ResponseEntity.ok().body("Idea deleted successfully.");
    }

    @PostMapping("/{processInstanceId}/prioritize")
    public ResponseEntity<Idea> prioritizeIdea(@PathVariable String processInstanceId, @RequestBody Map<String, String> requestBody) {
        String priority = requestBody.get("priority");
        Idea updatedIdea = ideaService.prioritizeIdea(processInstanceId, priority);
        return ResponseEntity.ok(updatedIdea);
    }
}
