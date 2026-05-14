package com.quadcore.retroaction.application.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class Dtos {

    private Dtos() {
    }

    // ── Team ────────────────────────────────────────────────────────────

    public record CreateTeamRequest(String name) {
    }

    public record TeamResponse(Long id, String name, LocalDateTime createdAt) {
    }

    // ── Retro Session ───────────────────────────────────────────────────

    public record CreateRetroRequest(String sprintName) {
    }

    public record RetroSessionResponse(
            Long id,
            String roomCode,
            String sprintName,
            String phase,
            LocalDateTime createdAt,
            LocalDateTime closedAt) {
    }

    // ── Preview (AI pre-analysis) ───────────────────────────────────────

    public record PreviewRequest(String text) {
    }

    public record PreviewResponse(String suggestedCategory, String dejaVuWarning) {
    }

    // ── Retro Item ──────────────────────────────────────────────────────

    public record AddItemRequest(String text) {
    }

    public record RetroItemResponse(
            Long id,
            String text,
            String category,
            int votes,
            boolean promoted,
            String dejaVuWarning,
            String smartSuggestion,
            String assignee,
            LocalDate deadline,
            String successCriteria,
            String actionStatus) {
    }

    // ── Promote / Action ────────────────────────────────────────────────

    public record PromoteResponse(Long id, String smartSuggestion) {
    }

    public record UpdateActionRequest(
            String assignee,
            LocalDate deadline,
            String successCriteria) {
    }

    // ── Summary ─────────────────────────────────────────────────────────

    public record SummaryResponse(
            String summary,
            List<String> recurringThemes,
            String teamMorale) {
    }
}
