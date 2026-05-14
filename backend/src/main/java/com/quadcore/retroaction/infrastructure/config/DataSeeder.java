package com.quadcore.retroaction.infrastructure.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadcore.retroaction.domain.model.RetroCategory;
import com.quadcore.retroaction.domain.model.RetroItem;
import com.quadcore.retroaction.domain.model.RetroSession;
import com.quadcore.retroaction.domain.model.Team;
import com.quadcore.retroaction.infrastructure.adapter.out.embedding.MockEmbeddingAdapter;
import com.quadcore.retroaction.infrastructure.repository.RetroItemRepository;
import com.quadcore.retroaction.infrastructure.repository.RetroSessionRepository;
import com.quadcore.retroaction.infrastructure.repository.TeamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final int EMBEDDING_DIMENSIONS = 128;

    private final TeamRepository teamRepository;
    private final RetroSessionRepository retroSessionRepository;
    private final RetroItemRepository retroItemRepository;
    private final ObjectMapper objectMapper;

    public DataSeeder(TeamRepository teamRepository,
                      RetroSessionRepository retroSessionRepository,
                      RetroItemRepository retroItemRepository,
                      ObjectMapper objectMapper) {
        this.teamRepository = teamRepository;
        this.retroSessionRepository = retroSessionRepository;
        this.retroItemRepository = retroItemRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) {
        if (teamRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        log.info("Seeding demo data...");

        // Create team
        Team team = teamRepository.save(new Team("QuadCore Backend Team"));

        // Create retro sessions (all in SUMMARY phase, closed)
        RetroSession sprint12 = createClosedSession("Sprint 12 Retrospective", team);
        RetroSession sprint14 = createClosedSession("Sprint 14 Retrospective", team);
        RetroSession sprint15 = createClosedSession("Sprint 15 Retrospective", team);

        retroSessionRepository.saveAll(List.of(sprint12, sprint14, sprint15));

        // Sprint 12 items
        seedItem("Pair programming cok faydali oldu", RetroCategory.WENT_WELL, sprint12);
        seedItem("CI/CD pipeline cok yavas", RetroCategory.IMPROVE, sprint12);
        seedItem("Code review sureleri uzun", RetroCategory.IMPROVE, sprint12);
        seedItem("Unit test coverage artti", RetroCategory.WENT_WELL, sprint12);

        // Sprint 14 items
        seedItem("Deploy suresi hala uzun", RetroCategory.IMPROVE, sprint14);
        seedItem("Yeni onboarding sureci iyi calisti", RetroCategory.WENT_WELL, sprint14);
        seedItem("Sprint planning toplantilari verimli gecti", RetroCategory.WENT_WELL, sprint14);
        seedItem("Code review bekleme suresi 2 gunu asiyor", RetroCategory.IMPROVE, sprint14);

        // Sprint 15 items
        seedItem("Microservice migration basarili", RetroCategory.WENT_WELL, sprint15);
        seedItem("Test ortami sik cokuyor", RetroCategory.IMPROVE, sprint15);
        seedItem("Dokumantasyon eksik", RetroCategory.IMPROVE, sprint15);
        seedItem("Standup toplantilari kisa ve oz", RetroCategory.WENT_WELL, sprint15);

        log.info("Demo data seeded successfully: 1 team, 3 sessions, 12 items.");
    }

    private RetroSession createClosedSession(String sprintName, Team team) {
        RetroSession session = new RetroSession(
                UUID.randomUUID().toString().substring(0, 8),
                sprintName,
                team
        );
        // Advance through all phases to reach SUMMARY
        session.advancePhase(); // COLLECT -> VOTE
        session.advancePhase(); // VOTE -> ACTION
        session.advancePhase(); // ACTION -> SUMMARY
        return session;
    }

    private void seedItem(String text, RetroCategory category, RetroSession session) {
        RetroItem item = new RetroItem(text, category, session);

        // Generate mock embedding (same hash-based logic as MockEmbeddingAdapter)
        List<Double> embedding = MockEmbeddingAdapter.generateHashBasedEmbedding(text, EMBEDDING_DIMENSIONS);
        try {
            item.setEmbedding(objectMapper.writeValueAsString(embedding));
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize embedding for item: {}", text, e);
        }

        retroItemRepository.save(item);
    }
}
