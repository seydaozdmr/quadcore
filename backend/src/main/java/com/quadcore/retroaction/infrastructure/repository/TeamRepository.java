package com.quadcore.retroaction.infrastructure.repository;

import com.quadcore.retroaction.domain.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
}
