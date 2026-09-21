# werehouse
projet pour TFM 11K

Système de Gestion d'Entrepôt Multi-Sites (WMS) pour les magasins B1 & B2, conteneurs et cours logistiques.

## Structure du Projet

- **`web/`** : Application web complète (React 18, TypeScript, Tailwind CSS, Vite) avec gestion des stocks, mouvements (entrées, sorties, transferts), visite virtuelle 360°, mode tactile d'atelier et impression d'étiquettes QR.
- **`android/`** : Application mobile Android native (Kotlin, Jetpack Compose, CameraX / scanner de codes-barres).
- **`shared/`** : Modèles de données TypeScript partagés.
- **`backend/`** : Règles de sécurité Firestore, index et scripts de migration.
