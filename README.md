# Turismo-Capilla-Backend
# Backend | Turismo Capilla del Monte

<p align="center">
  <img src="https://img.shields.io/badge/Proyecto-Turismo%20Capilla%20del%20Monte-2ea44f?style=for-the-badge" alt="Proyecto">
  <img src="https://img.shields.io/badge/Componente-API%20%26%20Backend-blue?style=for-the-badge" alt="Backend">
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-yellow?style=for-the-badge" alt="Estado">
</p>

<p align="center">
  <strong>Servicios backend y API REST para centralizar, gestionar y proveer la información turística de Capilla del Monte.</strong>
</p>

---

## Sobre el proyecto

Este repositorio contiene la arquitectura, servicios y APIs del proyecto **Turismo Capilla del Monte**. 

Su propósito es proporcionar una capa de servidor robusta y escalable encargada de la lógica de negocio, persistencia de datos y exposición de endpoints seguros para que las aplicaciones cliente (frontend web y futuros servicios móviles) puedan consultar y gestionar los datos turísticos de la localidad.

El backend se encuentra actualmente en una etapa inicial de análisis y diseño de arquitectura.

---

## Problema

La información turística suele requerir actualización dinámica, validaciones y una estructura de datos normalizada para evitar inconsistencias y dispersión.

Este servicio backend resuelve la necesidad de:
* **Centralizar la fuente de datos:** Unificar la información de atractivos, actividades y servicios turísticos en un único modelo de datos accesible vía API.
* **Desacoplar la lógica:** Permitir que el frontend consuma datos estructurados y confiables sin acoplarse a la persistencia.

---

## Objetivo

Desarrollar una API REST y servicios auxiliares eficientes, seguros y documentados que permitan **gestionar, almacenar y servir los recursos turísticos** de la plataforma web.

### Objetivos específicos

* Diseñar el modelo de datos relacional/no relacional para los recursos turísticos.
* Implementar endpoints CRUD para atractivos, actividades, categorías y puntos de interés.
* Diseñar mecanismos de validación, manejo de errores y respuestas estandarizadas (JSON).
* Configurar entornos de desarrollo, pruebas y despliegue (variables de entorno, CORS, seguridad básica).
* Documentar los endpoints (Swagger / OpenAPI / Postman).

---

## Alcance inicial del Backend

La primera versión contempla la implementación de servicios para:

* **Atractivos turísticos:** Endpoints para listado, detalle, filtrado por categorías y ubicación.
* **Actividades y eventos:** Gestión de fechas, descripciones y tipos de experiencia.
* **Información general y contacto:** Proveedores de datos institucionales y de emergencias.
* **Gestión de multimedia:** Enlaces y metadatos asociados a imágenes y recursos visuales.
* **Consumo seguro:** Configuración de CORS y políticas de acceso para el cliente web.

---

## Tecnologías

El stack definitivo está en proceso de definición.

Se están evaluando tecnologías para el servidor (Node.js/Express, Python/FastAPI, Java/Spring Boot u otros) y motores de base de datos (PostgreSQL, MySQL o MongoDB) según las necesidades de rendimiento y modelado del proyecto.

> **Nota:** esta sección se actualizará con los requisitos de entorno (versión de runtime, dependencias, variables `.env`) una vez fijado el stack.

---

## Equipo

Proyecto desarrollado por:

| Integrante               |
| ----------------------- |
| **Tiago Nicolitsis**    |
| **Martino Costigliolo** |
| **Juan Larcher**        |

---

## Etapas de desarrollo (Backend)

### 1. Análisis y modelado
Definición de entidades, diagramas entidad-relación (ER) y contratos de API.

### 2. Configuración de arquitectura
Estructuración del proyecto (patrón MVC / multicapa), configuración de base de datos y middleware base.

### 3. Implementación de endpoints
Desarrollo de controladores, lógica de negocio y persistencia de datos.

### 4. Pruebas y optimización
Pruebas de endpoints (unitarias/integración), validación de carga y optimización de consultas.

### 5. Documentación y despliegue
Generación de documentación interactiva de la API y despliegue del servicio en entorno cloud/servidor.

---

## Entregables

* Esquema y scripts de base de datos.
* API REST funcional con endpoints documentados.
* Colección de pruebas de endpoints (Postman / Swagger).
* Servidor desplegado en entorno de pruebas/producción.
* Documentación de configuración local y variables de entorno.

---

## Estado del proyecto

**Actualmente: En etapa de inicio, análisis de requerimientos y modelado de datos.**

---

## 📚 Documentación y Recursos

- **Wiki del repositorio:** Detalla los aspectos del marco PMI, arquitectura de backend, actas y planificación técnica.
- **Google Drive:** Almacena la documentación general del proyecto.  
  [Acceder a la carpeta del proyecto en Google Drive](https://drive.google.com/drive/u/1/folders/1KQLWydgsWH7hCD0RqfqIrFO5AzJRqB5E)

---

<p align="center">
  <strong>Turismo Capilla del Monte - Backend API</strong><br>
  Capa de servicios y persistencia de datos.
</p>
