# SirGRAMS Backend

## Geo Risk Assessment Management System

> Backend development documentation and onboarding guide for the SirGRAMS academic project.

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Backend Goals](#2-backend-goals)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Project Structure](#6-project-structure)
7. [Understanding the Layers](#7-understanding-the-layers)
8. [CQRS](#8-cqrs)
9. [MediatR](#9-mediatr)
10. [SignalR](#10-signalr)
11. [PostgreSQL + PostGIS](#11-postgresql--postgis)
12. [Entity Framework Core](#12-entity-framework-core)
13. [Data Ingestion](#13-data-ingestion)
14. [Background Workers](#14-background-workers)
15. [Risk Assessment Engine](#15-risk-assessment-engine)
16. [REST API](#16-rest-api)
17. [Authentication and Authorization](#17-authentication-and-authorization)
18. [Validation](#18-validation)
19. [Error Handling](#19-error-handling)
20. [Logging](#20-logging)
21. [Caching](#21-caching)
22. [Package Responsibilities](#22-package-responsibilities)
23. [What We Are NOT Using](#23-what-we-are-not-using)
24. [Git and Branching Rules](#24-git-and-branching-rules)
25. [Backend Development Workflow](#25-backend-development-workflow)
26. [Example Feature](#26-example-feature)
27. [Real-Time Earthquake Flow](#27-real-time-earthquake-flow)
28. [API Design Rules](#28-api-design-rules)
29. [Database Rules](#29-database-rules)
30. [Coding Rules](#30-coding-rules)
31. [Testing](#31-testing)
32. [Local Development Setup](#32-local-development-setup)
33. [Learning Roadmap for Members](#33-learning-roadmap-for-members)
34. [Recommended Development Phases](#34-recommended-development-phases)
35. [Final Architecture](#35-final-architecture)

---

# 1. Project Overview

## What is SirGRAMS?

**SirGRAMS — Geo Risk Assessment Management System** is an academic system designed to monitor natural hazards and provide geographic risk information for the Philippines.

The system will focus on:

* Earthquakes
* Typhoons
* Wind conditions
* Flooding / flood susceptibility
* Volcanic activity
* Other disaster-related geographic information

The system will consume data from available external sources and transform that information into a centralized, geographic monitoring platform.

The frontend will display the information through an interactive map and dashboard.

---

# 2. Backend Goals

The backend is responsible for:

```text
External Disaster Data
        ↓
Data Collection
        ↓
Data Validation
        ↓
Data Normalization
        ↓
PostgreSQL + PostGIS
        ↓
Risk Assessment
        ↓
REST API
        +
SignalR
        ↓
Frontend
```

The backend must support:

* REST APIs
* Real-time updates
* External API integration
* Background data collection
* Geographic/spatial queries
* Risk assessment
* Authentication
* Authorization
* Database persistence
* Validation
* Error handling
* Logging
* Automated testing

---

# 3. Technology Stack

## Core Backend

| Technology            | Purpose                               |
| --------------------- | ------------------------------------- |
| C#                    | Backend programming language          |
| ASP.NET Core          | Web API framework                     |
| .NET 10               | Target framework                      |
| Entity Framework Core | Database ORM                          |
| PostgreSQL            | Relational database                   |
| PostGIS               | Geographic/spatial database extension |
| NetTopologySuite      | .NET spatial types                    |
| SignalR               | Real-time communication               |
| MediatR               | Request/command/query dispatching     |
| FluentValidation      | Request validation                    |
| JWT                   | Authentication                        |
| Docker                | Development environment               |
| Redis                 | Optional caching layer                |
| xUnit                 | Unit testing                          |

---

# 4. System Architecture

SirGRAMS will use a **layered architecture with CQRS and feature-oriented application logic**.

High-level architecture:

```text
                     ┌─────────────────────┐
                     │      FRONTEND       │
                     │   React + TypeScript│
                     └──────────┬──────────┘
                                │
                       REST API │ SignalR
                                │
                                ▼
                  ┌─────────────────────────┐
                  │      ASP.NET CORE       │
                  │                         │
                  │ Controllers / Hubs      │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │     APPLICATION LAYER   │
                  │                         │
                  │ Commands                │
                  │ Queries                 │
                  │ Handlers                │
                  │ Validators               │
                  │ Business Use Cases      │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │      DOMAIN LAYER       │
                  │                         │
                  │ Entities                │
                  │ Value Objects           │
                  │ Domain Rules             │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │   INFRASTRUCTURE LAYER  │
                  │                         │
                  │ EF Core                 │
                  │ PostgreSQL              │
                  │ PostGIS                 │
                  │ External APIs           │
                  │ Repositories             │
                  └─────────────────────────┘
```

Background workers operate alongside the API:

```text
                  ┌──────────────────────┐
                  │    BACKGROUND JOBS   │
                  │                      │
                  │ Earthquake Worker    │
                  │ Typhoon Worker       │
                  │ Volcano Worker       │
                  │ Weather Worker       │
                  └──────────┬───────────┘
                             │
                             ▼
                       APPLICATION
                             │
                             ▼
                         DATABASE
                             │
                             ▼
                         SIGNALR
                             │
                             ▼
                         FRONTEND
```

---

# 5. Backend Architecture

The backend is divided into these major projects:

```text
SirGRAMS.API
SirGRAMS.Application
SirGRAMS.Domain
SirGRAMS.Infrastructure
SirGRAMS.Workers
SirGRAMS.Tests
```

Dependency direction:

```text
API
 ↓
Application
 ↓
Domain

Infrastructure
 ↓
Application
 ↓
Domain

Workers
 ↓
Application
Infrastructure
```

The Domain layer should remain independent from infrastructure-specific implementations.

---

# 6. Project Structure

Recommended solution:

```text
SirGRAMS/
│
├── src/
│   │
│   ├── SirGRAMS.API/
│   │   ├── Controllers/
│   │   ├── Hubs/
│   │   ├── Middleware/
│   │   ├── Extensions/
│   │   └── Program.cs
│   │
│   ├── SirGRAMS.Application/
│   │   ├── Common/
│   │   │   ├── Behaviors/
│   │   │   ├── Interfaces/
│   │   │   └── Models/
│   │   │
│   │   └── Features/
│   │       ├── Earthquakes/
│   │       │   ├── Commands/
│   │       │   ├── Queries/
│   │       │   ├── DTOs/
│   │       │   └── Validators/
│   │       │
│   │       ├── Typhoons/
│   │       ├── Floods/
│   │       ├── Volcanoes/
│   │       └── Users/
│   │
│   ├── SirGRAMS.Domain/
│   │   ├── Entities/
│   │   ├── Enums/
│   │   ├── ValueObjects/
│   │   ├── Events/
│   │   └── Exceptions/
│   │
│   ├── SirGRAMS.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── Context/
│   │   │   ├── Configurations/
│   │   │   └── Migrations/
│   │   │
│   │   ├── ExternalServices/
│   │   ├── Repositories/
│   │   └── Services/
│   │
│   └── SirGRAMS.Workers/
│       ├── Earthquake/
│       ├── Typhoon/
│       ├── Volcano/
│       └── Weather/
│
├── tests/
│   ├── SirGRAMS.UnitTests/
│   └── SirGRAMS.IntegrationTests/
│
├── docker-compose.yml
├── SirGRAMS.sln
└── README.md
```

---

# 7. Understanding the Layers

## Domain

The Domain contains the actual business concepts of SirGRAMS.

Examples:

```text
Earthquake
Typhoon
Volcano
FloodRisk
HazardZone
City
RiskAssessment
User
Alert
```

Example:

```csharp
public class Earthquake
{
    public Guid Id { get; set; }

    public string ExternalId { get; set; } = string.Empty;

    public double Magnitude { get; set; }

    public double DepthKm { get; set; }

    public DateTimeOffset OccurredAt { get; set; }

    public string LocationDescription { get; set; } = string.Empty;
}
```

Do not put database code here.

---

# Application

The Application layer represents **what the system can do**.

Examples:

```text
CreateEarthquake
GetRecentEarthquakes
GetEarthquakeById
GetEarthquakesNearLocation
CalculateRisk
CreateAlert
GetActiveTyphoons
```

This is where CQRS and MediatR are primarily used.

---

# Infrastructure

Infrastructure handles external details:

```text
PostgreSQL
PostGIS
EF Core
External APIs
Redis
File storage
Email services
```

For example:

```text
PHIVOLCS API
     ↓
Infrastructure
     ↓
Application
```

---

# API

The API layer exposes the backend to the frontend.

Examples:

```http
GET /api/earthquakes
GET /api/earthquakes/{id}
GET /api/typhoons
GET /api/volcanoes
GET /api/floods
```

It also contains SignalR hubs.

---

# Workers

Workers continuously collect external data.

Example:

```text
EarthquakeWorker
      ↓
Fetch external source
      ↓
Parse data
      ↓
Validate
      ↓
Send command
      ↓
Application Handler
      ↓
Database
      ↓
SignalR
```

---

# 8. CQRS

## What is CQRS?

CQRS means:

**Command Query Responsibility Segregation**

The basic idea is:

> Commands change data. Queries retrieve data.

Instead of having one service containing everything:

```text
EarthquakeService
├── Create
├── Update
├── Delete
├── Get
├── Search
└── Calculate
```

we separate operations.

### Commands

Commands perform actions that modify state.

Examples:

```text
CreateEarthquakeCommand
UpdateTyphoonCommand
CreateAlertCommand
CalculateRiskCommand
```

### Queries

Queries retrieve information.

Examples:

```text
GetEarthquakeByIdQuery
GetRecentEarthquakesQuery
GetActiveTyphoonsQuery
GetFloodRiskQuery
```

---

## Why use CQRS?

CQRS makes large features easier to organize.

Example:

```text
Earthquakes/
│
├── Commands/
│   ├── CreateEarthquake/
│   └── UpdateEarthquake/
│
├── Queries/
│   ├── GetEarthquake/
│   └── GetRecentEarthquakes/
```

A developer working on earthquake retrieval does not need to modify the earthquake creation logic.

---

# 9. MediatR

## What is MediatR?

MediatR is a mediator library.

Instead of a controller directly calling a service:

```text
Controller
    ↓
EarthquakeService
    ↓
Database
```

we can use:

```text
Controller
    ↓
MediatR
    ↓
Handler
    ↓
Database
```

For example:

```csharp
public record GetRecentEarthquakesQuery(int Limit)
    : IRequest<List<EarthquakeDto>>;
```

Handler:

```csharp
public class GetRecentEarthquakesHandler
    : IRequestHandler<GetRecentEarthquakesQuery, List<EarthquakeDto>>
{
    private readonly AppDbContext _context;

    public GetRecentEarthquakesHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<EarthquakeDto>> Handle(
        GetRecentEarthquakesQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.Earthquakes
            .OrderByDescending(x => x.OccurredAt)
            .Take(request.Limit)
            .Select(x => new EarthquakeDto
            {
                Id = x.Id,
                Magnitude = x.Magnitude,
                DepthKm = x.DepthKm
            })
            .ToListAsync(cancellationToken);
    }
}
```

The controller becomes very small:

```csharp
[HttpGet]
public async Task<IActionResult> GetRecent(
    int limit,
    CancellationToken cancellationToken)
{
    var result = await _mediator.Send(
        new GetRecentEarthquakesQuery(limit),
        cancellationToken);

    return Ok(result);
}
```

---

## MediatR Pipeline Behaviors

MediatR can also provide pipeline behaviors.

Think of them as middleware around handlers:

```text
Request
   ↓
Validation
   ↓
Logging
   ↓
Authorization
   ↓
Transaction
   ↓
Handler
   ↓
Response
```

Possible behaviors:

```text
ValidationBehavior
LoggingBehavior
PerformanceBehavior
TransactionBehavior
```

Do not create behaviors just because they exist.

Only add them when they provide a real benefit.

---

# 10. SignalR

## What is SignalR?

SignalR provides real-time communication between the backend and connected clients.

Microsoft specifically documents SignalR as suitable for monitoring dashboards, maps, GPS applications, alerts, and other applications requiring server-to-client updates. It uses WebSockets when possible and can fall back to other transports.

SirGRAMS can use SignalR for:

```text
New earthquake
Updated earthquake
New typhoon
Updated typhoon
Volcano alert
Flood risk update
System notification
```

---

## Important

SignalR does NOT magically make external APIs real-time.

Example:

```text
External source
      ↓
Worker periodically checks source
      ↓
New information detected
      ↓
Database updated
      ↓
SignalR
      ↓
Connected clients
```

SignalR makes **SirGRAMS-to-client communication real-time**.

---

## Example Hub

```csharp
public class DisasterHub : Hub
{
}
```

Register:

```csharp
builder.Services.AddSignalR();
```

Map:

```csharp
app.MapHub<DisasterHub>("/hubs/disaster");
```

---

## Sending an event

A background worker can use:

```csharp
IHubContext<DisasterHub>
```

to notify clients.

Example:

```csharp
await hubContext.Clients.All.SendAsync(
    "EarthquakeCreated",
    earthquakeDto,
    cancellationToken);
```

React receives:

```text
EarthquakeCreated
```

and updates the map.

---

# 11. PostgreSQL + PostGIS

SirGRAMS requires spatial data.

We will use:

```text
PostgreSQL
+
PostGIS
```

PostGIS allows PostgreSQL to store and query geographic information.

Examples:

```text
Point
LineString
Polygon
MultiPolygon
```

Examples in SirGRAMS:

```text
Earthquake → Point
Volcano → Point
Typhoon track → LineString
Flood zone → Polygon
City boundary → Polygon/MultiPolygon
Fault line → LineString
```

Npgsql's NetTopologySuite integration is the recommended .NET approach for mapping these spatial types to PostGIS.

---

# 12. Entity Framework Core

EF Core is our ORM.

It allows C# code to interact with PostgreSQL without manually writing SQL for every operation.

Example:

```csharp
var earthquakes = await context.Earthquakes
    .Where(x => x.Magnitude >= 5)
    .ToListAsync();
```

Instead of manually writing:

```sql
SELECT *
FROM earthquakes
WHERE magnitude >= 5;
```

However:

> EF Core does NOT mean we should never write SQL.

For advanced GIS queries, raw SQL may sometimes be appropriate.

---

# 13. Spatial Data

Use NetTopologySuite types.

Example:

```csharp
using NetTopologySuite.Geometries;

public class Earthquake
{
    public Guid Id { get; set; }

    public Point Location { get; set; } = default!;
}
```

For coordinates:

```text
X = Longitude
Y = Latitude
```

Example:

```csharp
new Point(123.8854, 10.3157)
```

means approximately:

```text
Longitude: 123.8854
Latitude: 10.3157
```

Do NOT reverse latitude and longitude.

---

# 14. Data Ingestion

External disaster data should not be directly exposed to the frontend.

Bad architecture:

```text
React
  ↓
External API
```

Preferred:

```text
External API
     ↓
SirGRAMS Worker
     ↓
Normalize
     ↓
Validate
     ↓
Database
     ↓
SirGRAMS API
     ↓
React
```

This gives us control over:

* Data format
* Caching
* Deduplication
* Validation
* Error handling
* Historical records
* Risk calculations
* Rate limits

---

# 15. External Data Adapters

Different sources may have completely different formats.

For example:

```text
Source A
{
    "lat": 10.3,
    "lon": 123.9,
    "mag": 5.4
}
```

Another source may provide:

```xml
<earthquake>
    <latitude>10.3</latitude>
    <longitude>123.9</longitude>
</earthquake>
```

The backend should normalize these into a SirGRAMS domain model.

Example:

```text
External Source
      ↓
Adapter
      ↓
Normalized DTO
      ↓
Command
      ↓
Handler
      ↓
Domain
      ↓
Database
```

---

# 16. Background Workers

ASP.NET Core supports hosted background services.

SirGRAMS can have:

```text
EarthquakeWorker
TyphoonWorker
VolcanoWorker
WeatherWorker
```

Conceptually:

```csharp
public class EarthquakeWorker : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Fetch external data
            // Validate
            // Process
            // Save
            // Broadcast

            await Task.Delay(
                TimeSpan.FromMinutes(1),
                stoppingToken);
        }
    }
}
```

Do not duplicate business logic inside workers.

Workers should primarily:

1. Fetch
2. Parse
3. Dispatch application commands
4. Repeat

---

# 17. Risk Assessment Engine

The risk engine is responsible for transforming raw hazard information into useful assessments.

Example:

```text
Earthquake
    +
Distance
    +
Depth
    +
Magnitude
    +
Population
    +
Hazard zones
        ↓
Risk Assessment
```

For flooding:

```text
Rainfall
+
Elevation
+
Flood susceptibility
+
River level
+
Historical flooding
        ↓
Flood Risk
```

---

# 18. Rule-Based Risk First

The first version should NOT depend heavily on machine learning.

Start with explainable rules.

Example:

```text
Magnitude >= 6
AND
Depth <= 20km
AND
Distance <= 50km

→ HIGH RISK
```

This allows the team to test the system before introducing ML.

Later:

```text
Historical Data
      ↓
ML Model
      ↓
Risk Prediction
```

ML should be treated as an additional analytics component rather than the entire backend.

---

# 19. REST API

REST is used for normal request/response operations.

Example:

```http
GET /api/earthquakes
GET /api/earthquakes/{id}

GET /api/typhoons
GET /api/typhoons/{id}

GET /api/volcanoes
GET /api/volcanoes/{id}

GET /api/floods
GET /api/floods/risk

GET /api/hazards
GET /api/cities
```

Use SignalR for live updates.

Do NOT use SignalR for everything.

---

# 20. REST + SignalR Together

Initial page load:

```text
React
  ↓
GET /api/earthquakes
  ↓
Current earthquakes
```

Then:

```text
React
  ↓
Connect to SignalR
  ↓
Wait for updates
```

New earthquake:

```text
Worker
  ↓
Database
  ↓
SignalR
  ↓
React
```

This is the preferred pattern.

---

# 21. Authentication

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

Possible roles:

```text
User
Admin
Analyst
```

Example:

```text
User
→ View disasters

Analyst
→ View risk assessments

Admin
→ Manage users/system configuration
```

JWT can be used for API authentication.

---

# 22. Validation

All incoming requests should be validated.

Example:

```text
Magnitude
0 < magnitude <= 10

Latitude
-90 <= latitude <= 90

Longitude
-180 <= longitude <= 180
```

FluentValidation can be used for request validation. Its current documentation recommends avoiding the old ASP.NET Core automatic validation pipeline for new projects, particularly because of limitations around asynchronous validation and modern ASP.NET Core application styles.

Example:

```csharp
public class CreateEarthquakeValidator
    : AbstractValidator<CreateEarthquakeCommand>
{
    public CreateEarthquakeValidator()
    {
        RuleFor(x => x.Magnitude)
            .InclusiveBetween(0, 10);

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90);

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180);
    }
}
```

---

# 23. Error Handling

Do not return random errors from every controller.

Use centralized exception handling.

Example response:

```json
{
    "status": 400,
    "title": "Validation Error",
    "errors": {
        "magnitude": [
            "Magnitude must be between 0 and 10."
        ]
    }
}
```

Unexpected server errors should not expose stack traces to clients.

---

# 24. Logging

Use ASP.NET Core's built-in logging abstractions.

Important events:

```text
Worker started
External API request
External API failure
New disaster detected
Database operation failure
SignalR broadcast
Authentication failure
Unexpected exception
```

Do NOT log:

* Passwords
* JWTs
* Secrets
* API keys
* Sensitive user information

---

# 25. Caching

Redis is optional for the first version.

Potential uses:

```text
Current typhoon data
Recent earthquakes
Current alerts
Frequently requested geographic data
Rate limiting
```

Initial architecture:

```text
API
 ↓
PostgreSQL
```

Later:

```text
API
 ↓
Redis
 ↓ cache miss
PostgreSQL
```

Do not introduce Redis simply because it is popular.

Use it when there is a clear caching requirement.

---

# 26. Package Responsibilities

The team should understand why every dependency exists.

## Core packages

### ASP.NET Core

Provides:

```text
Web API
Dependency Injection
Middleware
Authentication
Authorization
SignalR
Configuration
Logging
```

---

### Entity Framework Core

Provides:

```text
ORM
Database queries
Migrations
Change tracking
Relationships
```

---

### Npgsql

PostgreSQL provider for .NET.

Used by EF Core to communicate with PostgreSQL.

---

### Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite

Provides PostGIS/NetTopologySuite integration.

Required for our geographic database functionality.

---

### NetTopologySuite

Provides spatial types:

```text
Point
Polygon
LineString
MultiPolygon
```

and spatial operations.

---

### MediatR

Used for:

```text
Commands
Queries
Handlers
Pipeline Behaviors
```

MediatR currently supports registering handlers and pipeline behaviors through dependency injection. Before adding it, the team should review its current licensing terms because the current project has changed from its historical licensing model.

**Important project rule:**

Before the team locks MediatR into the project, the backend lead must verify that its current license is appropriate for this academic project.

If there is any licensing concern, CQRS can still be implemented without MediatR.

---

### SignalR

Used for:

```text
Real-time updates
Live alerts
Disaster events
Map updates
Notifications
```

SignalR is included in the ASP.NET Core stack; server-side SignalR functionality is provided by ASP.NET Core rather than requiring a separate third-party server framework.

---

### FluentValidation

Used for:

```text
Command validation
Query validation
Input validation
```

---

### JWT Authentication

Used for:

```text
Authentication
Authorization
Role-based access
```

---

# 27. What We Are NOT Using

We are deliberately avoiding unnecessary complexity.

## No microservices initially

We are NOT creating:

```text
Earthquake Service
Typhoon Service
Flood Service
Volcano Service
User Service
Notification Service
Risk Service
```

as separate deployable applications.

Instead:

```text
One backend
+
Modular architecture
```

This is easier to develop and deploy for an academic project.

---

## No Kafka initially

Kafka is powerful but unnecessary for the initial system.

---

## No Kubernetes

Docker is enough for development and initial deployment.

---

## No Redis initially

Redis can be introduced later if caching is actually needed.

---

## No ML initially

The risk engine should first work using deterministic rules.

---

# 28. Git and Branching Rules

Do NOT have everyone directly develop on `main`.

Recommended:

```text
main
│
├── develop
│
├── feature/earthquake-api
├── feature/typhoon-worker
├── feature/flood-risk
├── feature/auth
└── feature/signalr
```

Workflow:

```text
Create branch
      ↓
Develop
      ↓
Test
      ↓
Commit
      ↓
Push
      ↓
Pull Request
      ↓
Code Review
      ↓
Merge
```

---

# 29. Commit Messages

Use meaningful commits.

Good:

```text
feat: add earthquake query handler
feat: implement earthquake ingestion worker
feat: add SignalR disaster hub
fix: correct earthquake coordinate mapping
refactor: extract risk calculation service
test: add earthquake handler tests
```

Avoid:

```text
update
fix
asdf
changes
final
final2
final-final
```

---

# 30. Backend Development Workflow

For every feature:

### Step 1 — Define the requirement

Example:

> Users need to view recent earthquakes.

### Step 2 — Define the domain

```text
Earthquake
```

### Step 3 — Define the query

```text
GetRecentEarthquakesQuery
```

### Step 4 — Define DTO

```text
EarthquakeDto
```

### Step 5 — Create handler

```text
GetRecentEarthquakesHandler
```

### Step 6 — Query database

```text
EF Core
+
PostGIS
```

### Step 7 — Create endpoint

```http
GET /api/earthquakes
```

### Step 8 — Add tests

### Step 9 — Document API

### Step 10 — Pull request

---

# 31. Example Feature

Suppose we want:

> Get earthquakes within 50 km of a location.

Structure:

```text
Features/
└── Earthquakes/
    └── Queries/
        └── GetEarthquakesNearby/
            ├── GetEarthquakesNearbyQuery.cs
            ├── GetEarthquakesNearbyHandler.cs
            └── GetEarthquakesNearbyValidator.cs
```

Request:

```text
latitude
longitude
radius
```

Flow:

```text
HTTP Request
     ↓
Controller
     ↓
MediatR
     ↓
Query
     ↓
Validator
     ↓
Handler
     ↓
EF Core
     ↓
PostGIS
     ↓
DTO
     ↓
HTTP Response
```

---

# 32. Real-Time Earthquake Flow

This is one of the most important SirGRAMS flows.

```text
                EXTERNAL SOURCE
                      │
                      ▼
             Earthquake Worker
                      │
                      ▼
               Parse / Normalize
                      │
                      ▼
                Validate Data
                      │
                      ▼
            CreateEarthquakeCommand
                      │
                      ▼
                  MediatR
                      │
                      ▼
             Command Handler
                      │
               ┌──────┴──────┐
               ▼             ▼
          PostgreSQL      Risk Engine
          + PostGIS           │
               │              │
               └──────┬───────┘
                      ▼
                SignalR Hub
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Client 1    Client 2    Client 3
```

This is the core real-time architecture.

---

# 33. SignalR Event Design

Use explicit event names.

Example:

```text
EarthquakeCreated
EarthquakeUpdated
TyphoonUpdated
VolcanoAlertUpdated
FloodRiskUpdated
RiskAssessmentCreated
```

Avoid generic events such as:

```text
Update
DataChanged
SomethingHappened
```

Events should clearly describe what happened.

---

# 34. Data Deduplication

External APIs may return the same event multiple times.

For example:

```text
Worker run #1
Earthquake ID = PHIVOLCS-123

Worker run #2
Earthquake ID = PHIVOLCS-123

Worker run #3
Earthquake ID = PHIVOLCS-123
```

We should NOT create three database records.

Use the source's external identifier:

```text
external_id
```

and enforce uniqueness.

Example:

```text
source = PHIVOLCS
external_id = PHIVOLCS-123
```

This allows the backend to determine whether an event already exists.

---

# 35. External Data Failure

External APIs WILL fail sometimes.

Possible reasons:

```text
Timeout
Rate limit
Server unavailable
Invalid response
Malformed data
Network error
```

The worker should not crash permanently.

Preferred:

```text
Request
  ↓
Failure
  ↓
Log error
  ↓
Wait
  ↓
Retry
  ↓
Continue
```

Use reasonable retry policies.

Do not hammer an unavailable API.

---

# 36. API Design Rules

Use plural nouns:

```http
/api/earthquakes
/api/typhoons
/api/volcanoes
/api/hazards
```

Get one:

```http
GET /api/earthquakes/{id}
```

Create:

```http
POST /api/earthquakes
```

Update:

```http
PUT /api/earthquakes/{id}
```

Delete:

```http
DELETE /api/earthquakes/{id}
```

Search/filter:

```http
GET /api/earthquakes?minMagnitude=5
```

---

# 37. DTO Rules

Do not expose EF Core entities directly from API endpoints.

Bad:

```text
Database Entity
     ↓
JSON
```

Preferred:

```text
Database Entity
     ↓
DTO
     ↓
JSON
```

Example:

```csharp
public class EarthquakeDto
{
    public Guid Id { get; init; }

    public double Magnitude { get; init; }

    public double DepthKm { get; init; }

    public double Latitude { get; init; }

    public double Longitude { get; init; }

    public DateTimeOffset OccurredAt { get; init; }
}
```

---

# 38. Database Rules

Use migrations.

Do NOT manually modify production database schemas.

Typical workflow:

```text
Modify Entity
     ↓
Create Migration
     ↓
Review Migration
     ↓
Apply Migration
```

Example:

```bash
dotnet ef migrations add AddEarthquakeEntity
dotnet ef database update
```

---

# 39. Database Naming

Use consistent names.

Recommended:

```text
earthquakes
typhoons
typhoon_positions
volcanoes
hazard_zones
cities
risk_assessments
alerts
users
```

Avoid inconsistent naming such as:

```text
EarthquakeData
earthquakeData
tbl_earthquake
EarthquakeTable
```

---

# 40. Testing

We should have at least:

## Unit Tests

Test business logic independently.

Example:

```text
RiskCalculatorTests
EarthquakeValidatorTests
CreateEarthquakeHandlerTests
```

## Integration Tests

Test:

```text
API
+
Database
```

Example:

```text
GET /api/earthquakes
```

should actually return expected data.

---

# 41. Local Development

Recommended development environment:

```text
Docker
 ├── PostgreSQL + PostGIS
 └── Redis (optional)
```

Developers run the API locally.

```text
Developer machine

React
localhost
   │
   ▼
ASP.NET Core
localhost
   │
   ▼
Docker PostgreSQL
```

This keeps database setup consistent between team members.

---

# 42. Environment Variables

Never commit secrets.

Do NOT put:

```text
API keys
JWT secrets
Database passwords
```

directly in Git.

Use:

```text
appsettings.Development.json
.env
environment variables
```

and ensure secret files are in `.gitignore`.

Example:

```text
ConnectionStrings__DefaultConnection
JWT__Secret
ExternalApis__WeatherApiKey
```

---

# 43. Team Responsibilities

Possible backend division:

### Backend Lead

Responsible for:

```text
Architecture
Code standards
Database architecture
CQRS structure
Code reviews
Integration
```

### API Developers

Responsible for:

```text
Controllers
Queries
Commands
DTOs
Validation
```

### Data Ingestion Developers

Responsible for:

```text
External APIs
Workers
Normalization
Deduplication
Retries
```

### GIS Developer

Responsible for:

```text
PostGIS
Spatial queries
Geographic data
Hazard zones
Risk intersections
```

### Real-Time Developer

Responsible for:

```text
SignalR
Hub design
Events
Real-time updates
```

Members can work across multiple responsibilities.

---

# 44. Important Architectural Rule

Do NOT put everything inside controllers.

Bad:

```csharp
[HttpPost]
public async Task<IActionResult> Create(...)
{
    // validation

    // API calls

    // business logic

    // database logic

    // risk calculation

    // SignalR

    // everything
}
```

Controllers should be thin.

Preferred:

```text
Controller
    ↓
Command
    ↓
Handler
    ↓
Domain / Infrastructure
```

---

# 45. Important CQRS Rule

Do not use CQRS simply for CRUD because "CQRS is required."

Use it to organize **use cases**.

Good:

```text
CreateEarthquake
GetRecentEarthquakes
GetEarthquakesNearby
CalculateFloodRisk
CreateAlert
```

Not:

```text
DoEverythingCommand
EarthquakeManagerCommand
MegaEarthquakeHandler
```

Keep each handler focused.

---

# 46. Important SignalR Rule

SignalR should notify clients about events.

It should not become our database.

Bad:

```text
Client connects
    ↓
SignalR
    ↓
All historical data
```

Preferred:

```text
REST API
    ↓
Initial state

SignalR
    ↓
Changes after initial state
```

---

# 47. Important GIS Rule

Never assume:

```text
latitude = X
longitude = Y
```

For NetTopologySuite:

```text
X = longitude
Y = latitude
```

Always verify coordinate reference systems.

---

# 48. Important Disaster Data Rule

SirGRAMS should distinguish between:

### Observation

Something actually detected.

Example:

```text
Earthquake magnitude 5.2
```

### Hazard

An area that is susceptible to a hazard.

Example:

```text
High flood susceptibility
```

### Forecast

A prediction about future conditions.

Example:

```text
Potential heavy rainfall
```

### Risk

Our calculated assessment combining hazard + exposure + vulnerability.

These are different concepts and should not be mixed in the database or API.

---

# 49. Recommended Development Order

## Phase 1 — Backend foundation

```text
Create solution
Create projects
Configure DI
Configure PostgreSQL
Configure migrations
```

---

## Phase 2 — Earthquake module

```text
Earthquake entity
Database
API
Query
Worker
```

---

## Phase 3 — SignalR

```text
DisasterHub
EarthquakeCreated
EarthquakeUpdated
React connection
```

---

## Phase 4 — GIS

```text
PostGIS
NetTopologySuite
Geographic queries
City boundaries
Hazard zones
```

---

## Phase 5 — Other disasters

```text
Typhoons
Floods
Volcanoes
Weather
```

---

## Phase 6 — Risk engine

```text
Rule-based risk
Spatial intersections
Risk scores
```

---

## Phase 7 — Authentication

```text
JWT
Roles
Permissions
```

---

## Phase 8 — Analytics / ML

Only after sufficient data is available.

---

## Phase 9 — Optimization

Potentially:

```text
Redis
Caching
Performance improvements
Database indexes
```

---

# 50. Backend Learning Roadmap

Members who are unfamiliar with ASP.NET Core should learn in this order.

## Level 1 — C# fundamentals

Learn:

```text
Classes
Interfaces
Records
Generics
LINQ
async/await
Dependency Injection
Exception handling
```

---

## Level 2 — ASP.NET Core

Learn:

```text
Controllers
Routing
Dependency Injection
Middleware
Configuration
appsettings
HTTP status codes
DTOs
```

---

## Level 3 — EF Core

Learn:

```text
DbContext
DbSet
Relationships
LINQ queries
Migrations
Tracking
NoTracking
Transactions
```

---

## Level 4 — PostgreSQL

Learn:

```text
Tables
Relationships
Indexes
Constraints
Joins
Transactions
```

---

## Level 5 — PostGIS

Learn:

```text
Point
Polygon
LineString
Geometry
Geography
Spatial queries
Distance
Intersections
```

---

## Level 6 — CQRS

Understand:

```text
Command
Query
Handler
DTO
Use case
```

---

## Level 7 — MediatR

Learn:

```text
IRequest
IRequestHandler
ISender
IPublisher
PipelineBehavior
```

---

## Level 8 — SignalR

Learn:

```text
Hub
Connection
Client
Server
Groups
IHubContext
Events
```

---

## Level 9 — Background Services

Learn:

```text
BackgroundService
CancellationToken
Periodic execution
Retries
External API calls
```

---

# 51. Recommended Mental Model

When developing a feature, ask:

### What does the user want?

```text
"Show recent earthquakes."
```

### Is it a query or command?

```text
Query
```

### What data is required?

```text
Earthquake
```

### Where does the data come from?

```text
PostgreSQL/PostGIS
```

### How does the frontend receive it?

```text
REST API
```

### Does it need live updates?

```text
SignalR
```

---

Another example:

> "Automatically add a newly detected earthquake."

```text
External source
      ↓
Worker
      ↓
Command
      ↓
Handler
      ↓
Database
      ↓
Risk assessment
      ↓
SignalR
      ↓
Frontend
```

---

# 52. Final Backend Architecture

The intended architecture is:

```text
                         ┌──────────────────────┐
                         │      EXTERNAL APIs   │
                         │                      │
                         │ PHIVOLCS             │
                         │ PAGASA               │
                         │ MGB                  │
                         │ Other Data Sources   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   BACKGROUND WORKERS  │
                         │                      │
                         │ Earthquake            │
                         │ Typhoon               │
                         │ Volcano               │
                         │ Weather               │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    APPLICATION       │
                         │                      │
                         │ Commands             │
                         │ Queries              │
                         │ Handlers              │
                         │ Validation             │
                         │ Business Logic        │
                         └──────────┬───────────┘
                                    │
                       ┌────────────┴────────────┐
                       ▼                         ▼
             ┌──────────────────┐       ┌─────────────────┐
             │ DOMAIN           │       │ RISK ENGINE     │
             │                  │       │                 │
             │ Entities         │       │ Risk Rules      │
             │ Domain Rules     │       │ Spatial Risk    │
             │ Value Objects    │       │ ML Later        │
             └────────┬─────────┘       └────────┬────────┘
                      │                          │
                      └────────────┬─────────────┘
                                   ▼
                        ┌─────────────────────┐
                        │ POSTGRESQL + POSTGIS│
                        │                     │
                        │ Events              │
                        │ Geographic Data     │
                        │ Hazard Zones        │
                        │ Risk Assessments     │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          ┌──────────────────┐          ┌─────────────────┐
          │ ASP.NET CORE API │          │ SIGNALR HUB     │
          │                  │          │                 │
          │ REST             │          │ Live Events     │
          │ Authentication   │          │ Alerts          │
          │ Authorization    │          │ Map Updates     │
          └────────┬─────────┘          └────────┬────────┘
                   │                             │
                   └──────────────┬──────────────┘
                                  ▼
                       ┌──────────────────────┐
                       │ REACT + TYPESCRIPT   │
                       │                      │
                       │ Interactive Map      │
                       │ Dashboard            │
                       │ Disaster Alerts      │
                       │ Risk Visualization   │
                       └──────────────────────┘
```

---

# 53. The Most Important Things to Learn Before Coding

Every backend member should understand these concepts before implementing major features:

```text
1. C# async/await
2. Dependency Injection
3. ASP.NET Core Web API
4. REST
5. EF Core
6. PostgreSQL
7. PostGIS
8. NetTopologySuite
9. CQRS
10. MediatR
11. SignalR
12. BackgroundService
13. DTOs
14. Validation
15. Authentication
16. Git
17. Unit Testing
```

You do NOT need to master everything before starting.

Learn each concept when the project reaches that stage.

---

# 54. Golden Rules

### Rule 1

**Keep controllers thin.**

### Rule 2

**Keep business logic out of controllers.**

### Rule 3

**Commands modify state.**

### Rule 4

**Queries retrieve data.**

### Rule 5

**Workers collect external data.**

### Rule 6

**SignalR distributes live updates.**

### Rule 7

**REST provides initial/current state.**

### Rule 8

**PostGIS handles geographic operations.**

### Rule 9

**Never expose database entities directly through the API.**

### Rule 10

**Never commit secrets.**

### Rule 11

**Do not add packages without understanding why they are needed.**

### Rule 12

**Do not introduce microservices unless there is a demonstrated need.**

### Rule 13

**Do not introduce ML until we have a clear problem and sufficient data.**

### Rule 14

**Every feature should be testable independently.**

### Rule 15

**Ask "why do we need this?" before adding architecture or dependencies.**

---

# 55. Final Team Objective

The goal is NOT to build the most complicated backend possible.

The goal is to build a backend that is:

```text
Reliable
Maintainable
Testable
Understandable
Scalable
Geospatially capable
Real-time
```

The architecture should support the project's academic requirements while remaining realistic for a student development team.

The core architecture is:

```text
ASP.NET Core
+
CQRS
+
MediatR
+
PostgreSQL
+
PostGIS
+
SignalR
+
Background Workers
```

with Redis and ML introduced only when the project actually requires them.

**Build the simplest architecture that correctly solves the problem.**
