package com.innovation.config;

import org.camunda.bpm.engine.IdentityService;
import org.camunda.bpm.engine.identity.Group;
import org.camunda.bpm.engine.identity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class UserDataGenerator implements CommandLineRunner {

    @Autowired
    private IdentityService identityService;

    @Override
    public void run(String... args) throws Exception {
        // Create Groups if they don't exist
        createGroup("CSI", "Comité scientifique d’innovation");
        createGroup("CQ", "Commission de qualification");
        createGroup("DEV", "Equipe technique");
        createGroup("EM", "Emetteur");

        // Create Users if they don't exist
        createUser("emetteurUser", "Emetteur", "User", "password", "emetteur@demo.com");
        createUser("cqUser", "Commission", "Qualification", "password", "cq@demo.com");
        createUser("csiUser", "Comite", "Scientifique", "password", "csi@demo.com");
        createUser("devUser", "Developer", "User", "password", "dev@demo.com"); // <-- ADD THIS LINE

        // Create Memberships with the new user IDs
        createMembership("cqUser", "CQ");
        createMembership("csiUser", "CSI");
        createMembership("emetteurUser", "EM");
        createMembership("devUser", "DEV"); // <-- ADD THIS LINE
    }

    private void createGroup(String groupId, String groupName) {
        if (identityService.createGroupQuery().groupId(groupId).count() == 0) {
            Group newGroup = identityService.newGroup(groupId);
            newGroup.setName(groupName);
            newGroup.setType("WORKFLOW");
            identityService.saveGroup(newGroup);
        }
    }

    private void createUser(String userId, String firstName, String lastName, String password, String email) {
        if (identityService.createUserQuery().userId(userId).count() == 0) {
            User newUser = identityService.newUser(userId);
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            newUser.setPassword(password);
            newUser.setEmail(email);
            identityService.saveUser(newUser);
        }
    }

    private void createMembership(String userId, String groupId) {
        if (identityService.createUserQuery().userId(userId).memberOfGroup(groupId).count() == 0) {
            identityService.createMembership(userId, groupId);
        }
    }
}