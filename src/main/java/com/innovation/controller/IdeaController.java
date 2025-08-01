package com.innovation.controller;

import com.innovation.domain.Idea;
import com.innovation.domain.POC; // <-- Add import
import com.innovation.service.IdeaService;
import com.innovation.service.PocService; // <-- Add import
import org.springframework.beans.factory.annotation.Autowired;
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
    private PocService pocService; // <-- Inject PocService

    @GetMapping
    public ResponseEntity<List<Idea>> getIdeas() {
        List<Idea> ideas = ideaService.getAllIdeas();
        return ResponseEntity.ok(ideas);
    }

    // ADD THIS NEW ENDPOINT
    @GetMapping("/{ideaId}/poc")
    public ResponseEntity<POC> getPocForIdea(@PathVariable Long ideaId) {
        POC poc = pocService.getPocByIdeaId(ideaId);
        return ResponseEntity.ok(poc);
    }

    @PostMapping
    public ResponseEntity<Idea> submitIdea(@RequestBody Idea idea) {
        Idea createdIdea = ideaService.createIdea(idea);
        return ResponseEntity.ok(createdIdea);
    }

    @PostMapping("/{processInstanceId}/prioritize") // Changed from ideaId
    public ResponseEntity<Idea> prioritizeIdea(@PathVariable String processInstanceId, @RequestBody Map<String, String> request) {
        String priority = request.get("priority");
        Idea updatedIdea = ideaService.prioritizeIdea(processInstanceId, priority);
        return ResponseEntity.ok(updatedIdea);
    }
}