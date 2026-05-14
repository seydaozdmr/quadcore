package com.quadcore.retroaction.domain.service;

import com.quadcore.retroaction.application.dto.Dtos.ActionItemBriefResponse;
import com.quadcore.retroaction.application.dto.Dtos.AssigneeActionsResponse;
import com.quadcore.retroaction.application.dto.Dtos.DashboardSummaryResponse;
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

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
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

    // ── Dashboard ───────────────────────────────────────────────────────

    /**
     * Demo assignees used when the game flow hasn't actually populated
     * RetroItem.assignee (board team isn't wired end-to-end yet).
     */
    private static final List<String> DEMO_ASSIGNEES = List.of(
            "Haluk", "Neşe", "Soner", "Tchfurtuna");

    private static final long DEMO_DURATION_MINUTES = 27L;
    private static final int DEMO_PROMOTED_FALLBACK_COUNT = 3;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboard(String roomCode) {
        RetroSession session = findSessionByRoomCode(roomCode);
        List<RetroItem> items = retroItemRepository.findBySessionRoomCode(roomCode);

        long durationMinutes = computeDurationMinutes(session.getCreatedAt(), session.getClosedAt());
        List<RetroItem> effectivelyPromoted = resolvePromotedItems(items);

        List<ActionItemBriefResponse> briefs = effectivelyPromoted.stream()
                .map(this::toBriefWithDummies)
                .toList();

        Map<String, List<ActionItemBriefResponse>> grouped = new LinkedHashMap<>();
        for (int i = 0; i < effectivelyPromoted.size(); i++) {
            String assignee = resolveAssignee(effectivelyPromoted.get(i));
            grouped.computeIfAbsent(assignee, k -> new java.util.ArrayList<>()).add(briefs.get(i));
        }

        List<AssigneeActionsResponse> assigneeActions = grouped.entrySet().stream()
                .map(e -> new AssigneeActionsResponse(e.getKey(), e.getValue()))
                .toList();

        int totalVotes = items.stream().mapToInt(RetroItem::getVotes).sum();

        return new DashboardSummaryResponse(
                session.getRoomCode(),
                session.getSprintName(),
                session.getPhase().name(),
                session.getCreatedAt(),
                session.getClosedAt(),
                durationMinutes,
                items.size(),
                totalVotes,
                effectivelyPromoted.size(),
                grouped.size(),
                assigneeActions);
    }

    private long computeDurationMinutes(LocalDateTime startedAt, LocalDateTime endedAt) {
        if (startedAt == null || endedAt == null) {
            return DEMO_DURATION_MINUTES;
        }
        long minutes = Duration.between(startedAt, endedAt).toMinutes();
        return minutes > 0 ? minutes : DEMO_DURATION_MINUTES;
    }

    /**
     * If the session has actual promoted items, use them. Otherwise (demo path)
     * fall back to the top-N most-voted items so the dashboard has something to show.
     */
    private List<RetroItem> resolvePromotedItems(List<RetroItem> items) {
        List<RetroItem> realPromoted = items.stream()
                .filter(RetroItem::isPromoted)
                .toList();
        if (!realPromoted.isEmpty()) {
            return realPromoted;
        }
        return items.stream()
                .sorted(Comparator.comparingInt(RetroItem::getVotes).reversed())
                .limit(Math.min(DEMO_PROMOTED_FALLBACK_COUNT, items.size()))
                .toList();
    }

    private ActionItemBriefResponse toBriefWithDummies(RetroItem item) {
        LocalDate deadline = item.getDeadline() != null
                ? item.getDeadline()
                : LocalDate.now().plusDays(7 + Math.abs(item.getId() % 7));
        String successCriteria = item.getSuccessCriteria() != null
                ? item.getSuccessCriteria()
                : "Bir sonraki sprint sonunda doğrulanacak";
        String actionStatus = item.getActionStatus() != null
                ? item.getActionStatus().name()
                : ActionStatus.OPEN.name();
        return new ActionItemBriefResponse(
                item.getId(),
                item.getText(),
                item.getCategory().name(),
                item.getVotes(),
                deadline,
                successCriteria,
                actionStatus);
    }

    private String resolveAssignee(RetroItem item) {
        if (item.getAssignee() != null && !item.getAssignee().isBlank()) {
            return item.getAssignee();
        }
        int index = (int) Math.floorMod(item.getId(), DEMO_ASSIGNEES.size());
        return DEMO_ASSIGNEES.get(index);
    }

    private RetroSession findSessionByRoomCode(String roomCode) {
        return retroSessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new EntityNotFoundException(
                        "RetroSession not found with roomCode: " + roomCode));
    }
}
