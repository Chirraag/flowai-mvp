# FlowAI Launchpad Architecture Documentation

## Overview
The FlowAI Launchpad is a comprehensive practice configuration system that enables healthcare practices to set up their basic information, locations, providers, and operating hours through a multi-tab interface with real-time data synchronization.

## Architecture Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: React Query (TanStack Query) for server state
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Routing**: React Router with lazy loading
- **Authentication**: JWT-based with workspace context

### Backend Integration
- **API Base URL**: `https://api.myflowai.com`
- **Authentication**: JWT tokens with automatic refresh
- **Multi-tenancy**: Workspace-based data isolation
- **Database**: PostgreSQL with Drizzle ORM

## Authentication & Workspace System

### Authentication Flow
1. **Login Process**
   - User provides email/password
   - Backend validates credentials
   - Returns JWT access token + refresh token
   - Tokens stored in localStorage

2. **Token Management**
   - Access tokens: 24-hour expiration
   - Refresh tokens: 7-day expiration
   - Automatic token refresh on 401 responses
   - Workspace ID embedded in JWT claims

3. **Workspace Context**
   - Each user belongs to specific workspace(s)
   - Data isolation enforced at API level
   - Query keys include workspace_id for cache isolation

### Security Features
- **JWT Validation**: All API calls include Bearer token
- **Automatic Refresh**: Seamless token renewal
- **Workspace Isolation**: Strict multi-tenant boundaries
- **Protected Routes**: Authentication required for all launchpad access

## API Endpoints

### Data Fetching
```
POST /api/v1/launchpad/fetch-data
- Fetches complete practice configuration
- Returns: basicInfo, locations, providers, hours, metadata
- Requires: Valid JWT with workspace context
```

### Data Updates
```
POST /api/v1/launchpad/update-basic-info
- Updates practice name and alternative names
- Payload: { data: { primaryPracticeName, alternativeNames } }

POST /api/v1/launchpad/update-locations
- Updates practice locations
- Payload: { data: [{ location_name, street_address, phone, city, state, zip }] }

POST /api/v1/launchpad/update-providers
- Updates provider roster
- Payload: { data: { providers: [...], supported_language: [...] } }

POST /api/v1/launchpad/update-hours
- Updates operating hours and policies
- Payload: { data: { is_scheduling_same_as_clinical, holidays, emergency_instructions, after_hours_instructions, clinic_hours, scheduling_hours } }
```

## Data Flow Architecture

### 1. Initial Data Loading
```
User Access → Authentication Check → React Query Fetch → Data Hydration → UI Rendering
```

### 2. Data Structure Mapping
- **Backend Format**: snake_case (e.g., `primary_practice_name`)
- **Frontend Format**: camelCase (e.g., `practiceName`)
- **Mapping Functions**: Transform between formats automatically

### 3. Real-time Updates
```
User Edit → Local State Update → Validation → API Call → Cache Invalidation → UI Refresh
```

## Component Architecture

### Main Components

#### 1. Launchpad Page (`launchpad.tsx`)
- **Purpose**: Main orchestrator component
- **Responsibilities**:
  - Data fetching with React Query
  - Tab management and navigation
  - Save operation coordination
  - Error handling and user feedback

#### 2. Tab Components
- **BasicInfoTab**: Practice name and alternative names
- **LocationsTab**: Multi-location management
- **ProvidersTab**: Provider roster with location assignments
- **HoursTab**: Operating hours and emergency instructions

### Component Communication
- **Imperative Handles**: Each tab exposes `getValues()` and `validate()` methods
- **Props Hydration**: Initial data passed from parent to child components
- **Ref-based Access**: Parent component accesses child state via refs

## State Management

### React Query Integration
```typescript
const { data: launchpadData, error: launchpadError } = useQuery({
  queryKey: ["launchpad", user?.workspace_id],
  queryFn: async () => await fetchLaunchpadData(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Local State Management
- **Tab Components**: Maintain local state for form inputs
- **Hydration**: Props seed local state on component mount
- **Validation**: Client-side validation before API calls

## Data Persistence

### Save Operations
1. **Validation Phase**: All tabs validate their data
2. **Data Collection**: Gather values from all tab refs
3. **Data Normalization**: Transform to API-expected format
4. **Sequential Updates**: API calls in dependency order
5. **Cache Invalidation**: Refresh data after successful save

### Error Handling
- **Validation Errors**: Client-side validation with descriptive messages
- **API Errors**: Server error handling with user-friendly toasts
- **Network Errors**: Automatic retry with exponential backoff

## Multi-Location Support

### Location Management
- **Dynamic Cards**: Each location renders as separate card
- **Add/Remove**: Users can add/remove locations dynamically
- **Validation**: All locations must have complete information
- **Provider Integration**: Location names populate provider assignment options

### Hours Integration
- **Location Context**: Hours tab displays current location name
- **Per-Day Inputs**: Individual hour fields for each day of week
- **Scheduling Toggle**: Separate scheduling hours when different from clinic hours

## Performance Optimizations

### Lazy Loading
- **Component Splitting**: Tab components loaded on demand
- **Bundle Optimization**: Reduced initial bundle size
- **Suspense Boundaries**: Loading states for better UX

### Caching Strategy
- **React Query**: 5-minute stale time for data freshness
- **Cache Invalidation**: Automatic refresh after mutations
- **Background Updates**: Seamless data synchronization

## Security Considerations

### Data Protection
- **Workspace Isolation**: All data scoped to user's workspace
- **JWT Validation**: Every API call authenticated
- **Input Validation**: Client and server-side validation
- **Error Sanitization**: No sensitive data in error messages

### Access Control
- **Route Protection**: Authentication required for all access
- **Permission Validation**: User roles enforced at API level
- **Session Management**: Automatic logout on token expiration

## Error Handling & User Experience

### Error Types
1. **Validation Errors**: Form field validation failures
2. **Network Errors**: API connectivity issues
3. **Authentication Errors**: Token expiration/invalid
4. **Server Errors**: Backend processing failures

### User Feedback
- **Toast Notifications**: Success/error messages
- **Loading States**: Visual feedback during operations
- **Form Validation**: Real-time field validation
- **Error Recovery**: Clear error messages with retry options

## Development Features

### Type Safety
- **TypeScript**: Full type coverage for all components
- **Interface Definitions**: Clear contracts between components
- **API Types**: Separate types for backend/frontend data

### Code Organization
- **Separation of Concerns**: Clear component responsibilities
- **Reusable Components**: Shared UI components
- **Utility Functions**: Centralized data transformation logic

## Future Considerations

### Scalability
- **Multi-workspace Support**: Users with multiple workspaces
- **Role-based Access**: Different permission levels
- **Audit Logging**: Track configuration changes

### Integration Points
- **External APIs**: Healthcare system integrations
- **Real-time Updates**: WebSocket connections for live data
- **Offline Support**: Local storage for offline editing
