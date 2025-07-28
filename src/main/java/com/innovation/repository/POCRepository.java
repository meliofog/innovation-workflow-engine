package com.innovation.repository;

import com.innovation.domain.POC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // <-- Add import

@Repository
public interface POCRepository extends JpaRepository<POC, Long> {
    // This new method will find a POC by its linked Idea's ID
    Optional<POC> findByIdeaId(Long ideaId);
}