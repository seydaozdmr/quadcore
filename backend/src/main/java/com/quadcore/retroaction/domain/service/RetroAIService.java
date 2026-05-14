package com.quadcore.retroaction.domain.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadcore.retroaction.domain.model.RetroCategory;
import com.quadcore.retroaction.domain.model.RetroItem;
import com.quadcore.retroaction.domain.port.out.EmbeddingPort;
import com.quadcore.retroaction.domain.port.out.LlmPort;
import com.quadcore.retroaction.infrastructure.repository.RetroItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class RetroAIService {

    private static final Logger log = LoggerFactory.getLogger(RetroAIService.class);

    private final LlmPort llmPort;
    private final EmbeddingPort embeddingPort;
    private final RetroItemRepository retroItemRepository;
    private final ObjectMapper objectMapper;

    @Value("${retroaction.similarity.threshold:0.78}")
    private double similarityThreshold;

    @Value("${retroaction.similarity.max-results:5}")
    private int maxResults;

    public RetroAIService(LlmPort llmPort,
                          EmbeddingPort embeddingPort,
                          RetroItemRepository retroItemRepository,
                          ObjectMapper objectMapper) {
        this.llmPort = llmPort;
        this.embeddingPort = embeddingPort;
        this.retroItemRepository = retroItemRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Classifies a retro item text into a RetroCategory using the LLM.
     */
    public RetroCategory classifyItem(String text) {
        String classification = llmPort.classify(text);
        try {
            return RetroCategory.valueOf(classification.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("LLM returned unknown category '{}', defaulting to IMPROVE", classification);
            return RetroCategory.IMPROVE;
        }
    }

    /**
     * Checks for deja vu by comparing the new item's embedding against past retro items.
     * Returns a deja vu comment if similar items are found above the threshold, null otherwise.
     */
    public String checkDejaVu(Long sessionId, String text) {
        List<Double> newEmbedding = embeddingPort.generate(text);
        List<RetroItem> pastItems = retroItemRepository.findItemsWithEmbeddingExcludingSession(sessionId);

        List<String> similarTexts = pastItems.stream()
                .map(item -> new SimilarItem(item.getText(), cosineSimilarity(newEmbedding, parseEmbedding(item.getEmbedding()))))
                .filter(si -> si.similarity() >= similarityThreshold)
                .sorted(Comparator.comparingDouble(SimilarItem::similarity).reversed())
                .limit(maxResults)
                .map(SimilarItem::text)
                .toList();

        if (similarTexts.isEmpty()) {
            return null;
        }

        log.info("Found {} similar items for deja vu check (threshold: {})", similarTexts.size(), similarityThreshold);
        return llmPort.generateDejaVuComment(text, similarTexts);
    }

    /**
     * Generates a SMART analysis for a retro item text.
     */
    public String analyzeSmart(String text) {
        return llmPort.analyzeSmart(text);
    }

    /**
     * Generates a summary for a list of retro item texts.
     */
    public String generateSummary(List<String> items) {
        return llmPort.generateSummary(items);
    }

    /**
     * Generates an embedding vector for the given text and serializes it as a JSON string.
     */
    public String generateEmbeddingJson(String text) {
        List<Double> embedding = embeddingPort.generate(text);
        try {
            return objectMapper.writeValueAsString(embedding);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize embedding to JSON", e);
        }
    }

    private List<Double> parseEmbedding(String embeddingJson) {
        try {
            return objectMapper.readValue(embeddingJson, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.error("Failed to parse embedding JSON: {}", embeddingJson, e);
            return List.of();
        }
    }

    /**
     * Computes cosine similarity between two vectors.
     * Returns 0.0 if either vector is empty or they have different dimensions.
     */
    private double cosineSimilarity(List<Double> a, List<Double> b) {
        if (a.isEmpty() || b.isEmpty() || a.size() != b.size()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double magnitudeA = 0.0;
        double magnitudeB = 0.0;

        for (int i = 0; i < a.size(); i++) {
            dotProduct += a.get(i) * b.get(i);
            magnitudeA += a.get(i) * a.get(i);
            magnitudeB += b.get(i) * b.get(i);
        }

        double magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
        if (magnitude == 0.0) {
            return 0.0;
        }

        return dotProduct / magnitude;
    }

    private record SimilarItem(String text, double similarity) {
    }
}
