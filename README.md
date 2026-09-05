# Prefme

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

Anmeldung ohne Passwort: der Admin schickt einen Einladungslink, die Person
gibt ihren Namen ein und bekommt eine anonyme Supabase-Session. Der Zugang
haengt am Browser des Geraets.

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
