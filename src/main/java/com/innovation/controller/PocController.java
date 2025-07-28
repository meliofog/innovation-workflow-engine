package com.innovation.controller;

import com.innovation.domain.POC;
import com.innovation.service.PocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pocs")
public class PocController {

    @Autowired
    private PocService pocService;

    @PutMapping("/{pocId}")
    public ResponseEntity<POC> updatePoc(@PathVariable Long pocId, @RequestBody Map<String, Object> updates) {
        POC updatedPoc = pocService.updatePoc(pocId, updates);
        return ResponseEntity.ok(updatedPoc);
    }

    @PostMapping("/{pocId}/conclude")
    public ResponseEntity<POC> concludePoc(@PathVariable Long pocId, @RequestBody Map<String, String> request) {
        String conclusion = request.get("conclusion");
        String decision = request.get("decision");
        POC concludedPoc = pocService.concludePoc(pocId, conclusion, decision);
        return ResponseEntity.ok(concludedPoc);
    }
}