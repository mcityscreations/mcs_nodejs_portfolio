# 🚀 Security module | Architecture Node.js, TypeScript, DI container (DiC)

**[Lire en Français 🇫🇷](#module-de-securite-architecture-nodejs-typescript-conteneur-di-dic)**

This module handles authentication and authorization based on user roles. It also implements strategies to block Brute-Force attacks.

## 🔑 Key features

| Feature | Description |
| --- | --- |
| Authentication | Traditionnal login process with a username and a password. Passwords are hashed with **Scrypt** |
| **Rate Limiting** & **reCAPTCHA Enterprise** | Each request is protected from bot attacks |
| MFA & OTP | If reCAPTCHA has some doubts, a **Multi-Factor-Authentication (MFA)** process is launched. Identity is confirmed by a **One-Time-Password (OTP)** mechanism sent by SMS. |
| JWT Tokens | JWTs bear authentication information related to an identified user. Tokens are signed with the **RS256** algorithm and checked everytime a request reaches a protected route. |
| Stateless | The architecture is **stateless**. No session data is stored on the server. Only valid JWTs can grant an access to protected ressources. | 
| **AuthGuards** | Apply protections to specific routes. Some of them are strict and require full authentication and authorization, some of them are optional and return a partial set of data if the user is not authorized/authenticated. |
| Roles management (RBAC) | The security mechanism relies on the **Role-Based-Access-Control (RBAC)** to ensure that every user has a limited access to protected ressources bases on its status (Admin, Artist, Visitor etc.) |

## 🛠️ Implementation Details

| Mechanism | Description |
| --- | --- |
| Rate Limiting | **1st Layer** - Limits the number of requests made for 5 minutes in order to prevent Brute-Force Attacks. |
| reCAPTCHA Enterprise | **2nd Layer** - Analyses each request to checks if a bot is trying to sign in. It returns a score between 0.1 and 1 that determines if the request can be accepted or not. |
| MFA & OTP (SMS) | **3rd Layer** - Only launched if the reCAPTCHA mechanism couldn't detect a bot with certainty. An MFA session is initiated and its ID is stored in a Redis database with a TTL |
| JWT | **4th Layer** - Once the user is authenticated (in a classical manner or through an MFA mechanism), a **JWT is generated** providing a Stateless access to the whole API. A **revokation list** is stored in **Redis** to avoid the reuse of obsolete tokens |

## 🏗️ Scalable & modular architecture

This module complies with the **Oriented Object Programming (OOP)** paradigm and the **Dependency Injection (DI)** pattern.

The Dependency Injection system is managed by TSyringe, all the dependencies of the project are stored in a **Dependecy Injction Container (DiC)** located at the root of the app.

Each module plays a specific role. 
- The **Controller** handles the HTTP protocol. 
- The data transmitted by the client is analysed by custom **Data Transfer Objects (DTOs)**. 
- The **authenticationFlowService** orchestrates the authentication process (rateLimiterService > recaptchaService > loginService > mfaService > otpService > jwtService). 
- **Repositories** manage **CRUD operations** with **MariaDB** and **Redis**. 
- The securityMiddleware.ts file stores two methods that act as **AuthGuards** which protect specific routes.

<a name="module-de-securite-architecture-nodejs-typescript-conteneur-di-dic"></a>
## 🇫🇷 Version Française

# 🚀 Module de sécurité | Architecture Node.js, TypeScript, conteneur DI (DiC)

Ce module gère l'authentification et l'autorisation basées sur les rôles des utilisateurs. Il implémente également des stratégies pour bloquer les attaques par force brute.

## 🔑 Fonctionnalités clés

| Fonctionnalité | Description |
| --- | --- |
Authentification | Processus de connexion traditionnel avec un nom d'utilisateur et un mot de passe. Les mots de passe sont hachés avec **Scrypt** |
| **Limitation de débit (Rate Limiting)** & **reCAPTCHA Enterprise** | Chaque requête est protégée contre les attaques de bots. |
| MFA & OTP	| Si reCAPTCHA a des doutes, un processus d'**Authentification Multi-Facteurs (MFA)** est lancé. L'identité est confirmée par un mécanisme de **Mot de Passe à Usage Unique (OTP)** envoyé par SMS. |
| Tokens JWT | Les **JWT** portent les informations d'authentification relatives à un utilisateur identifié. Les tokens sont signés avec l'algorithme **RS256** et vérifiés à chaque fois qu'une requête atteint une route protégée. |
| **Stateless (Sans état)** | L'architecture est sans état. Aucune donnée de session n'est stockée sur le serveur. Seuls les JWT valides peuvent accorder un accès aux ressources protégées. |
| **AuthGuards** | Appliquent des protections à des routes spécifiques. Certaines sont strictes et nécessitent une authentification et une autorisation complètes, d'autres sont facultatives et renvoient un ensemble partiel de données si l'utilisateur n'est pas autorisé/authentifié. |
| **Gestion des rôles (RBAC)** | Le mécanisme de sécurité repose sur le Contrôle d'Accès Basé sur les Rôles (RBAC) pour garantir que chaque utilisateur dispose d'un accès limité aux ressources protégées en fonction de son statut (Admin, Artiste, Visiteur, etc.) |

## 🛠️ Détails d'implémentation

| Mécanisme | Description |
| --- | --- |
| Limitation de débit | **1ère Couche** - Limite le nombre de requêtes effectuées pendant 5 minutes afin de prévenir les attaques par force brute. |
| reCAPTCHA Enterprise | **2ème Couche** - Analyse chaque requête pour vérifier si un bot tente de se connecter. Il renvoie un score entre 0,1 et 1 qui détermine si la requête peut être acceptée ou non.|
| MFA & OTP (SMS) | **3ème Couche** - Lancé uniquement si le mécanisme reCAPTCHA n'a pas pu détecter un bot avec certitude. Une session MFA est initiée et son ID est stocké dans une base de données **Redis** avec un **TTL (Time-To-Live)**.|
| JWT | **4ème Couche** - Une fois l'utilisateur authentifié (de manière classique ou via un mécanisme MFA), un JWT est généré offrant un accès sans état à l'ensemble de l'API. Une **liste de révocation** stockée dans **Redis** permet d'éviter le réemploi de jetons périmés. |

## 🏗️ Architecture modulaire et évolutive

Ce module est conforme au paradigme de la **Programmation Orientée Objet (POO)** et au patron de conception de **l'Injection de Dépendances (DI)**.

Le système d'Injection de Dépendances est géré par **TSyringe** ; toutes les dépendances du projet sont stockées dans un **Conteneur d'Injection de Dépendances (DiC)** situé à la racine de l'application.

Chaque module joue un rôle spécifique :

- Le **Contrôleur** gère le protocole HTTP.
- Les données transmises par le client sont analysées par des **Objets de Transfert de Données (DTOs)** personnalisés.
- **L'authenticationFlowService** orchestre le processus d'authentification (rateLimiterService > recaptchaService > loginService > mfaService > otpService > jwtService).
- **Les Dépôts** (Repositories) gèrent les opérations **CRUD** avec **MariaDB** et **Redis**.
- Le fichier securityMiddleware.ts contient deux méthodes qui agissent comme des **AuthGuards** (gardes d'authentification) et protègent des routes spécifiques.