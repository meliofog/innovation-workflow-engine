package com.innovation.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String filePath;
    private String fileType;
    private LocalDateTime uploadDate;

    @ManyToOne
    @JoinColumn(name = "idea_id")
    private Idea idea;
}