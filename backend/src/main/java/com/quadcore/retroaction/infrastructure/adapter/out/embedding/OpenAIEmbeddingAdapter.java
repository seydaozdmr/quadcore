package com.quadcore.retroaction.infrastructure.adapter.out.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadcore.retroaction.domain.port.out.EmbeddingPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * OpenAI Embeddings adapter. Used for both "openai" and "anthropic" profiles
 * since Anthropic does not provide a native embedding API.
 */
@Service
@Profile({"openai", "anthropic"})
public class OpenAIEmbeddingAdapter implements EmbeddingPort {

    private static final Logger log = LoggerFactory.getLogger(OpenAIEmbeddingAdapter.class);
    private static final String API_URL = "https://api.openai.com/v1/embeddings";
    private static final int DIMENSIONS = 1536;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String model;

    public OpenAIEmbeddingAdapter(
            @Value("${openai.api-key}") String apiKey,
            @Value("${openai.embedding-model:text-embedding-3-small}") String model,
            ObjectMapper objectMapper) {
        this.model = model;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(API_URL)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    @Override
    public List<Double> generate(String text) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "input", text
            );

            String responseJson = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode embeddingArray = root.path("data").get(0).path("embedding");

            List<Double> embedding = new ArrayList<>(DIMENSIONS);
            for (JsonNode value : embeddingArray) {
                embedding.add(value.asDouble());
            }

            return embedding;

        } catch (Exception e) {
            log.error("OpenAI Embedding API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("OpenAI Embedding API call failed", e);
        }
    }

    @Override
    public int dimensions() {
        return DIMENSIONS;
    }
}
