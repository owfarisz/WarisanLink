# Entity Relationship Diagram — WarisanLink

```mermaid
erDiagram

    %% ─── ENUMS (sebagai catatan) ───────────────────────
    %% Role        : SUPERADMIN | KONTRIBUTOR | TURIS
    %% UserStatus  : PENDING | ACTIVE | REJECTED | SUSPENDED
    %% DestStatus  : PENDING | PUBLISHED | REJECTED
    %% AccessLevel : EASY | MODERATE | REMOTE

    %% ─── ENTITIES ──────────────────────────────────────

    User {
        UUID    id           PK
        String  email        UK
        String  password
        String  name
        Enum    role         "SUPERADMIN | KONTRIBUTOR | TURIS"
        Enum    status       "PENDING | ACTIVE | REJECTED | SUSPENDED"
        String  organization "nullable"
        String  bio          "nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    Category {
        Int      id          PK
        String   name        UK
        String   slug        UK
        String   description "nullable"
        String   iconName    "nullable"
        String   colorHex    "nullable"
        DateTime createdAt
    }

    Destination {
        Int      id                 PK
        String   slug               UK
        String   name
        String   city
        String   province
        Int      categoryId         FK
        String   shortDesc
        String   culturalMeaning
        String   localHistory
        String   malaysiaConnection
        String   localEtiquette     "nullable"
        String   coverImageUrl      "nullable"
        Json     galleryUrls        "nullable"
        Int      viewCount          "default 0"
        Enum     destStatus         "PENDING | PUBLISHED | REJECTED"
        UUID     creatorId          FK "nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    AccessCompass {
        Int      id              PK
        Int      destinationId   FK "unique"
        String   nearestGateway
        String   entryPoint      "nullable"
        Float    distanceKm      "nullable"
        Enum     accessLevel     "EASY | MODERATE | REMOTE"
        String   weatherSummary  "nullable"
        String   bestTimeToVisit "nullable"
        String   travelNotes     "nullable"
        String   safetyNotes     "nullable"
        Float    latitude        "nullable"
        Float    longitude       "nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    JourneyItem {
        UUID     id            PK
        UUID     userId        FK
        Int      destinationId FK
        DateTime savedAt
    }

    VisitHistory {
        Int      id            PK
        String   sessionId
        Int      destinationId "no FK constraint"
        DateTime visitedAt
    }

    %% ─── RELATIONSHIPS ──────────────────────────────────

    User         ||--o{ Destination   : "membuat (creatorId)"
    User         ||--o{ JourneyItem   : "menyimpan"
    Category     ||--o{ Destination   : "mengklasifikasikan"
    Destination  ||--|| AccessCompass : "memiliki"
    Destination  ||--o{ JourneyItem   : "disimpan oleh turis"
```

---

## Ringkasan Tabel

| Tabel | PK Type | Keterangan |
|-------|---------|------------|
| `User` | UUID | Semua role pengguna (Superadmin, Kontributor, Turis) |
| `Category` | Int (autoincrement) | Kategori destinasi budaya |
| `Destination` | Int (autoincrement) | Destinasi warisan budaya |
| `AccessCompass` | Int (autoincrement) | Info akses & lokasi per destinasi (1:1) |
| `JourneyItem` | UUID | Daftar simpan perjalanan milik Turis (m:n User-Destination) |
| `VisitHistory` | Int (autoincrement) | Log kunjungan anonim via sessionId (tanpa FK) |

## Relasi Utama

| Relasi | Kardinalitas | Keterangan |
|--------|-------------|------------|
| User → Destination | 1 : N | Satu Kontributor bisa upload banyak destinasi |
| Category → Destination | 1 : N | Satu kategori mencakup banyak destinasi |
| Destination → AccessCompass | 1 : 1 | Setiap destinasi punya tepat satu kompas akses |
| User → JourneyItem | 1 : N | Satu Turis bisa simpan banyak destinasi |
| Destination → JourneyItem | 1 : N | Satu destinasi bisa disimpan banyak Turis |
| JourneyItem (User+Destination) | M : N resolved | Unique constraint `[userId, destinationId]` |
