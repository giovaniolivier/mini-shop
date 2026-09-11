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
├── package.json              # Scripts racine (dev:api, dev:web, create-admin)
├── frontend/                 # Application React (Port 3000)
│   └── src/
│       ├── layouts/          # Shell app (sidebar, header, mini-panier)
│       ├── pages/
│       │   ├── auth/         # Login, Register
│       │   ├── shop/         # Catalogue, détail, checkout, profil
│       │   ├── client/       # Espace client
│       │   └── admin/        # Back-office
│       ├── components/
│       ├── hooks/            # useCart, useFetch, …
│       ├── services/         # http + APIs par domaine
│       ├── constants/
│       └── utils/
└── product-service/          # API Express (Port 5000)
    ├── app.js
    ├── controllers/
    ├── models/               # + index.js (associations)
    ├── routes/
    ├── middleware/
    ├── config/
    ├── scripts/              # createAdmin, listOrders
    └── .env.example
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

Backend — copiez `product-service/.env.example` vers `product-service/.env` :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=mini_shop
JWT_SECRET=votre_secret_jwt
PORT=5000
```

Frontend (optionnel) — copiez `frontend/.env.example` vers `frontend/.env` :
```env
REACT_APP_API_URL=http://localhost:5000/api
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
# ou en watch : npm run dev
# depuis la racine : npm run start:api  /  npm run dev:api
```
Le serveur API sera accessible sur `http://localhost:5000`

### Démarrage du frontend
```bash
cd frontend
npm start
# depuis la racine : npm run dev:web
```
L'application sera accessible sur `http://localhost:3000`

### Création d'un compte administrateur
```bash
cd product-service
npm run create-admin
# depuis la racine : npm run create-admin
```
Compte par défaut (modifiable via `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `.env`) :
- Email : admin@mail.com
- Mot de passe : admin123

> L'inscription publique (`POST /api/auth/register`) force toujours le rôle `client`. Les admins se créent uniquement via ce script.

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

### Frontend (`/frontend/src`)
```
layouts/AppLayout.jsx
pages/auth|shop|client|admin/
components/
hooks/useCart.js, useFetch.js, …
services/http.js, authApi.js, productsApi.js, ordersApi.js, cartApi.js, mockApis.js
constants/api.js
utils/format.js
```

### Backend (`/product-service`)
```
app.js
controllers/   auth, product, order, cart
models/        + index.js (associations)
routes/        authRoutes, productRoutes, orderRoutes, cartRoutes
middleware/    auth, errorHandler
config/db.js
scripts/       createAdmin.js, listOrders.js
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription (rôle forcé `client`)
- `POST /api/auth/login` - Connexion

### Produits
- `GET /api/products` - Liste des produits (public)
- `POST /api/products` - Créer (Admin + JWT)
- `PUT /api/products/:id` - Modifier (Admin + JWT)
- `DELETE /api/products/:id` - Supprimer (Admin + JWT)
- `PATCH /api/products/:id/decrement` - Décrémenter stock (Admin + JWT)

### Commandes
- `GET /api/orders` - Liste (Admin + JWT)
- `POST /api/orders` - Créer une commande (JWT)
- `GET /api/client/orders` - Commandes du client connecté (JWT)
- `GET /api/stats` - Stats finances (Admin + JWT)

### Panier (JWT)
- `GET /api/cart`
- `POST /api/cart/add`
- `POST /api/cart/remove`
- `POST /api/cart/update`
- `POST /api/cart/clear`

## Smoke checklist

Après démarrage API + frontend :

1. Inscription client → login → redirection `/dashboard`
2. Catalogue `/home` → ajout panier → mini-panier
3. Checkout → validation commande → historique `/client/orders`
4. `npm run create-admin` → login admin → `/admin/products` CRUD
5. `/admin/orders` et `/admin/finances` chargent avec le token admin

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