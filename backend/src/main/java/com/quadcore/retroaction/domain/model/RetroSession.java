package com.quadcore.retroaction.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "retro_sessions")
public class RetroSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String roomCode;

    @Column(nullable = false)
    private String sprintName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RetroPhase phase = RetroPhase.COLLECT;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime closedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RetroItem> items = new ArrayList<>();

    protected RetroSession() {
    }

    public RetroSession(String roomCode, String sprintName, Team team) {
        this.roomCode = roomCode;
        this.sprintName = sprintName;
        this.team = team;
        this.phase = RetroPhase.COLLECT;
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Advances the retro phase following the state machine:
     * COLLECT -> VOTE -> ACTION -> SUMMARY
     *
     * @throws IllegalStateException if the session is already in SUMMARY phase
     */
    public void advancePhase() {
        this.phase = switch (this.phase) {
            case COLLECT -> RetroPhase.VOTE;
            case VOTE -> RetroPhase.ACTION;
            case ACTION -> {
                this.closedAt = LocalDateTime.now();
                yield RetroPhase.SUMMARY;
            }
            case SUMMARY -> throw new IllegalStateException(
                    "Cannot advance phase: session is already in SUMMARY phase");
        };
    }

    public Long getId() {
        return id;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public String getSprintName() {
        return sprintName;
    }

    public RetroPhase getPhase() {
        return phase;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public Team getTeam() {
        return team;
    }

    public List<RetroItem> getItems() {
        return items;
    }
}
