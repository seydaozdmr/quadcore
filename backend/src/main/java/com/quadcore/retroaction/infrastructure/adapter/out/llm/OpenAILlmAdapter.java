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
@Profile("openai")
public class OpenAILlmAdapter implements LlmPort {

    private static final Logger log = LoggerFactory.getLogger(OpenAILlmAdapter.class);
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String model;

    public OpenAILlmAdapter(
            @Value("${openai.api-key}") String apiKey,
            @Value("${openai.model:gpt-4o-mini}") String model,
            ObjectMapper objectMapper) {
        this.model = model;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(API_URL)
                .defaultHeader("Authorization", "Bearer " + apiKey)
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

        return callOpenAI(systemPrompt, text).strip();
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

        return callOpenAI(systemPrompt, text);
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

        return callOpenAI(systemPrompt, userMessage);
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

        return callOpenAI(systemPrompt, userMessage);
    }

    private String callOpenAI(String systemPrompt, String userMessage) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userMessage)
                    ),
                    "max_tokens", 1024
            );

            String responseJson = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseJson);
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("OpenAI API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("OpenAI API call failed", e);
        }
    }
}
