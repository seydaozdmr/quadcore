import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const smartSchema = z.object({
  score: z.number().min(0).max(100).describe('0-100 arası SMART uyum puanı'),
  isSmart: z.boolean().describe('Score 80 üzerindeyse true'),
  missingFields: z
    .array(z.string())
    .describe('Eksik SMART kriterleri, örn: "Sorumlu kişi belli değil"'),
  suggestedAction: z
    .string()
    .describe(
      'Aksiyonun SMART kriterlerine tam uygun hali. Format: "[Kişi] tarafından [Tarih]\'e kadar [Ne yapılacak]"'
    ),
})

export async function POST(req: Request) {
  try {
    const { rawAction } = await req.json()

    if (!rawAction || typeof rawAction !== 'string' || rawAction.trim().length === 0) {
      return Response.json({ error: 'rawAction gerekli' }, { status: 400 })
    }

    const { object } = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      schema: smartSchema,
      prompt: `Sen deneyimli bir Agile Koçusun. Aşağıdaki retro aksiyonunu SMART kriterlere göre titizlikle analiz et.

SMART Kriterleri:
- Spesifik (Specific): Ne yapılacak, kim yapacak?
- Ölçülebilir (Measurable): Başarı nasıl ölçülecek?
- Ulaşılabilir (Achievable): Gerçekçi mi?
- İlgili (Relevant): Sprint/ekip hedefleriyle bağlantılı mı?
- Zaman Sınırlı (Time-bound): Termin tarihi var mı?

Aksiyon: "${rawAction.trim()}"

Değerlendirme:
- score: 0-100 puan (her eksik kriter ~20 puan düşür)
- isSmart: score > 80 ise true
- missingFields: Türkçe eksikler listesi (boş array ise SMART)
- suggestedAction: Tüm eksikleri giderilmiş, uygulamaya hazır tam cümle`,
    })

    return Response.json(object)
  } catch (err) {
    console.error('[validate-smart]', err)
    return Response.json({ error: 'AI analizi başarısız oldu' }, { status: 500 })
  }
}
