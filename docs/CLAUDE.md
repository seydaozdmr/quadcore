# Retro-Opoly: AI Mimari ve Strateji Dökümanı

Bu döküman, Prompt Sprint AI Hackathon kapsamında geliştirdiğimiz "Retro-Opoly" projesinin temel mimarisini ve yapay zeka entegrasyon stratejisini açıklamaktadır.

## 🎯 Projenin Temel Çözümü
Ekiplerin retro kararlarını unutması problemini, süreci bir **kutu oyununa** dönüştürerek ve alınan kararları anlık olarak **LLM destekli SMART (Specific, Measurable, Achievable, Relevant, Time-Bound) filtresinden** geçirerek çözüyoruz.

## 🧠 AI Entegrasyon Noktaları (İş Akışı)

Projemizde yapay zeka, sıradan bir metin üretici değil, "Sürecin Yöneticisi ve Denetçisi" olarak 3 farklı istasyonda görev yapmaktadır:

### 1. Pre-Processing Agent (Veri Temizleyici)
- **Görev:** Ekip üyelerinin anonim olarak girdiği dağınık retro notlarını analiz eder.
- **Prompt Stratejisi:** `Sen bir Agile Koçusun. Gelen metinlerdeki duygusal ve suçlayıcı ifadeleri filtrele, yapıcı bir dile çevir. Benzer konuları grupla ve 'Gündem Kartları' oluştur.`
- **Çıktı:** Oyun tahtasında kullanılacak standardize edilmiş konu başlıkları.

### 2. The SMART Validator (X-Factor Agent)
- **Görev:** Oyun sırasında bir "Aksiyon" kararı alındığında, bu kararın uygulanabilirliğini denetler. (Uygulamanın asıl inovasyon noktasıdır).
- **Prompt Stratejisi:** `Girilen aksiyon maddesini SMART kriterlerine göre analiz et. Eğer aksiyonda 'Kim yapacak?' veya 'Ne zaman bitecek?' gibi bilgiler eksikse, puanı düşür ve eksikleri belirterek eyleme dönüştürülebilir mükemmel bir şablon öner.`
- **Çıktı:** JSON formatında `{ score: Number, missingFields: Array, improvedAction: String }`. Bu sayede havada kalan veya unutulmaya müsait hiçbir aksiyon sisteme kaydedilemez.

### 3. Persona Generator (Kapanış Agent'ı)
- **Görev:** Oyun bittiğinde, retro boyunca sergilenen takım dinamiklerini analiz eder.
- **Prompt Stratejisi:** `Oyun loglarını (kim kaç kudos verdi, kim en çok aksiyonu üstlendi) incele. Her oyuncuya 'Ekip Koşucusu', 'Retro Gevezesi' gibi oyunlaştırma elementlerine uygun eğlenceli unvanlar ata.`

## 🛠️ Teknik Altyapı
- **Frontend Framework:** Next.js (App Router)
- **Stil & UI:** Tailwind CSS, Shadcn/UI
- **State Yönetimi:** Zustand (Hızlı prototipleme için LocalStorage senkronizasyonu)
- **AI Entegrasyonu:** Vercel AI SDK (Claude / OpenAI API)

## 👥 Geliştirme Süreci (Agentic Workflow)
Bu proje, Cursor ve Claude kullanılarak "Modüler Bağımsızlık" prensibiyle 3 saatte geliştirilmiştir. Proje 4 ana parçaya bölünmüş, State (Zustand) iskeleti AI tarafından hızlıca kurularak 4 takım üyesinin paralel çalışmasına (Pre-game, Board, AI Core, Dashboard) olanak sağlanmıştır.