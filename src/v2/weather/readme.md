# 🌤️Weather Module: Clean Architecture, DI, and Proactive Caching 

## 🏗️ Clean Architecture & Cache Strategy
This module was built in **TypeScript** and adheres strictly to the **OOP** paradigm and the **Dependency Injection Pattern** (DI). It serves weather data, provided by the **OpenWeatherMap API**, to the **Angular** Frontend application, enabling features like specific color themes based on current weather conditions in Marseille. The module is engineered for high availability and minimal latency through proactive caching and asynchronous processing.

## ⚙️ Data Lifecycle and Proactive Caching
Data acquisition is managed proactively by a **Cron Task** (/src/system/cron/cronService.ts) which calls weatherService.setWeather() hourly. This ensures the cache is "warm" before any user request.
Fast Retrieval: The current weather result is immediately stored in **Redis** for sub-millisecond latency.
History Persistence: A persistent copy is then written to **MariaDB** for historical analysis and long-term storage.

## 🧩 Separation of Concerns (SoC)
The module applies the **SoC** principle with clearly defined roles:
- weatherController.ts: Handles **HTTP routing**, relying entirely on the Service layer.
- weatherService.ts: **Business Logic** Layer. Manages the **caching strategy**, data scoring, and orchestrates calls to the Repository/Provider.
- weatherRepository.ts: **Data Access Layer**. Responsible for all **CRUD operations** on both MariaDB and Redis.
- openWeatherProvider.ts: **External Adapter**. Encapsulates the specific business logic for the OpenWeather API (call, error mapping).
- weatherValidators.ts: Uses **Zod DTOs (Data Transfer Objects)** to enforce strong type control and validation on data received from the external provider, ensuring data integrity.
- weatherConfig.ts: Implements the **Factory Pattern** to dynamically instantiate the correct provider, leveraging **abstract definitions**.

## ✅ Scalability and Testability
Scalability is achieved through the **TSyringe Dependency Injection Container (DiC)**, which manages dependency resolution and lifetime. The use of **Abstract Classes** in weatherInterfaces.ts ensures that adding new external providers (e.g., AccuWeather) can be done without modifying the existing Service layer, greatly improving testability and extensibility.

## ⚠️ Centralized Error Handling
Errors are managed by a **custom HttpError class**, which extends the native JavaScript Error object. This class standardizes HTTP responses by including the **statusCode property** and a boolean flag (isMessagePublic) used by global middleware to control the detail level of error messages sent back to the client, enhancing API Security and user experience.
