package com.quadcore.retroaction.infrastructure.adapter.out.llm;

import com.quadcore.retroaction.domain.port.out.LlmPort;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Profile("mock")
public class MockLlmAdapter implements LlmPort {

    private static final List<String> WENT_WELL_KEYWORDS = List.of(
            "iyi", "güzel", "başarılı", "harika", "mükemmel", "faydalı", "verimli", "olumlu"
    );

    private static final List<String> ACTION_KEYWORDS = List.of(
            "aksiyon", "yapılmalı", "görev", "atanmalı", "planla", "oluştur", "geliştir"
    );

    @Override
    public String classify(String text) {
        String lower = text.toLowerCase();

        if (WENT_WELL_KEYWORDS.stream().anyMatch(lower::contains)) {
            return "WENT_WELL";
        }
        if (ACTION_KEYWORDS.stream().anyMatch(lower::contains)) {
            return "ACTION";
        }
        return "IMPROVE";
    }

    @Override
    public String analyzeSmart(String text) {
        return """
                [Mock SMART Analizi]
                Bu madde icin SMART degerlendirmesi:
                - Specific (Belirli): Madde daha spesifik hale getirilebilir.
                - Measurable (Olculebilir): Basari kriterleri tanimlanmali.
                - Achievable (Ulasilabilir): Kaynak ve zaman kontrolu yapilmali.
                - Relevant (Ilgili): Takim hedefleriyle uyumu dogrulanmali.
                - Time-bound (Zamana bagli): Son tarih belirtilmeli.
                Orijinal metin: "%s"
                """.formatted(text);
    }

    @Override
    public String generateDejaVuComment(String text, List<String> similarItems) {
        String itemList = String.join("\n  - ", similarItems);
        return """
                [Mock Deja Vu Uyarisi]
                Bu madde daha onceki retrolarda da gundeme gelmis:
                  - %s
                Tekrar eden bu konunun kok nedenini arastirmaniz ve kalici bir cozum uretmeniz onerilir.
                """.formatted(itemList);
    }

    @Override
    public String generateSummary(List<String> items) {
        return """
                [Mock Retro Ozeti]
                Bu retro oturumunda toplam %d madde degerlendirildi.
                Maddeler:
                %s
                Genel Degerlendirme: Takim olarak guclu yonlerinizi korumaya devam ederken, \
                iyilestirme alanlarinda somut aksiyon maddeleri olusturmaniz onerilir.
                """.formatted(items.size(), String.join("\n- ", items));
    }
}
