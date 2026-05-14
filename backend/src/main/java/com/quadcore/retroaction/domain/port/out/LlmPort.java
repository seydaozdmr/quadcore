package com.quadcore.retroaction.domain.port.out;

import java.util.List;

public interface LlmPort {

    /**
     * Classifies a retro item text into a category.
     *
     * @param text the retro item text
     * @return the category as a string (WENT_WELL, IMPROVE, or ACTION)
     */
    String classify(String text);

    /**
     * Analyzes a retro item text and produces SMART criteria suggestions.
     *
     * @param text the retro item text
     * @return SMART analysis result
     */
    String analyzeSmart(String text);

    /**
     * Generates a deja vu commentary when similar items are found from past retros.
     *
     * @param text         the current retro item text
     * @param similarItems list of similar item texts from past retros
     * @return deja vu commentary
     */
    String generateDejaVuComment(String text, List<String> similarItems);

    /**
     * Generates a summary for a completed retro session.
     *
     * @param items list of retro item texts
     * @return generated summary
     */
    String generateSummary(List<String> items);
}
