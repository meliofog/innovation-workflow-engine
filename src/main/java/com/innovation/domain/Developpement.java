package com.innovation.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Developpement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateLancement;
    private LocalDate dateFin;
    private String description;
    private String statutDev; // e.g., "EN_COURS", "TERMINE"
    private String avisNegatif;
    private String chefDeProjet; // To store the User ID of the project lead

    @Column(length = 1000) // Allow for a long list of user IDs
    private String membresEquipe; // To store a comma-separated list of team member User IDs

    @OneToOne
    @JoinColumn(name = "idea_id")
    private Idea idea;
}