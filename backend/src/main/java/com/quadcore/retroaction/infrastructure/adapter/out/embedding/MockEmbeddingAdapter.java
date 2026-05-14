package com.quadcore.retroaction.infrastructure.adapter.out.embedding;

import com.quadcore.retroaction.domain.port.out.EmbeddingPort;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@Profile("mock")
public class MockEmbeddingAdapter implements EmbeddingPort {

    private static final int DIMENSIONS = 128;

    @Override
    public List<Double> generate(String text) {
        return generateHashBasedEmbedding(text, DIMENSIONS);
    }

    @Override
    public int dimensions() {
        return DIMENSIONS;
    }

    /**
     * Generates a deterministic pseudo-embedding from the text hash.
     * Uses text.hashCode() as seed to produce a reproducible 128-dimensional
     * unit vector with values between -1 and 1.
     */
    public static List<Double> generateHashBasedEmbedding(String text, int dims) {
        Random random = new Random(text.hashCode());
        List<Double> vector = new ArrayList<>(dims);

        double sumSquares = 0.0;
        for (int i = 0; i < dims; i++) {
            double value = random.nextGaussian();
            vector.add(value);
            sumSquares += value * value;
        }

        // Normalize to unit vector
        double magnitude = Math.sqrt(sumSquares);
        if (magnitude > 0) {
            for (int i = 0; i < dims; i++) {
                vector.set(i, vector.get(i) / magnitude);
            }
        }

        return vector;
    }
}
