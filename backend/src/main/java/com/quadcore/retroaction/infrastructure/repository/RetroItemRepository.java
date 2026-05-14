package com.quadcore.retroaction.infrastructure.repository;

import com.quadcore.retroaction.domain.model.RetroItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RetroItemRepository extends JpaRepository<RetroItem, Long> {

    List<RetroItem> findBySessionId(Long sessionId);

    List<RetroItem> findBySessionIdOrderByVotesDesc(Long sessionId);

    @Query("SELECT ri FROM RetroItem ri WHERE ri.session.id != :sessionId AND ri.embedding IS NOT NULL")
    List<RetroItem> findItemsWithEmbeddingExcludingSession(@Param("sessionId") Long sessionId);

    List<RetroItem> findByEmbeddingIsNotNullAndSessionIdNot(Long excludeSessionId);

    List<RetroItem> findBySessionRoomCode(String roomCode);
}
