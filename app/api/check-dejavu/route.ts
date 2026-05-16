import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const dejaVuSchema = z.object({
  isRepeat: z.boolean().describe('Geçmiş notlardan biriyle anlamlı bir benzerlik var mı'),
  severity: z.enum(['low', 'medium', 'high']).describe(
    'low: hafif benzerlik, medium: aynı tema, high: neredeyse aynı sorun tekrar ediyor'
  ),
  similarNotes: z.array(z.string()).max(3).describe(
    'En benzer 1-3 geçmiş not (kelimesi kelimesine kopyala)'
  ),
  analysis: z.string().describe(
    'Türkçe, 1-2 cümle: neden tekrarlıyor, olası kök neden ne'
  ),
})

export type DejaVuResult = z.infer<typeof dejaVuSchema>

export async function POST(req: Request) {
  try {
    const { newNote, pastNotes } = await req.json() as {
      newNote: string
      pastNotes: { text: string; author: string }[]
    }

    if (!newNote?.trim() || !pastNotes?.length) {
      return Response.json({ isRepeat: false, severity: 'low', similarNotes: [], analysis: '' })
    }

    const pastList = pastNotes
      .map((n, i) => `${i + 1}. [${n.author}] ${n.text}`)
      .join('\n')

    const { object } = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      schema: dejaVuSchema,
      prompt: `Sen bir Agile Koçusun. Sprint retrospektiflerinde tekrarlayan sorunları tespit ediyorsun.

Yeni giriş:
"${newNote.trim()}"

Geçmiş retro notları:
${pastList}

Değerlendirme:
- Yeni girişin geçmiş notlardan herhangi biriyle aynı konuyu mu ele aldığını belirle.
- Yüzeysel kelime benzerliği değil, SEMANTİK benzerliğe bak (örn: "CI/CD yavaş" ile "build süreci uzuyor" aynı konudur).
- En az %60 semantik örtüşme varsa isRepeat = true.
- severity: low = benzer tema, medium = aynı sorun, high = daha önce aksiyon alınmış ama çözülmemiş.
- Analiz sadece isRepeat = true ise anlamlı olsun, false ise boş string döndür.`,
    })

    return Response.json(object)
  } catch (err) {
    console.error('[check-dejavu]', err)
    return Response.json({ isRepeat: false, severity: 'low', similarNotes: [], analysis: '' })
  }
}
