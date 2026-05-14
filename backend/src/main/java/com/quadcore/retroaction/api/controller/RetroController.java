package com.quadcore.retroaction.api.controller;

import com.quadcore.retroaction.application.dto.Dtos.*;
import com.quadcore.retroaction.domain.model.RetroItem;
import com.quadcore.retroaction.domain.model.RetroSession;
import com.quadcore.retroaction.domain.service.RetroService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/retros")
public class RetroController {

    private final RetroService retroService;

    public RetroController(RetroService retroService) {
        this.retroService = retroService;
    }

    // ── Session management ──────────────────────────────────────────────

    @PostMapping("/teams/{teamId}")
    @ResponseStatus(HttpStatus.CREATED)
    public RetroSessionResponse createSession(
            @PathVariable Long teamId,
            @RequestBody CreateRetroRequest request) {
        RetroSession session = retroService.createSession(teamId, request.sprintName());
        return toSessionResponse(session);
    }

    @GetMapping("/teams/{teamId}")
    public List<RetroSessionResponse> getSessionsByTeam(@PathVariable Long teamId) {
        return retroService.getSessionsByTeam(teamId).stream()
                .map(RetroController::toSessionResponse)
                .toList();
    }

    @GetMapping("/join/{roomCode}")
    public RetroSessionResponse joinSession(@PathVariable String roomCode) {
        RetroSession session = retroService.joinSession(roomCode);
        return toSessionResponse(session);
    }

    @PostMapping("/{roomCode}/advance")
    public RetroSessionResponse advancePhase(@PathVariable String roomCode) {
        RetroSession session = retroService.advancePhase(roomCode);
        return toSessionResponse(session);
    }

    // ── Phase 1: Collect ────────────────────────────────────────────────

    @PostMapping("/{roomCode}/items/preview")
    public PreviewResponse previewItem(
            @PathVariable String roomCode,
            @RequestBody PreviewRequest request) {
        Map<String, String> result = retroService.previewItem(roomCode, request.text());
        return new PreviewResponse(
                result.get("category"),
                result.getOrDefault("dejaVuWarning", null));
    }

    @PostMapping("/{roomCode}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public RetroItemResponse addItem(
            @PathVariable String roomCode,
            @RequestBody AddItemRequest request) {
        RetroItem item = retroService.addItem(roomCode, request.text());
        return toItemResponse(item);
    }

    @GetMapping("/{roomCode}/items")
    public List<RetroItemResponse> getItems(@PathVariable String roomCode) {
        return retroService.getItems(roomCode).stream()
                .map(RetroController::toItemResponse)
                .toList();
    }

    // ── Phase 2: Vote ───────────────────────────────────────────────────

    @PostMapping("/{roomCode}/items/{itemId}/vote")
    public RetroItemResponse vote(
            @PathVariable String roomCode,
            @PathVariable Long itemId) {
        RetroItem item = retroService.vote(roomCode, itemId);
        return toItemResponse(item);
    }

    // ── Phase 3: Action ─────────────────────────────────────────────────

    @PostMapping("/{roomCode}/items/{itemId}/promote")
    public PromoteResponse promoteToAction(
            @PathVariable String roomCode,
            @PathVariable Long itemId) {
        RetroItem item = retroService.promoteToAction(roomCode, itemId);
        return new PromoteResponse(item.getId(), item.getSmartSuggestion());
    }

    @PutMapping("/{roomCode}/items/{itemId}/action")
    public RetroItemResponse updateAction(
            @PathVariable String roomCode,
            @PathVariable Long itemId,
            @RequestBody UpdateActionRequest request) {
        RetroItem item = retroService.updateAction(
                roomCode, itemId,
                request.assignee(), request.deadline(), request.successCriteria());
        return toItemResponse(item);
    }

    // ── Phase 4: Summary ────────────────────────────────────────────────

    @GetMapping("/{roomCode}/summary")
    public SummaryResponse getSummary(@PathVariable String roomCode) {
        String summary = retroService.getSummary(roomCode);
        return new SummaryResponse(summary, List.of(), null);
    }

    // ── Mapping helpers ─────────────────────────────────────────────────

    private static RetroSessionResponse toSessionResponse(RetroSession session) {
        return new RetroSessionResponse(
                session.getId(),
                session.getRoomCode(),
                session.getSprintName(),
                session.getPhase().name(),
                session.getCreatedAt(),
                session.getClosedAt());
    }

    private static RetroItemResponse toItemResponse(RetroItem item) {
        return new RetroItemResponse(
                item.getId(),
                item.getText(),
                item.getCategory().name(),
                item.getVotes(),
                item.isPromoted(),
                item.getDejaVuWarning(),
                item.getSmartSuggestion(),
                item.getAssignee(),
                item.getDeadline(),
                item.getSuccessCriteria(),
                item.getActionStatus() != null ? item.getActionStatus().name() : null);
    }
}
