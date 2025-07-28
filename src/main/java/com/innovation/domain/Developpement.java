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

    @OneToOne
    @JoinColumn(name = "idea_id")
    private Idea idea;
}