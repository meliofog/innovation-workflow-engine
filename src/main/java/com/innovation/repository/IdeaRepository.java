package com.innovation.repository;

import com.innovation.domain.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // <-- Add this import

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {

    // Counts how many ideas have a specific status
    long countByStatut(String statut);

    // Counts how many ideas have a status that is in the provided list
    long countByStatutIn(List<String> statuses);

    // NEW: Counts how many ideas have a specific priority
    long countByPriority(String priority);

    List<Idea> findByStatut(String statut);
    List<Idea> findByPriority(String priority);
    List<Idea> findByStatutAndPriority(String statut, String priority);
}