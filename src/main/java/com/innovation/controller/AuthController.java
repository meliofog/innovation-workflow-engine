package com.innovation.controller;

import com.innovation.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.identity.Group;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private IdentityService identityService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        boolean isAuthenticated = identityService.checkPassword(username, password);
        if (isAuthenticated) {
            List<String> groupIds = identityService.createGroupQuery().groupMember(username).list()
                    .stream().map(Group::getId).collect(Collectors.toList());
            String token = jwtUtil.generateToken(username, groupIds);
            return ResponseEntity.ok(Map.of("token", token));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        List<String> groups = jwtUtil.extractGroups(token);
        return ResponseEntity.ok(Map.of("username", username, "groups", groups));
    }
}