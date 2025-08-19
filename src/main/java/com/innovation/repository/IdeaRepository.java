package com.innovation.repository;

import com.innovation.domain.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // <-- Add this import

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {

    long countByStatut(String statut);
    long countByStatutIn(List<String> statuses);
    long countByPriority(String priority);

    List<Idea> findByStatut(String statut);
    List<Idea> findByPriority(String priority);
    List<Idea> findByStatutAndPriority(String statut, String priority);

    // --- NEW: scope by creator (efficient DB-side filtering) ---
    List<Idea> findByCreatedBy(String createdBy);
    List<Idea> findByStatutAndCreatedBy(String statut, String createdBy);
    List<Idea> findByPriorityAndCreatedBy(String priority, String createdBy);
    List<Idea> findByStatutAndPriorityAndCreatedBy(String statut, String priority, String createdBy);
}