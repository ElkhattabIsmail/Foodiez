# Foodiez - Restaurant Order Management SPA

Une application web moderne de gestion des commandes de restaurant construite comme une SPA (Single Page Application) dynamique avec JavaScript vanilla et JSON Server.

## 🚀 Fonctionnalités

### Dashboard Dynamique
- **Statistiques en temps réel**: Total commandes, en attente, acceptées, refusées, complétées
- **Commandes récentes**: Affichage des 5 dernières commandes
- **Mise à jour automatique**: Les statistiques s'actualisent après chaque action

### Gestion des Commandes
- **Liste dynamique**: Affichage des commandes sous forme de cards responsives
- **Filtrage par statut**: Toutes, En attente, Acceptées, Refusées, Complétées
- **Modification du statut**: Dropdown pour changer le statut (pending → accepted → completed/rejected)
- **Suppression**: Suppression instantanée avec confirmation

### Nouvelle Commande
- **Formulaire intuitif**: Nom client, articles (séparés par virgules), prix total
- **Validation**: Champs requis et format des données
- **Intégration API**: Création automatique et affichage instantané

### Navigation SPA
- **Sans rechargement**: Navigation fluide entre sections
- **Gestion d'état**: Maintien de l'état de l'application
- **URL hash**: Support du navigation history

## 🛠 Stack Technique

- **Frontend**: HTML5, Tailwind CSS, JavaScript Vanilla (ES6+)
- **Backend**: JSON Server (API REST simulée)
- **HTTP Client**: Axios
- **Architecture**: SPA (Single Page Application)

## 📦 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm (version 6 ou supérieure)

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd Foodiez
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur JSON Server**
   ```bash
   npm start
   ```

4. **Ouvrir l'application**
   - Ouvrir `index.html` dans votre navigateur
   - Ou utiliser un serveur de développement comme Live Server

## 🎯 Utilisation

### Démarrage rapide

1. **Lancer le backend**
   ```bash
   npm run dev
   ```
   Le serveur JSON Server démarrera sur `http://localhost:3000`

2. **Ouvrir l'interface**
   - Ouvrir `index.html` dans le navigateur
   - L'application se connectera automatiquement à l'API

### Fonctionnement

1. **Dashboard**: Vue d'ensemble avec statistiques et commandes récentes
2. **Commandes**: Liste complète avec filtrage et gestion
3. **Nouvelle Commande**: Formulaire de création de commandes

## 📊 Structure des Données

### Orders
```json
{
  "id": 1,
  "customerName": "Ahmed",
  "items": ["Pizza", "Soda"],
  "totalPrice": 120,
  "status": "pending",
  "createdAt": "2025-03-16"
}
```

### Settings
```json
{
  "restaurantName": "Foodiez",
  "contactEmail": "contact@foodiez.com"
}
```

### Statuts possibles
- `pending`: En attente
- `accepted`: Acceptée
- `rejected`: Refusée
- `completed`: Complétée

## 🔧 API Endpoints

- `GET /orders` - Récupérer toutes les commandes
- `POST /orders` - Créer une nouvelle commande
- `PATCH /orders/:id` - Mettre à jour une commande
- `DELETE /orders/:id` - Supprimer une commande
- `GET /settings` - Récupérer les paramètres

## 🎨 Design & UX

- **Responsive**: Adaptation mobile, tablette, desktop
- **Moderne**: Interface avec Tailwind CSS
- **Intuitive**: Navigation simple et logique
- **Feedback**: Messages de succès/erreur animés
- **Loading**: Indicateurs de chargement

## 🔄 États de l'Application

### Loading State
- Spinner animé pendant les appels API
- Désactivation des actions en cours

### Error State
- Messages d'erreur clairs
- Auto-disparition après 5 secondes

### Empty State
- Messages informatifs quand aucune donnée
- Call-to-action pour créer des commandes

## 🚀 Développement

### Structure des fichiers
```
Foodiez/
├── index.html          # Structure HTML principale
├── script.js           # Logique JavaScript SPA
├── style.css           # Styles personnalisés
├── db.json            # Données JSON Server
├── package.json       # Dépendances npm
└── README.md          # Documentation
```

### Architecture JavaScript
- **Modules**: Fonctions organisées par responsabilité
- **Async/Await**: Gestion moderne des appels API
- **Event Listeners**: Gestion des interactions utilisateur
- **State Management**: Variables globales pour l'état

## 🐛 Débogage

### Problèmes courants
1. **CORS**: Assurez-vous que le serveur JSON Server est démarré
2. **Port 3000**: Vérifiez que le port n'est pas utilisé
3. **Console**: Consultez la console pour les erreurs JavaScript

### Solutions
- Redémarrer le serveur JSON Server
- Vérifier la connexion API dans les outils de développement
- Consulter les logs du serveur

## 📈 Améliorations futures

- [ ] Authentification des utilisateurs
- [ ] Notifications en temps réel (WebSocket)
- [ ] Export PDF des commandes
- [ ] Graphiques et statistiques avancées
- [ ] Mode hors ligne (Service Worker)
- [ ] Tests automatisés

## 📝 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 👥 Équipe

Développé par l'équipe Foodiez - Startup spécialisée dans la digitalisation des restaurants.

---

**Foodiez** 🍔 - Simplifier la gestion des commandes restaurant