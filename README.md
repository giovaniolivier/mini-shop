# 🛍️ Mini-Shop - Plateforme E-commerce Complète

Une application e-commerce moderne avec une architecture client-serveur modulaire, offrant une interface d'administration complète et une expérience client fluide.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies utilisées](#-technologies-utilisées)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [API Endpoints](#-api-endpoints)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

## ✨ Fonctionnalités

### 🛒 Interface Client
- **Catalogue de produits** avec recherche et filtrage
- **Panier d'achat** avec gestion des quantités
- **Processus de commande** complet
- **Historique des commandes** personnel
- **Profil utilisateur** avec informations personnelles
- **Interface responsive** et moderne

### 🔧 Interface d'Administration
- **Tableau de bord** avec analytics en temps réel
- **Gestion des produits** (CRUD complet)
- **Gestion des commandes** avec suivi des statuts
- **Gestion des clients** et de leurs données
- **Module marketing** avec promotions
- **Module finances** avec rapports
- **Paramètres système** configurables
- **Analytics avancées** avec graphiques

### 🔐 Système d'Authentification
- Inscription et connexion sécurisées
- Gestion des rôles (Admin/Client)
- Protection des routes par authentification
- Tokens JWT pour la sécurité

## 🏗️ Architecture

Votre projet utilise une **architecture client-serveur modulaire** :

```
mini-shop/
├── frontend/                 # Application React (Port 3000)
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks personnalisés
│   │   └── services/       # Services API
├── product-service/         # API Backend monolithique (Port 5000)
│   ├── controllers/        # Contrôleurs métier
│   ├── models/            # Modèles de données
│   ├── routes/            # Routes API
│   ├── middleware/        # Middleware d'authentification
│   └── config/            # Configuration base de données
└── create-admin.js        # Script de création d'admin
```

### 📊 **Caractéristiques de l'architecture :**
- **Frontend séparé** : Application React indépendante
- **Backend monolithique modulaire** : Une seule API Express avec modules organisés
- **Base de données centralisée** : MySQL partagée entre tous les modules
- **Communication REST** : API RESTful entre frontend et backend

## 🛠️ Technologies utilisées

### Frontend
- **React 19.1.0** - Framework UI
- **React Router DOM 7.6.2** - Navigation
- **Axios 1.10.0** - Client HTTP
- **Recharts 3.0.2** - Graphiques et analytics
- **React Testing Library** - Tests

### Backend
- **Node.js** - Runtime JavaScript
- **Express 5.1.0** - Framework web
- **Sequelize 6.37.7** - ORM
- **MySQL2 3.14.1** - Base de données
- **JWT 9.0.2** - Authentification
- **Bcrypt 6.0.0** - Hashage des mots de passe
- **CORS 2.8.5** - Cross-origin requests

### Base de données
- **MySQL** - Base de données relationnelle

## 🚀 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- MySQL (version 8.0 ou supérieure)
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/giovaniolivier/mini-shop.git
cd mini-shop
```

### 2. Configuration de la base de données
```bash
# Créer une base de données MySQL
mysql -u root -p
CREATE DATABASE mini_shop;
```

### 3. Configuration des variables d'environnement
Créez un fichier `.env` dans le dossier `product-service/` :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=mini_shop
JWT_SECRET=votre_secret_jwt
PORT=5000
```

### 4. Installation des dépendances

#### Backend
```bash
cd product-service
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Démarrage du backend
```bash
cd product-service
npm start
```
Le serveur API sera accessible sur `http://localhost:5000`

### Démarrage du frontend
```bash
cd frontend
npm start
```
L'application sera accessible sur `http://localhost:3000`

### Création d'un compte administrateur
```bash
node create-admin.js
```
Cela créera un compte admin avec les identifiants :
- Email : admin@mail.com
- Mot de passe : admin123

## 📖 Utilisation

### Compte Client
1. Accédez à `http://localhost:3000`
2. Créez un compte ou connectez-vous
3. Parcourez le catalogue de produits
4. Ajoutez des produits au panier
5. Finalisez votre commande

### Compte Administrateur
1. Connectez-vous avec les identifiants admin
2. Accédez au tableau de bord d'administration
3. Gérez les produits, commandes, clients
4. Consultez les analytics et rapports

## 📁 Structure du projet

### Frontend (`/frontend`)
```
src/
├── components/           # Composants réutilisables
│   ├── Header.jsx       # En-tête avec panier
│   ├── Sidebar.jsx      # Navigation latérale
│   ├── ProductCard.jsx  # Carte produit
│   └── ...
├── pages/               # Pages de l'application
│   ├── Home.jsx         # Page d'accueil
│   ├── Login.jsx        # Connexion
│   ├── AdminProducts.jsx # Gestion produits
│   └── ...
├── hooks/               # Hooks personnalisés
│   ├── useFetch.js      # Hook pour les appels API
│   └── ...
└── services/            # Services API
    └── api.js           # Configuration Axios
```

### Backend (`/product-service`)
```
├── controllers/         # Contrôleurs métier
│   ├── productController.js
│   ├── orderController.js
│   └── ...
├── models/              # Modèles Sequelize
│   ├── Product.js
│   ├── Order.js
│   ├── User.js
│   └── OrderItem.js
├── routes/              # Routes API
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── auth.js
├── middleware/          # Middleware
│   └── auth.js          # Authentification JWT
└── config/              # Configuration
    └── db.js            # Configuration MySQL
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détail d'un produit
- `POST /api/products` - Créer un produit (Admin)
- `PUT /api/products/:id` - Modifier un produit (Admin)
- `DELETE /api/products/:id` - Supprimer un produit (Admin)

### Commandes
- `GET /api/orders` - Liste des commandes
- `POST /api/orders` - Créer une commande
- `PUT /api/orders/:id` - Modifier une commande

### Panier
- `GET /api/cart` - Récupérer le panier
- `POST /api/cart/add` - Ajouter au panier
- `POST /api/cart/remove` - Retirer du panier
- `PUT /api/cart/update` - Modifier quantité

## 🤝 Contribuer

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Giovani Olivier**
- GitHub: [@giovaniolivier](https://github.com/giovaniolivier)

---

⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile sur GitHub ! 