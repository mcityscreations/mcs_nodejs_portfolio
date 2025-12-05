![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Framework-Express-4182?logo=express)

# 🚀 Mcitys API v2.0 Portfolio

This repository offers a concise overview of the Mcitys API, which is currently running in **production**.

---

## 💡 Status and Context

This version (v2.0) is **no longer actively maintained** as the development focus has entirely shifted to the next generation: **mcs_api3**, built with **NestJS**.

The v2 project served as a foundational **learning laboratory** where I experimented with various technologies and architectural patterns.

### The Architectural Transition (Lessons Learned)

The architecture of this v2 version, initially developed long ago, led to significant maintenance challenges that are currently being resolved in v3:

* **Monolithic Structure:** The integrated architecture made scaling and isolating modules difficult.
* **Mixed Module System:** The codebase contains a mix of CommonJS and TypeScript modules, complicating dependency management and configuration.
* **Boilerplate & Verbosity:** Excessive boilerplate code required for common tasks (e.g., routing, middleware management).

These challenges directly motivated the decision to adopt the structured, scalable, and standardized approach offered by **NestJS** for the v3.

---

## ➡️ Next Steps

To see my latest, most current, and best-practice work, please refer to the **mcs_api3** repository.

# 🚀 Mcitys API v2.0 Portfolio

Ce dépôt offre un aperçu concis de l'API Mcitys, actuellement en mode **production**.

## 💡 Statut et Contexte

Cette version (v2.0) n'est plus activement maintenue, car l'effort de développement est entièrement reporté sur la prochaine génération : mcs_api3, construite avec NestJS.

Le projet v2 a servi de laboratoire d'apprentissage fondamental où j'ai expérimenté diverses technologies et patterns architecturaux.

## La Transition Architecturale (Leçons Apprises)

L'architecture de cette v2, développée initialement il y a longtemps, a mené à d'importants défis de maintenance qui sont résolus dans la v3 :

- **Structure Monolithique** : L'architecture intégrée rendait l'isolation des modules et la montée en charge difficiles.
- **Système de Modules Mixte** : La base de code mélangeait des modules CommonJS et TypeScript, compliquant la gestion des dépendances.
- **Code Répétitif (Boilerplate)** : Nécessité d'écrire un code standard excessif pour des tâches courantes (routage, middlewares).

Ces défis ont directement motivé la décision d'adopter l'approche structurée, standardisée et scalable offerte par NestJS pour la v3.

## ➡️ Prochaines étapes

Pour voir mon travail le plus récent, conforme aux meilleures pratiques actuelles, veuillez consulter le dépôt mcs_api3.