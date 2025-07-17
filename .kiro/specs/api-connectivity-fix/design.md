# Design Document

## Overview

This design addresses the API connectivity issues between the React Native app and Flask backend. The main problem is that the app cannot establish a connection to the Flask server, resulting in network errors when users try to generate recommendations. The solution involves implementing robust connection handling, proper endpoint configuration, and comprehensive error management.

## Architecture

### Current Issues Identified
1. **Incorrect API URL Configuration**: The current setup uses hardcoded IP addresses that may not match the actual server location
2. **Missing Connection Validation**: No mechanism to verify if the server is running before making requests
3. **Poor Error Handling**: Generic error messages that don't help users understand the problem
4. **No Retry Logic**: Single attempt requests that fail immediately on network issues

### Proposed Solution Architecture
```
React Native App
    ↓
Connection Manager (New)
    ↓
API Service (Enhanced)
    ↓
Flask Backend
```

## Components and Interfaces

### 1. Connection Manager
**Purpose**: Centralized connection handling and endpoint management

**Key Methods**:
- `detectServerEndpoint()`: Automatically detect the correct server URL
- `validateConnection()`: Test connection before making actual requests  
- `getOptimalEndpoint()`: Return the best available endpoint
- `handleConnectionFailure()`: Manage connection failures and retries

**Configuration**:
```javascript
const CONNECTION_CONFIG = {
  endpoints: {
    android_emulator: 'http://10.0.2.2:5000',
    android_device: `http://${LOCAL_IP}:5000`,
    ios_simulator: 'http://localhost:5000',
    ios_device: `http://${LOCAL_IP}:5000`
  },
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};
```

### 2. Enhanced API Service
**Purpose**: Robust API communication with proper error handling

**Key Features**:
- Automatic endpoint detection
- Request timeout handling
- Retry logic with exponential backoff
- Detailed error categorization
- Request/response logging

**Interface**:
```javascript
class APIService {
  async makeRecommendationRequest(payload, options = {})
  async testConnection(endpoint)
  handleNetworkError(error)
  categorizeError(error)
}
```

### 3. Error Handler
**Purpose**: Provide meaningful error messages and recovery suggestions

**Error Categories**:
- **Server Not Running**: Flask server is not started
- **Network Unreachable**: Device cannot reach the server IP
- **Timeout**: Request takes too long to complete
- **Server Error**: Backend returns error response
- **Invalid Response**: Malformed response from server

## Data Models

### Connection Status
```javascript
{
  isConnected: boolean,
  endpoint: string,
  lastSuccessfulConnection: timestamp,
  failureCount: number,
  lastError: string
}
```

### API Request Context
```javascript
{
  endpoint: string,
  payload: object,
  timestamp: number,
  attemptNumber: number,
  timeout: number
}
```

## Error Handling

### Connection Error Flow
1. **Initial Request**: Attempt connection to primary endpoint
2. **Connection Test**: Validate server availability with health check
3. **Retry Logic**: Implement exponential backoff for failed requests
4. **Fallback Endpoints**: Try alternative endpoints if primary fails
5. **User Notification**: Display appropriate error message based on failure type

### Error Message Mapping
- `ECONNREFUSED` → "Server is not running. Please start the Flask backend."
- `ETIMEDOUT` → "Connection timed out. Please check your network."
- `ENETUNREACH` → "Cannot reach server. Please verify the server IP address."
- `Status 0` → "Network connection failed. Please check your internet connection."

## Testing Strategy

### Unit Tests
- Connection manager endpoint detection
- Error categorization logic
- Retry mechanism behavior
- Timeout handling

### Integration Tests
- End-to-end API communication
- Error handling with mock server failures
- Network condition simulation
- Cross-platform endpoint resolution

### Manual Testing Scenarios
1. **Server Running**: Verify successful recommendations
2. **Server Stopped**: Verify appropriate error message
3. **Wrong IP**: Test fallback endpoint logic
4. **Slow Network**: Verify timeout and retry behavior
5. **Invalid Response**: Test malformed response handling

## Implementation Approach

### Phase 1: Connection Detection
- Implement automatic endpoint detection based on platform
- Add connection validation before API requests
- Create health check endpoint in Flask backend

### Phase 2: Error Handling Enhancement
- Categorize different types of network errors
- Implement user-friendly error messages
- Add retry logic with exponential backoff

### Phase 3: Robustness Features
- Add request timeout handling
- Implement connection caching
- Create fallback endpoint support

### Phase 4: Monitoring and Debugging
- Add comprehensive logging
- Implement connection status tracking
- Create debugging utilities for developers