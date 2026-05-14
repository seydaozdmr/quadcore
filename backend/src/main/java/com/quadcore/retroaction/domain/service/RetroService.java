package com.quadcore.retroaction.domain.service;

import com.quadcore.retroaction.domain.model.ActionStatus;
import com.quadcore.retroaction.domain.model.RetroItem;
import com.quadcore.retroaction.domain.model.RetroSession;
import com.quadcore.retroaction.domain.model.Team;
import com.quadcore.retroaction.infrastructure.repository.RetroItemRepository;
import com.quadcore.retroaction.infrastructure.repository.RetroSessionRepository;
import com.quadcore.retroaction.infrastructure.repository.TeamRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class RetroService {

    private final RetroSessionRepository retroSessionRepository;
    private final RetroItemRepository retroItemRepository;
    private final TeamRepository teamRepository;
    private final RetroAIService retroAIService;

    public RetroService(RetroSessionRepository retroSessionRepository,
                        RetroItemRepository retroItemRepository,
                        TeamRepository teamRepository,
                        RetroAIService retroAIService) {
        this.retroSessionRepository = retroSessionRepository;
        this.retroItemRepository = retroItemRepository;
        this.teamRepository = teamRepository;
        this.retroAIService = retroAIService;
    }

    public RetroSession createSession(Long teamId, String sprintName) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + teamId));

        String roomCode = UUID.randomUUID().toString().substring(0, 8);
        var session = new RetroSession(roomCode, sprintName, team);
        return retroSessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<RetroSession> getSessionsByTeam(Long teamId) {
        return retroSessionRepository.findByTeamId(teamId);
    }

    @Transactional(readOnly = true)
    public RetroSession joinSession(String roomCode) {
        return findSessionByRoomCode(roomCode);
    }

    public RetroSession advancePhase(String roomCode) {
        RetroSession session = findSessionByRoomCode(roomCode);
        session.advancePhase();
        return retroSessionRepository.save(session);
    }

    /**
     * Previews an item by classifying it and checking for deja vu, without persisting.
     *
     * @return a map containing "category" and optionally "dejaVuWarning"
     */
    @Transactional(readOnly = true)
    public Map<String, String> previewItem(String roomCode, String text) {
        RetroSession session = findSessionByRoomCode(roomCode);
        var category = retroAIService.classifyItem(text);
        String dejaVuWarning = retroAIService.checkDejaVu(session.getId(), text);

        if (dejaVuWarning != null) {
            return Map.of("category", category.name(), "dejaVuWarning", dejaVuWarning);
        }
        return Map.of("category", category.name());
    }

    public RetroItem addItem(String roomCode, String text) {
        RetroSession session = findSessionByRoomCode(roomCode);

        var category = retroAIService.classifyItem(text);
        String embeddingJson = retroAIService.generateEmbeddingJson(text);
        String dejaVuWarning = retroAIService.checkDejaVu(session.getId(), text);

        var item = new RetroItem(text, category, session);
        item.setEmbedding(embeddingJson);
        item.setDejaVuWarning(dejaVuWarning);

        return retroItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<RetroItem> getItems(String roomCode) {
        return retroItemRepository.findBySessionRoomCode(roomCode);
    }

    public RetroItem vote(String roomCode, Long itemId) {
        findSessionByRoomCode(roomCode); // validate room exists
        RetroItem item = retroItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("RetroItem not found with id: " + itemId));
        item.incrementVote();
        return retroItemRepository.save(item);
    }

    public RetroItem promoteToAction(String roomCode, Long itemId) {
        findSessionByRoomCode(roomCode);
        RetroItem item = retroItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("RetroItem not found with id: " + itemId));

        item.setPromoted(true);
        item.setActionStatus(ActionStatus.OPEN);

        String smartSuggestion = retroAIService.analyzeSmart(item.getText());
        item.setSmartSuggestion(smartSuggestion);

        return retroItemRepository.save(item);
    }

    public RetroItem updateAction(String roomCode, Long itemId,
                                  String assignee, LocalDate deadline, String successCriteria) {
        findSessionByRoomCode(roomCode);
        RetroItem item = retroItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("RetroItem not found with id: " + itemId));

        item.setAssignee(assignee);
        item.setDeadline(deadline);
        item.setSuccessCriteria(successCriteria);

        return retroItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public String getSummary(String roomCode) {
        List<RetroItem> items = retroItemRepository.findBySessionRoomCode(roomCode);
        List<String> itemTexts = items.stream()
                .map(RetroItem::getText)
                .toList();
        return retroAIService.generateSummary(itemTexts);
    }

    private RetroSession findSessionByRoomCode(String roomCode) {
        return retroSessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new EntityNotFoundException(
                        "RetroSession not found with roomCode: " + roomCode));
    }
}
