package com.innovation.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.identity.Group;
import org.camunda.bpm.engine.identity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private IdentityService identityService;

    // Helper method to check for admin privileges
    private boolean isAdmin(HttpServletRequest request) {
        List<String> userGroups = (List<String>) request.getAttribute("userGroups");
        return userGroups != null && userGroups.contains("camunda-admin");
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<User> users = identityService.createUserQuery().list();
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> userData, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User newUser = identityService.newUser(userData.get("id"));
        newUser.setFirstName(userData.get("firstName"));
        newUser.setLastName(userData.get("lastName"));
        newUser.setEmail(userData.get("email"));
        newUser.setPassword(userData.get("password"));
        identityService.saveUser(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody Map<String, String> userData, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User user = identityService.createUserQuery().userId(userId).singleResult();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        user.setFirstName(userData.get("firstName"));
        user.setLastName(userData.get("lastName"));
        user.setEmail(userData.get("email"));
        if (userData.get("password") != null && !userData.get("password").isEmpty()) {
            user.setPassword(userData.get("password"));
        }
        identityService.saveUser(user);

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        identityService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    // Endpoint to get all available groups
    @GetMapping("/groups")
    public ResponseEntity<List<Group>> getAllGroups(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<Group> groups = identityService.createGroupQuery().list();
        return ResponseEntity.ok(groups);
    }

    // --- ADD THIS NEW ENDPOINT ---
    @GetMapping("/{userId}/groups")
    public ResponseEntity<?> getUserGroups(@PathVariable String userId, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Query Camunda for the groups this specific user is a member of
        List<Group> userGroups = identityService.createGroupQuery().groupMember(userId).list();

        return ResponseEntity.ok(userGroups);
    }

    // Endpoint to update a user's group memberships
    @PostMapping("/{userId}/groups")
    public ResponseEntity<?> updateUserGroups(@PathVariable String userId, @RequestBody List<String> groupIds, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // First, clear existing memberships
        List<Group> currentGroups = identityService.createGroupQuery().groupMember(userId).list();
        for (Group group : currentGroups) {
            identityService.deleteMembership(userId, group.getId());
        }

        // Then, add the new memberships
        for (String groupId : groupIds) {
            identityService.createMembership(userId, groupId);
        }

        return ResponseEntity.ok().build();
    }
}