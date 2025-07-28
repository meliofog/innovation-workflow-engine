package com.innovation.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class POC {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String businessModel;
    private String chargeEstimee;
    private Double coutEstime;
    private String conclusion;
    private String decision;

    @OneToOne
    @JoinColumn(name = "idea_id") // Links this POC to an Idea
    private Idea idea;
}