<<<<<<< HEAD
# 🗺 Dakar GeoExplorer

> Application web de cartographie interactive de Dakar — PostGIS + MapLibre GL JS

**Auteur** : Seydina Alioune Diop  
**Formation** : BTS Géomatique — CEDT G15, Dakar  
**Stack** : TypeScript · Node.js · Express · PostgreSQL · PostGIS · MapLibre GL JS

---

## Aperçu

Dakar GeoExplorer est une application web fullstack qui permet d'explorer les lieux d'intérêt de Dakar sur une carte interactive. Elle démontre l'utilisation de PostGIS pour les opérations spatiales avancées couplée à un frontend moderne avec MapLibre GL JS.

### Fonctionnalités

- **Carte interactive** centrée sur Dakar (fond OpenStreetMap)
- **Recherche par nom** utilisant les index GIN (full-text search en français)
- **Filtres par type** : hôpitaux, écoles, marchés, mosquées, pharmacies, culture
- **Lieux les plus proches** via géolocalisation + algorithme KNN (index GiST)
- **Popups informatives** au clic sur chaque marqueur
- **API REST** retournant du GeoJSON standard

---

## Architecture

```
dakar-geoexplorer/
├── sql/
│   └── 01_setup.sql        # Table lieux, données, index GIN + GiST
├── backend/
│   ├── src/
│   │   ├── server.ts       # Point d'entrée Express
│   │   ├── db.ts           # Pool de connexions PostgreSQL
│   │   └── routes/
│   │       └── lieux.ts    # Routes API REST
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── index.html          # Application MapLibre (vanilla JS)
└── README.md
```

---

## Technologies clés

### Base de données — PostGIS

| Fonctionnalité | Technologie PostGIS |
|----------------|---------------------|
| Stockage géographique | `GEOMETRY(Point, 4326)` |
| Recherche textuelle rapide | Index `GIN` sur `to_tsvector('french', nom)` |
| Recherche spatiale KNN | Index `GiST` + opérateur `<->` |
| Distance réelle | `ST_Distance(...::geography)` en mètres |
| Export GeoJSON | `ST_AsGeoJSON(geom)` |

### Backend — Node.js + Express + TypeScript

- Pool de connexions `pg` avec gestion des erreurs
- Routes paramétrées (protection contre les injections SQL)
- Réponses en **GeoJSON** standard (format universel en géomatique)

### Frontend — MapLibre GL JS

- Fond de carte OpenStreetMap (sans clé API)
- Marqueurs personnalisés par type avec couleurs distinctes
- Popups avec informations complètes
- Debounce sur la recherche (évite les requêtes inutiles)
- Géolocalisation HTML5 native

---

## Installation et démarrage

### Prérequis

- PostgreSQL 14+ avec l'extension PostGIS
- Node.js 18+
- npm

### 1. Base de données

```bash
# Créer la base de données
createdb dakar_geo

# Exécuter le script SQL (crée la table, insère les données, crée les index)
psql -d dakar_geo -f sql/01_setup.sql
```

### 2. Backend

```bash
cd backend

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos identifiants PostgreSQL

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
# → Serveur sur http://localhost:3000
```

### 3. Frontend

```bash
# Ouvrir directement dans le navigateur
open frontend/index.html
# ou avec un serveur local :
npx serve frontend/
```

---

## API — Endpoints

### `GET /api/lieux`
Retourne tous les lieux au format GeoJSON.

**Paramètres optionnels :**
- `type` : filtre par type (`hôpital`, `école`, `marché`, `mosquée`, `pharmacie`, `culture`)

```bash
curl http://localhost:3000/api/lieux?type=hôpital
```

### `GET /api/lieux/search?q=sandaga`
Recherche full-text par nom (index GIN, configuration `french`).

```bash
curl "http://localhost:3000/api/lieux/search?q=sandaga"
```

### `GET /api/lieux/proches`
K lieux les plus proches d'un point (KNN via index GiST).

**Paramètres :**
- `lng` : longitude
- `lat` : latitude
- `limit` : nombre de résultats (défaut : 5, max : 20)
- `type` : filtre optionnel par type

```bash
curl "http://localhost:3000/api/lieux/proches?lng=-17.44&lat=14.68&limit=5"
```

**Exemple de réponse GeoJSON :**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-17.4416, 14.6835]
      },
      "properties": {
        "id": 1,
        "nom": "Hôpital Principal de Dakar",
        "type": "hôpital",
        "description": "Hôpital public de référence nationale",
        "adresse": "Avenue Nelson Mandela, Dakar",
        "distance_m": 342
      }
    }
  ]
}
```

---

## Concepts PostGIS illustrés

### Index GIN — Recherche textuelle
```sql
-- Création de l'index
CREATE INDEX idx_lieux_nom_gin
  ON lieux USING GIN (to_tsvector('french', nom));

-- Utilisation en requête
SELECT nom FROM lieux
WHERE to_tsvector('french', nom) @@ plainto_tsquery('french', 'hôpital principal');
```

### Index GiST — Recherche KNN
```sql
-- Création de l'index spatial
CREATE INDEX idx_lieux_geom_gist ON lieux USING GIST (geom);

-- Requête KNN : 5 lieux les plus proches
SELECT nom, ST_Distance(geom::geography, ST_MakePoint(-17.44, 14.68)::geography) AS dist_m
FROM lieux
ORDER BY geom <-> ST_SetSRID(ST_MakePoint(-17.44, 14.68), 4326)
LIMIT 5;
```

---

## Données

24 lieux d'intérêt réels de Dakar couvrant :
- **5 hôpitaux** : Principal, Le Dantec, Fann, Grand Yoff…
- **5 établissements scolaires** : UCAD, ESP, Lycée Lamine Guèye…
- **5 marchés** : Sandaga, HLM, Tilène, Kermel, Colobane
- **3 mosquées** : Grande Mosquée, Massalikul Jinaan, Omarienne
- **3 pharmacies** : Guigon, Médina, Point E
- **3 lieux culturels** : Monument de la Renaissance, Musée IFAN, Village des Arts

---

## Pistes d'amélioration

- Ajouter des données réelles depuis OpenStreetMap (API Overpass)
- Intégrer des itinéraires avec OSRM ou pgRouting
- Authentification utilisateur pour sauvegarder des favoris
- Export des résultats en CSV / Shapefile
- Déploiement sur un VPS avec Nginx + PM2

---

*Projet réalisé dans le cadre du BTS Géomatique — CEDT G15, Dakar, Sénégal*
=======
# dakar-geoexplorer
>>>>>>> 165ffb1b77e7b318afd8d9a8bc67db75ae8b2d3a
