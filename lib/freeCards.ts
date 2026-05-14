export interface FreeCardDef {
  id: string
  text: string
  emoji: string
}

// 20 sabit serbest kart (tekrarlayabilir)
export const FREE_CARDS: FreeCardDef[] = [
  { id: 'f01', emoji: '👏', text: 'Kudos Ver — Takımdan birine alenen teşekkür et.' },
  { id: 'f02', emoji: '🤔', text: 'Bu sprint neyi farklı yapmalıydık?' },
  { id: 'f03', emoji: '😂', text: 'Sprintten komik bir anı anlat.' },
  { id: 'f04', emoji: '⚡', text: 'En çok enerji harcadığın görev neydi? Neden?' },
  { id: 'f05', emoji: '🎯', text: 'Sprint hedefimize ulaştık mı? Ulaşamadıysak engel neydi?' },
  { id: 'f06', emoji: '🤝', text: 'Bu sprintte sana en çok kim yardım etti? Ona teşekkür et.' },
  { id: 'f07', emoji: '🚧', text: 'Önündeki en büyük engel neydi? Herkes bilsin.' },
  { id: 'f08', emoji: '💡', text: 'Bir sonraki sprint için bir fikrin var mı? Paylaş.' },
  { id: 'f09', emoji: '📉', text: 'Moralin en düşük anı hangisiydi? Neden?' },
  { id: 'f10', emoji: '🏆', text: 'Bu sprintin MVP\'si kim? Neden?' },
  { id: 'f11', emoji: '🔁', text: 'Geçen sprintten beri değişmeyen bir sorun var mı?' },
  { id: 'f12', emoji: '🛠️', text: 'Hangi araç veya süreç en çok zaman kaybettirdi?' },
  { id: 'f13', emoji: '📣', text: 'Ekip dışına daha iyi duyurabildiğimiz bir şey var mı?' },
  { id: 'f14', emoji: '😴', text: 'Bu sprintte en sıkıcı görev neydi?' },
  { id: 'f15', emoji: '🔥', text: 'Hangi kararı en hızlı aldık? İyi miydi?' },
  { id: 'f16', emoji: '🌱', text: 'Teknik olarak öğrendiğin yeni bir şey var mı? Paylaş.' },
  { id: 'f17', emoji: '🎲', text: 'Sağ elindeki kişiye bir kudos ver.' },
  { id: 'f18', emoji: '📝', text: 'Dokümantasyonumuzu bir kelimeyle tanımla.' },
  { id: 'f19', emoji: '🚀', text: 'Bir sonraki sprintte denemek istediğin bir şey var mı?' },
  { id: 'f20', emoji: '❤️', text: 'Takım olarak gurur duyduğun bir an anlat.' },
]

export function pickRandomFreeCard(): FreeCardDef {
  return FREE_CARDS[Math.floor(Math.random() * FREE_CARDS.length)]
}
