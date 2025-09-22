Backend architecture:
# FlowAI Backend Architecture
Based on the analysis of the flowai-backend directory, here's a concise overview of its architecture:
## Core Structure
- Express.js Application : Built on Node.js with Express framework (port 3002)
- Multi-tenant Architecture : Uses workspace-based isolation for data and access control
- JWT Authentication : Secure token-based authentication with workspace validation
- PostgreSQL Database : Connected via connection pool with SSL support
## Key Components
1. 1.
   Entry Point
   - app.js : Main application file that configures middleware, routes, and starts the server
2. 2.
   Configuration
   - config/jwt.js : JWT configuration settings
   - config/redox.js : Configuration for Redox healthcare API integration
3. 3.
   Database
   - db/connection.js : PostgreSQL connection pool setup with query logging
4. 4.
   Middleware
   - middleware/jwt.js : JWT authentication with workspace validation
   - middleware/workspaceValidation.js : Ensures users only access resources in their workspace
   - middleware/errorHandler.js : Centralized error handling
   - middleware/auth.js : Authentication utilities
   - middleware/oauthMiddleware.js : OAuth authentication support
5. 5.
   Routes
   - routes/auth.js : User authentication endpoints (login, refresh token)
   - routes/patient.js : Patient data management
   - routes/appointment.js : Appointment scheduling
   - routes/slot.js : Time slot availability
   - routes/documentReference.js : Document management
   - routes/launchpad.js : Application launchpad functionality
   - routes/oauth.js : OAuth integration endpoints
   - routes/redoxWebhook.js : Webhooks for Redox integration
   - routes/retellWebhook.js & routes/retellAgent.js : Retell voice AI integration
6. 6.
   Services
   - services/userAuthService.js : User authentication and workspace management
   - services/authService.js : Token management
   - services/redoxApiService.js : Integration with Redox healthcare API
   - services/retellService.js & services/retellAgentService.js : Voice AI services
   - services/callbackScheduler.js : Scheduled task management
   - services/oauthService.js : OAuth service integration
7. 7.
   Utilities
   - utils/logger.js : Centralized logging
   - utils/redoxTransformer.js : Data transformation for Redox API
   - utils/callIdStorage.js : Call ID management
## Security Features
- JWT-based authentication with refresh tokens
- Workspace-based multi-tenancy for data isolation
- Request rate limiting
- Helmet for HTTP security headers
- CORS protection
## API Documentation
- Swagger integration at /api-docs endpoint
- Health check endpoint at /health
## Integration Points
- Redox healthcare API integration for patient and appointment data
- Retell voice AI integration for conversational interfaces
- OAuth support for third-party authentication

Workspace IDs are typically conveyed in two ways: embedded as a tenant/workspace claim in the JWT and, when a user can switch workspaces, sent explicitly as a selector like an X-Workspace-Id header or a route param that the backend validates against the token before scoping any data access.

In this architecture
The external backend enforces multi-tenancy with JWT middleware and a workspace-validation layer, which commonly means the token includes a workspace/tenant claim and middleware compares any client-selected workspace (header or param) to that claim before proceeding.

This aligns with standard Express middleware patterns: authenticate first, extract the workspace context, and store it on the request or async-local storage so downstream handlers and the ORM can consistently scope queries.

Common passing patterns
JWT claim only: The backend derives the effective workspace from a claim in the access token and ignores client-provided workspace IDs, which is the safest approach if users are bound to a single workspace per token.

Header selector + verify: The frontend includes a header like X-Workspace-Id (or X-Tenant-Id) to indicate the active workspace, and middleware checks it against the JWT’s allowed workspaces to prevent cross-tenant access.

Path parameter + verify: Endpoints may include /:workspaceId in the URL; validation ensures it matches a workspace in the JWT before executing the request, avoiding trust in unvalidated params or body fields


Authentication and Workspace Concepts in FlowAI Backend
Based on the analysis of the codebase, here's a detailed explanation of the authentication and workspace concepts in the FlowAI backend application:
Authentication System
Core Components
1.
JWT-Based Authentication
Uses JSON Web Tokens (JWT) for secure, stateless authentication
Configured with 24-hour expiration for access tokens and 7-day expiration for refresh tokens
Tokens contain user identity and workspace information
2.
Multi-Factor Authentication Flow
Initial authentication via email/password
Secondary authentication via workspace selection (for users with multiple workspaces)
3.
Token Management
Access tokens contain comprehensive user data including permissions
Refresh tokens enable token renewal without re-authentication
Tokens are tracked in database for potential revocation
Authentication Process
1.
Login Flow
User provides email and password
System validates credentials against database
If user has multiple workspaces, returns a list for selection (status 300)
If user has a single workspace, generates JWT and refresh tokens
2.
Workspace Selection
For users with multiple workspaces, a separate endpoint handles workspace selection
User provides email and selected workspace ID
System validates the selection and generates workspace-specific tokens
3.
Token Verification
JWT middleware validates tokens on protected routes
Extracts user and workspace information
Validates workspace access permissions
Workspace Concept
Multi-Tenant Architecture
1.
Workspace as Tenant
Each workspace represents a separate tenant in the system
Users can belong to multiple workspaces with different roles
Data is isolated between workspaces
2.
Workspace Components
workspace_id: Unique identifier for each workspace
workspace_name: Human-readable name
workspace_api_key: API key for external integrations
retell_workspace_id: Integration with Retell voice AI service
Database Structure
The database schema includes:
1.
Users Table
Contains user authentication information
Links users to workspaces with specific roles
Tracks login history and account status
2.
Workspaces Table
Stores workspace configuration
Contains API keys and integration settings
3.
Role-Based Permissions
Permissions are assigned to roles
Roles are assigned to users within specific workspaces
Permissions determine feature access
Workspace Access Control
1.
JWT-Based Validation
Workspace ID is embedded in JWT tokens
Middleware validates that requested workspace matches token
2.
Explicit Validation Middleware
workspaceValidation.js provides additional validation
Ensures users only access resources within their assigned workspace
Extracts workspace ID from request body, query, or parameters
3.
Role-Based Access Control
Different permission sets based on user role within workspace
Permissions are loaded during authentication
JWT contains permission list for efficient access control
Integration with External Services
1.
Redox Healthcare API
Each workspace can have its own Redox integration
API calls include workspace context
2.
Retell Voice AI
Workspaces have dedicated Retell workspace IDs
Voice agent interactions are workspace-specific
Security Considerations
1.
Token Security
JWT tokens are signed with a secret key
Refresh tokens have unique IDs (JTI) for tracking
Failed login attempts are tracked to prevent brute force attacks
2.
Workspace Isolation
Strict validation prevents cross-workspace data access
All API routes enforce workspace boundaries
Database queries include workspace filtering
3.
Account Protection
Account lockout after multiple failed attempts
Account status tracking (active/inactive)
Password hashing with bcrypt
Technical Implementation
1.
Middleware Chain
JWT authentication middleware (jwt.js)
Workspace validation middleware (workspaceValidation.js)
These are applied to protected routes
2.
Service Layer
userAuthService.js handles authentication logic
Token generation and verification
Workspace selection and validation
3.
Route Handlers
/auth/login for initial authentication
/auth/select-workspace for workspace selection
/auth/refresh-token for token renewal
the above is the current authentication in detail.