# Tavo

Praeferenz- und Event-App fuer Freundesgruppen. Jede Person pflegt einmal ihr
Profil (was sie isst, was nicht, was ihr wichtig ist). Wer ein Event anlegt,
sieht sofort die konsolidierten Anforderungen der Gruppe.

Private Nutzung, keine Monetarisierung.

## Kernidee: Tracks statt Kompromiss

Ein Event hat 1..n **Tracks**. Grillen und vegan sind zwei gleichwertige
parallele Loesungen, kein Hauptgericht plus Sonderwunsch. Jeder Track hat
eigene Teilnehmende, eigenes Gericht und eigene Einkaufsliste.

## Haertegrade

| Grad | Bedeutung | Umgang |
|---|---|---|
| `safety` | Allergie, Unvertraeglichkeit | Harter Ausschluss, Name wird an Mitkochende weitergegeben |
| `conviction` | vegan, halal, kein Schweinefleisch | Harter Ausschluss, getrennte Zubereitung zulaessig |
| `taste` | Koriander, Oliven | Weich, wandert in separate Komponente |

## Sichtbarkeit

Pro Eintrag: `named` (mit Namen), `aggregated` (nur Anzahl), `host_only`.
Durchgesetzt serverseitig in der RPC `event_requirements`, nicht nur im UI.

## Stack

Expo Router als Web-App (React Native Web, TypeScript) + Supabase (Postgres, RLS).
Wird zum Homescreen hinzugefuegt, kein App Store.

**Anwendung:** Cloudflare Pages (siehe Deployment)

Der Zugang ist geschlossen. Konten entstehen ausschliesslich ueber einen
Einladungslink. Es werden keine Bestaetigungsmails verschickt.

| Einladungsart | Erzeugt in | Gueltigkeit |
|---|---|---|
| Event-Einladung | Event > Einladungslink kopieren | 60 Tage, beliebig viele Personen, tritt dem Event direkt bei |
| Personen-Einladung | Nutzer > Einladungslink erzeugen | 30 Tage, einmal einloesbar, nur fuer Admins |

Die Registrierung laeuft ueber die Edge Function `registrieren`, die mit dem
Service-Key das Konto mit `email_confirm` anlegt und die Einladung hochzaehlt.
Der Publishable Key im Browser kann das nicht.

Profile tragen Rolle (`admin`/`user`) und Status (`active`/`blocked`). Der
zuerst registrierte Account wird Admin. Unter *Nutzer* sieht er die Konten und
kann sperren. Praeferenzen anderer bleiben auch fuer Admins an die
Sichtbarkeitseinstellung gebunden.

## Deployment

Cloudflare Pages, direkt an dieses Repository angebunden. Cloudflare baut bei
jedem Push nach `main` selbst — es gibt keinen Workflow im Repo.

| Einstellung | Wert |
|---|---|
| Framework preset | None |
| Build command | `npx expo export --platform web` |
| Build output directory | `dist` |
| Root directory | (leer) |

Umgebungsvariablen fuer den Build:

```
EXPO_PUBLIC_SUPABASE_URL   https://doyfaavfzqftbduvkhle.supabase.co
EXPO_PUBLIC_SUPABASE_KEY   sb_publishable_...
NODE_VERSION               20
```

`public/_redirects` leitet alle Pfade auf `index.html` um, damit Routen wie
`/?einladung=` und `/event/<id>` beim direkten Aufruf funktionieren.

## Setup

```bash
npm install
cp .env.example .env.local   # Werte eintragen
npm run build:web   # oder: npx expo start --web
```

## Status

V1 im Aufbau: Profil, Praeferenzen, Events, Tracks, Anforderungs-Aggregation.
Rezeptvorschlaege und Einkaufsliste folgen in V2.

## Hinweis

Die App ist ein Planungswerkzeug, kein Allergen-Pruefdienst. Verpackungsangaben
sind immer selbst zu pruefen.
