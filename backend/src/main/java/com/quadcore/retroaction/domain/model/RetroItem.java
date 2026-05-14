package com.quadcore.retroaction.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "retro_items")
public class RetroItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RetroCategory category;

    @Column(nullable = false)
    private int votes = 0;

    @Column(nullable = false)
    private boolean promoted = false;

    @Column(columnDefinition = "TEXT")
    private String embedding;

    @Column(columnDefinition = "TEXT")
    private String dejaVuWarning;

    @Column(columnDefinition = "TEXT")
    private String smartSuggestion;

    private String assignee;

    private LocalDate deadline;

    private String successCriteria;

    @Enumerated(EnumType.STRING)
    private ActionStatus actionStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private RetroSession session;

    protected RetroItem() {
    }

    public RetroItem(String text, RetroCategory category, RetroSession session) {
        this.text = text;
        this.category = category;
        this.session = session;
    }

    public void incrementVote() {
        this.votes++;
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public RetroCategory getCategory() {
        return category;
    }

    public void setCategory(RetroCategory category) {
        this.category = category;
    }

    public int getVotes() {
        return votes;
    }

    public boolean isPromoted() {
        return promoted;
    }

    public void setPromoted(boolean promoted) {
        this.promoted = promoted;
    }

    public String getEmbedding() {
        return embedding;
    }

    public void setEmbedding(String embedding) {
        this.embedding = embedding;
    }

    public String getDejaVuWarning() {
        return dejaVuWarning;
    }

    public void setDejaVuWarning(String dejaVuWarning) {
        this.dejaVuWarning = dejaVuWarning;
    }

    public String getSmartSuggestion() {
        return smartSuggestion;
    }

    public void setSmartSuggestion(String smartSuggestion) {
        this.smartSuggestion = smartSuggestion;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getSuccessCriteria() {
        return successCriteria;
    }

    public void setSuccessCriteria(String successCriteria) {
        this.successCriteria = successCriteria;
    }

    public ActionStatus getActionStatus() {
        return actionStatus;
    }

    public void setActionStatus(ActionStatus actionStatus) {
        this.actionStatus = actionStatus;
    }

    public RetroSession getSession() {
        return session;
    }
}
