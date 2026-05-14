import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const agendaSchema = z.object({
  cards: z.array(
    z.object({
      id: z.string().describe('Benzersiz kısa id, örn: "c1"'),
      text: z.string().describe('Yapıcı, profesyonel gündem cümlesi'),
      author: z.string().describe('Notu giren kişi adı'),
      category: z.enum(['went-well', 'improve']),
    })
  ).describe('Gruplandırılmış ve düzenlenmiş gündem kartları listesi'),
})

export async function POST(req: Request) {
  try {
    const { notes } = await req.json() as {
      notes: { text: string; author: string }[]
    }

    if (!notes?.length) {
      return Response.json({ error: 'En az bir not gerekli' }, { status: 400 })
    }

    const noteList = notes
      .map((n, i) => `${i + 1}. [${n.author}]: "${n.text}"`)
      .join('\n')

    const { object } = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      schema: agendaSchema,
      prompt: `Sen deneyimli bir Agile Koçusun. Ekip üyelerinin girdiği ham retro notlarını analiz et.

Görevin:
1. Her notu "went-well" (iyi gitti) veya "improve" (iyileştirilmeli) olarak kategorize et
2. Çok benzer notları tek karta birleştir (max 1 kart per konu)
3. Duygusal, suçlayıcı ya da dağınık ifadeleri yapıcı, profesyonel bir dile çevir
4. Her kart için kısa bir id ve açıklayıcı bir cümle üret

Ham Notlar:
${noteList}

Kurallar:
- text: max 120 karakter, Türkçe, üçüncü şahıs değil (ekip dili kullan)
- Birleşen notlarda ilk yazarın adını kullan
- İyi giden şeyler pozitif tonla, iyileştirilmesi gerekenler çözüm odaklı yaz`,
    })

    return Response.json(object)
  } catch (err) {
    console.error('[create-agenda]', err)
    return Response.json({ error: 'Gündem oluşturulamadı' }, { status: 500 })
  }
}
