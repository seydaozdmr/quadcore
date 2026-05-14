package com.quadcore.retroaction.domain.port.out;

import java.util.List;

public interface EmbeddingPort {

    /**
     * Generates an embedding vector for the given text.
     *
     * @param text the input text
     * @return embedding vector as a list of doubles
     */
    List<Double> generate(String text);

    /**
     * Returns the dimensionality of the embedding vectors.
     * Typically 1536 for real OpenAI embeddings, smaller for mock implementations.
     *
     * @return number of dimensions
     */
    int dimensions();
}
