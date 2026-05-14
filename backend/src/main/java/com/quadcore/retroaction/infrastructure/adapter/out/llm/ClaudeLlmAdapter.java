package com.quadcore.retroaction.infrastructure.adapter.out.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadcore.retroaction.domain.port.out.LlmPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Profile("anthropic")
public class ClaudeLlmAdapter implements LlmPort {

    private static final Logger log = LoggerFactory.getLogger(ClaudeLlmAdapter.class);
    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSION = "2023-06-01";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public ClaudeLlmAdapter(
            @Value("${anthropic.api-key}") String apiKey,
            @Value("${anthropic.model:claude-sonnet-4-20250514}") String model,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(API_URL)
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", ANTHROPIC_VERSION)
                .build();
    }

    @Override
    public String classify(String text) {
        String systemPrompt = """
                Sen bir retro toplantisi maddelerini siniflandiran yapay zeka asistanisin.
                Verilen metni asagidaki kategorilerden birine siniflandir:
                - WENT_WELL: Iyi giden, basarili, olumlu seyler
                - IMPROVE: Iyilestirilmesi gereken, sorunlu alanlar
                - ACTION: Aksiyon maddesi, yapilmasi gereken gorevler

                Sadece kategori ismini dondur, baska bir sey yazma.
                """;

        return callClaude(systemPrompt, text).strip();
    }

    @Override
    public String analyzeSmart(String text) {
        String systemPrompt = """
                Sen bir retro maddelerini SMART kriterlerine gore analiz eden yapay zeka asistanisin.
                Verilen retro maddesini SMART kriterlerine gore degerlendir:
                - Specific (Belirli)
                - Measurable (Olculebilir)
                - Achievable (Ulasilabilir)
                - Relevant (Ilgili)
                - Time-bound (Zamana bagli)

                Her kriter icin kisa bir degerlendirme yap ve iyilestirme onerileri sun.
                Yaniti Turkce olarak ver.
                """;

        return callClaude(systemPrompt, text);
    }

    @Override
    public String generateDejaVuComment(String text, List<String> similarItems) {
        String systemPrompt = """
                Sen bir retro toplantisi analizcisisin. Tekrar eden temaları analiz ediyorsun.
                Kullanicinin girdigi madde daha onceki retrolarda da benzer sekilde gundeme gelmis.
                Bu tekrar eden temayi analiz et, neden tekrar ettigini yorumla ve
                kalici cozum onerileri sun.
                Yaniti Turkce olarak ver.
                """;

        String userMessage = """
                Mevcut madde: %s

                Onceki retrolardaki benzer maddeler:
                %s
                """.formatted(text, String.join("\n- ", similarItems));

        return callClaude(systemPrompt, userMessage);
    }

    @Override
    public String generateSummary(List<String> items) {
        String systemPrompt = """
                Sen bir retro toplantisi ozetleyicisisin.
                Verilen retro maddelerini analiz ederek kapsamli bir ozet olustur.
                Ozette su bolumler olsun:
                1. Genel Degerlendirme
                2. Guclu Yonler
                3. Iyilestirme Alanlari
                4. Onerilen Aksiyonlar
                Yaniti Turkce olarak ver.
                """;

        String userMessage = "Retro maddeleri:\n" + String.join("\n- ", items);

        return callClaude(systemPrompt, userMessage);
    }

    private String callClaude(String systemPrompt, String userMessage) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "max_tokens", 1024,
                    "system", systemPrompt,
                    "messages", List.of(
                            Map.of("role", "user", "content", userMessage)
                    )
            );

            String responseJson = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseJson);
            return root.path("content").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("Claude API call failed", e);
        }
    }
}
