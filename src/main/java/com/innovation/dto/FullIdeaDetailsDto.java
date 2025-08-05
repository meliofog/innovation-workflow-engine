package com.innovation.dto;

import com.innovation.domain.Developpement;
import com.innovation.domain.Document;
import com.innovation.domain.Idea;
import com.innovation.domain.POC;
import lombok.Data;

import java.util.List;

@Data
public class FullIdeaDetailsDto {
    private Idea idea;
    private POC poc;
    private Developpement developpement;
    private List<Document> documents;

    public FullIdeaDetailsDto(Idea idea, POC poc, Developpement developpement, List<Document> documents) {
        this.idea = idea;
        this.poc = poc;
        this.developpement = developpement;
        this.documents = documents;
    }
}