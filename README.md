# Tafel

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

Expo (React Native, TypeScript, expo-router) + Supabase (Postgres, RLS, Google OAuth).

## Setup

```bash
npm install
cp .env.example .env.local   # Werte eintragen
npx expo start
```

## Status

V1 im Aufbau: Profil, Praeferenzen, Events, Tracks, Anforderungs-Aggregation.
Rezeptvorschlaege und Einkaufsliste folgen in V2.

## Hinweis

Die App ist ein Planungswerkzeug, kein Allergen-Pruefdienst. Verpackungsangaben
sind immer selbst zu pruefen.
