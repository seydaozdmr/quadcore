package com.quadcore.retroaction.infrastructure.adapter.out.embedding;

import com.quadcore.retroaction.domain.port.out.EmbeddingPort;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Embedding adapter for the "anthropic" profile.
 * Anthropic does not provide a native embedding API, so we use the same
 * deterministic hash-based pseudo-embedding as the mock adapter.
 * Cosine similarity still works correctly for déjà vu detection since
 * semantically similar Turkish phrases share tokens and thus hash patterns.
 */
@Service
@Profile("anthropic")
public class AnthropicEmbeddingAdapter implements EmbeddingPort {

    private static final int DIMENSIONS = 128;

    @Override
    public List<Double> generate(String text) {
        return MockEmbeddingAdapter.generateHashBasedEmbedding(text, DIMENSIONS);
    }

    @Override
    public int dimensions() {
        return DIMENSIONS;
    }
}
