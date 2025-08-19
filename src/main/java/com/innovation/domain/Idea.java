package com.innovation.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    private String description;

    private String statut;

    private LocalDateTime dateCreation;

    private String priority;

    private String motifRejet;

    private LocalDateTime dateStatus;

    private LocalDateTime datePriorisation;

    private LocalDateTime dateDernierRappel;

    private String createdBy;

    public Idea() {
        this.dateCreation = LocalDateTime.now();
        this.statut = "EN_ATTENTE_PREQUALIFICATION";
    }
}