package com.innovation.repository;

import com.innovation.domain.Developpement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // <-- Ajoutez cet import

@Repository
public interface DeveloppementRepository extends JpaRepository<Developpement, Long> {
    // Cette nouvelle méthode trouvera un développement par l'ID de son idée liée
    Optional<Developpement> findByIdeaId(Long ideaId);
}