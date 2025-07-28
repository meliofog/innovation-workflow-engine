package com.innovation.repository;

import com.innovation.domain.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {
    // Spring Data JPA will automatically implement the necessary methods
}