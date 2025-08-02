package com.innovation.dto;

import com.innovation.domain.Document;
import com.innovation.domain.Idea;
import lombok.Data;

import java.util.List;

@Data
public class IdeaDetailsDto {
    private Idea idea;
    private List<Document> documents;

    public IdeaDetailsDto(Idea idea, List<Document> documents) {
        this.idea = idea;
        this.documents = documents;
    }
}