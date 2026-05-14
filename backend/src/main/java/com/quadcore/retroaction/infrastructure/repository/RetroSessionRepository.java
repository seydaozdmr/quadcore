package com.quadcore.retroaction.infrastructure.repository;

import com.quadcore.retroaction.domain.model.RetroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RetroSessionRepository extends JpaRepository<RetroSession, Long> {

    Optional<RetroSession> findByRoomCode(String roomCode);

    List<RetroSession> findByTeamId(Long teamId);

    List<RetroSession> findByTeamIdOrderByCreatedAtDesc(Long teamId);
}
