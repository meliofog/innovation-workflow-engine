package com.innovation.controller;

import com.innovation.domain.Developpement;
import com.innovation.repository.DeveloppementRepository;
import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.identity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/developpements")
public class DeveloppementController {

    @Autowired
    private IdentityService identityService;

    @Autowired
    private DeveloppementRepository developpementRepository;

    @Autowired
    private RuntimeService runtimeService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        // This now queries only for users who are members of the "DEV" group.
        List<User> users = identityService.createUserQuery().memberOfGroup("DEV").list();
        return ResponseEntity.ok(users);
    }

    // THIS ENDPOINT IS UPDATED to correctly handle the incoming JSON
    @PostMapping("/process-instances/{processInstanceId}/equipe")
    public ResponseEntity<?> setEquipe(
            @PathVariable String processInstanceId,
            @RequestBody Map<String, Object> request // Use a more flexible Map
    ) {
        // Correctly cast the incoming values
        String chefDeProjet = (String) request.get("chefDeProjet");
        List<String> membresEquipe = (List<String>) request.get("membresEquipe");

        Long ideaId = (Long) runtimeService.getVariable(processInstanceId, "ideaId");
        if (ideaId == null) {
            throw new RuntimeException("Could not find ideaId for process instance: " + processInstanceId);
        }

        Developpement developpement = developpementRepository.findByIdeaId(ideaId)
                .orElseThrow(() -> new RuntimeException("Developpement not found for idea id: " + ideaId));

        developpement.setChefDeProjet(chefDeProjet);
        developpement.setMembresEquipe(String.join(",", membresEquipe));
        developpementRepository.save(developpement);

        return ResponseEntity.ok().build();
    }
}