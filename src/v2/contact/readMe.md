# 🚀 Communication module (Contact) | Architecture Node.js & TypeScript

**[Lire en Français 🇫🇷](#module-de-communication-contact--architecture-nodejs--typescript)**


This module is **responsible for** securely delivering messages to specified users across different communication channels.

| Technology | Language | Framework | Key concepts |
| :--- | :--- | :--- | :--- |
| Nodemailer, OVHCloud SDK | TypeScript (Node.js) | Express | **Design Patterns** (Strategy, Factory), **OOP** (Inheritance), **SoC**, Centralised error handling. |

---

## 🏗️ Modular and scalable architecture

The **Strategy Pattern** is used to build a robust and scalable architecture, enabling **Separation of Concerns (SoC)**

### 1. The Communicator Layer

**Inheritance** and **composition** define the structure :

* **`CommunicatorBase`** (`contactInterfaces.ts`) : Is an abstract class that defines the **communication contract** (common methods and properties) that every provider must implement.
* **The Strategies (`Communicator`s) :**
    * **`EmailCommunicator`** : Handles email deliveries through **Nodemailer**.
    * **`SmsCommunicator`** : Handles SMS deliveries through **SDK OVHCloud**.

> 💡 **Architectural benefits :** The addition of new providers (ex: Twilio, SendGrid, Push Notifications) does not require **any refactoring** of the existing code; it only requires the creation of a new class implementing `CommunicatorBase`.

### 2. The Factory pattern for Configuration

Upon instantiation, each Communicator uses the Factory Pattern to handle dynamically the configuration settings.

| Module | Factory's mission | Examples |
| :--- | :--- | :--- |
| **`EmailCommunicator`** | **Multi SMTP Accounts** : The Factory configures the provider (`Nodemailer`) with the appropriate credentials `.env` based on the mode requested by the user. | `new EmailCommunicator('newsletter')` (uses `newsletter@mcitys.com`) |
| **`SmsCommunicator`** | **Provider Modularity :** The architecture allows an easier switch to other providers, although OVH is the only registered provider for OTP purposes (authentication, used in the login process), 

---

## 🛡️ Advanced Error Handling

Error handling is a centralised process that offers safety and security at a production scale.

### 1. The Class `HttpError` (OOP)

* **Problem solved :** The default Node.js `Error` is limited.
* **Solution :** Extension of the native class `Error` to create **`HttpError`**, adding two major properties :
    * `statusCode`: Allows to throw exceptions with a specific Http code (ex: `400 Bad Request`, `500 Internal Error`).
    * `isMessagePublic`: Controls the **disclosure of sensitive information**.

### 2. Centralised architecture and Security

* **Single Middleware :** All the errors thrown by the services (including `HttpError`) are caught by a  **dedicated middleware** located at the root of the application (`app.js`).
* **Dev/Prod Logic:** This middleware applies the security logic : internal errors (`500`) are **masked** to the end-user (`isMessagePublic: false`) on **production mode**, protecting the inner details of the API.


<a name="module-de-communication-contact--architecture-nodejs--typescript"></a>
## 🇫🇷 Version Française

# 🚀 Module de Communication (Contact) | Architecture Node.js & TypeScript

Ce module est le **pilier d'infrastructure** de l'API, chargé de l'**acheminement fiable et sécurisé** des messages vers les destinataires spécifiés, via différents canaux de communication.

| Technologie | Langage | Framework | Concepts Clés |
| :--- | :--- | :--- | :--- |
| Nodemailer, OVHCloud SDK | TypeScript (Node.js) | Express | **Design Patterns** (Stratégie, Factory), **POO** (Héritage), **SRP**, Gestion d'erreurs HTTP centralisée. |

---

## 🏗️ Architecture Modulaire et Évolutive

L'architecture est conçue autour du **Pattern Stratégie** pour garantir une **séparation des préoccupations (SRP)** rigoureuse et une extensibilité maximale.

### 1. La Couche Communicator

L'**héritage** et la **composition** définissent la structure :

* **`CommunicatorBase`** (`contactInterfaces.ts`) : Classe abstraite définissant le **contrat de communication** (méthodes communes et propriétés) que chaque fournisseur doit respecter.
* **Les Stratégies (`Communicator`s) :**
    * **`EmailCommunicator`** : Gère l'envoi d'emails via **Nodemailer**.
    * **`SmsCommunicator`** : Gère l'envoi de SMS via le **SDK OVHCloud**.

> 💡 **Avantage Architecturale :** L'ajout d'un nouveau fournisseur (ex: Twilio, SendGrid, Push Notifications) ne nécessite **aucune refactorisation** du code existant, mais seulement l'ajout d'une nouvelle classe implémentant `CommunicatorBase`.

### 2. Le Pattern Factory pour la Configuration

Chaque Communicator utilise le **Pattern Factory** lors de son instanciation pour gérer dynamiquement les configurations :

| Module | Rôle du Factory | Exemples |
| :--- | :--- | :--- |
| **`EmailCommunicator`** | **Multi-Comptes SMTP** : Le Factory configure le transporteur (`Nodemailer`) avec les identifiants `.env` appropriés selon le mode demandé. | `new EmailCommunicator('newsletter')` (utilise `newsletter@mcitys.com`) |
| **`SmsCommunicator`** | **Modularité du Fournisseur :** Bien que seul OVH soit actuellement utilisé pour l'OTP (authentification), le design permet une bascule aisée vers d'autres fournisseurs. | (Utilisé principalement pour le code OTP dans le processus de connexion.) |

---

## 🛡️ Gestion d'Erreurs Avancée

La gestion des erreurs est centralisée, offrant une fiabilité et une sécurité de niveau production.

### 1. La Classe `HttpError` (POO)

* **Problème Résolu :** La classe `Error` par défaut de Node.js est limitée.
* **Solution :** Extension de la classe native `Error` pour créer **`HttpError`**, intégrant deux propriétés cruciales :
    * `statusCode`: Permet de lever des exceptions avec un code HTTP spécifique (ex: `400 Bad Request`, `500 Internal Error`).
    * `isMessagePublic`: Contrôle la **divulgation d'informations sensibles**.

### 2. Centralisation et Sécurité

* **Middleware Unique :** Toutes les erreurs levées dans les services (y compris les `HttpError`) sont interceptées par un **middleware dédié** à la racine (`app.js`).
* **Logique Dev/Prod :** Ce gestionnaire applique la logique de sécurité : les erreurs d'infrastructure (`500`) ont leur message **masqué** (`isMessagePublic: false`) pour le client final en **mode production**, protégeant ainsi les détails internes de l'API.




The Contact module's responsability consists in implementing the infrastructure that sends messages to specified receivers.
It enables the delivery of messages into two formats : SMS and Email.
It is built with Typescript in Node.js using the framework Express.

Architecture of the module
An abstract class named CommunicatorBase (contactInterfaces.ts) defines the common properties that every Communicator module should use.  A Communicator is a class that contains all the business logic that handles both the instantiation of a telecommunication provider and the message delivery. Two communication providers execute the contract made with the CommunicatorBase class : EmailCommunicator and SmsCommunicator.
This Strategy pattern allows to add a new communication provider easily, without refactoring entirely the existing code, defining thus a clear architecture with a strong separation of concerns.

EmailCommunicator
This module is responsible for :
1. The instantiation of the email transporter. The dependency used here is Nodemailer. All the credentials are stored in .env file. The instantiation process implements the Factory pattern where transporter configuration changes depending on the email account requested by the user ('noreply', 'newsletter', 'support'). For instance, the method new EmailCommunicator('newsletter') will instantiate the email transporter linked with the account newsletter@mcitys.com
2. Sending emails 

SmsCommunicator
This module is responsible for :
1. The instantiation of the sms transporter. The dependency used here is the OVH module. All the credentials are stored in .env file. The Factory pattern applies also in this module for modularity purposes only. OVH allows the use of different serviceNames, but in practice, considering the size of the infrastructure, only one service will be used to send OTP codes in a login process.
2. Sending sms


Error handling
The default Error class only delivers messages. I wanted to extend that class to include HTTP codes and the possibility to make the message public or private. All the errors raised are handled by a specific middleware located at the root level of the application, in the file app.js