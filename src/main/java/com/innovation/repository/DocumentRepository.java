package com.innovation.repository;

import com.innovation.domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    // This will allow us to find all documents for a specific idea
    List<Document> findByIdeaId(Long ideaId);
}