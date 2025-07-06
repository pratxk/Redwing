import { gql } from '@apollo/client';

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
        lastName
        role
        isActive
        lastLogin
        createdAt
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      role
      isActive
      lastLogin
      createdAt
      organizationMemberships {
        id
        role
        organization {
          id
          name
          description
        }
      }
    }
  }
`;

// ============================================================================
// USERS
// ============================================================================

export const USERS_QUERY = gql`
  query Users($organizationId: ID) {
    users(organizationId: $organizationId) {
      id
      email
      firstName
      lastName
      role
      isActive
      lastLogin
      createdAt
      organizationMemberships {
        id
        role
        organization {
          id
          name
        }
      }
    }
  }
`;

export const USER_QUERY = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      email
      firstName
      lastName
      role
      isActive
      lastLogin
      createdAt
      organizationMemberships {
        id
        role
        organization {
          id
          name
          description
        }
      }
      createdMissions {
        id
        name
        status
        createdAt
      }
      assignedMissions {
        id
        name
        status
        createdAt
      }
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      firstName
      lastName
      role
      isActive
      createdAt
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      firstName
      lastName
      role
      isActive
      updatedAt
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      id
      name
      description
      isActive
      createdAt
      stats {
        totalDrones
        activeDrones
        totalMissions
        completedMissions
        totalSites
        totalFlightHours
        averageMissionDuration
      }
    }
  }
`;

export const MY_ORGANIZATIONS_QUERY = gql`
  query MyOrganizations {
    myOrganizations {
      id
      name
      description
      isActive
      createdAt
      stats {
        totalDrones
        activeDrones
        totalMissions
        completedMissions
        totalSites
        totalFlightHours
        averageMissionDuration
      }
    }
  }
`;

export const ORGANIZATION_QUERY = gql`
  query Organization($id: ID!) {
    organization(id: $id) {
      id
      name
      description
      isActive
      createdAt
      stats {
        totalDrones
        activeDrones
        totalMissions
        completedMissions
        totalSites
        totalFlightHours
        averageMissionDuration
      }
      members {
        id
        role
        joinedAt
        user {
          id
          email
          firstName
          lastName
          role
        }
      }
      sites {
        id
        name
        description
        latitude
        longitude
        altitude
        isActive
      }
      drones {
        id
        name
        model
        status
        batteryLevel
        isActive
      }
      missions {
        id
        name
        status
        type
        createdAt
      }
    }
  }
`;

// ============================================================================
// SITES
// ============================================================================

export const SITES_QUERY = gql`
  query Sites($organizationId: ID!) {
    sites(organizationId: $organizationId) {
      id
      name
      description
      latitude
      longitude
      altitude
      isActive
      createdAt
      updatedAt
      missions {
        id
        name
        status
        type
        createdAt
      }
    }
  }
`;

export const SITE_QUERY = gql`
  query Site($id: ID!) {
    site(id: $id) {
      id
      name
      description
      latitude
      longitude
      altitude
      isActive
      createdAt
      updatedAt
      organization {
        id
        name
      }
      missions {
        id
        name
        status
        type
        priority
        scheduledAt
        startedAt
        completedAt
        createdAt
      }
    }
  }
`;

export const CREATE_SITE_MUTATION = gql`
  mutation CreateSite($input: CreateSiteInput!) {
    createSite(input: $input) {
      id
      name
      description
      latitude
      longitude
      altitude
      isActive
      createdAt
    }
  }
`;

export const UPDATE_SITE_MUTATION = gql`
  mutation UpdateSite($id: ID!, $input: UpdateSiteInput!) {
    updateSite(id: $id, input: $input) {
      id
      name
      description
      latitude
      longitude
      altitude
      isActive
      updatedAt
    }
  }
`;

export const DELETE_SITE_MUTATION = gql`
  mutation DeleteSite($id: ID!) {
    deleteSite(id: $id)
  }
`;

// ============================================================================
// DRONES
// ============================================================================

export const DRONES_QUERY = gql`
  query Drones($organizationId: ID!) {
    drones(organizationId: $organizationId) {
      id
      name
      model
      serialNumber
      status
      batteryLevel
      lastMaintenanceAt
      currentLatitude
      currentLongitude
      currentAltitude
      isActive
      maxFlightTime
      maxSpeed
      maxAltitude
      cameraResolution
      sensorTypes
      createdAt
      updatedAt
      missions {
        id
        name
        status
        type
        createdAt
      }
    }
  }
`;

export const DRONE_QUERY = gql`
  query Drone($id: ID!) {
    drone(id: $id) {
      id
      name
      model
      serialNumber
      status
      batteryLevel
      lastMaintenanceAt
      currentLatitude
      currentLongitude
      currentAltitude
      isActive
      maxFlightTime
      maxSpeed
      maxAltitude
      cameraResolution
      sensorTypes
      createdAt
      updatedAt
      organization {
        id
        name
      }
      missions {
        id
        name
        status
        type
        priority
        scheduledAt
        startedAt
        completedAt
        createdAt
      }
      flightLogs {
        id
        timestamp
        latitude
        longitude
        altitude
        speed
        batteryLevel
        gpsAccuracy
        heading
      }
    }
  }
`;

export const AVAILABLE_DRONES_QUERY = gql`
  query AvailableDrones($organizationId: ID!) {
    availableDrones(organizationId: $organizationId) {
      id
      name
      model
      status
      batteryLevel
      maxFlightTime
      maxSpeed
      maxAltitude
    }
  }
`;

export const CREATE_DRONE_MUTATION = gql`
  mutation CreateDrone($input: CreateDroneInput!) {
    createDrone(input: $input) {
      id
      name
      model
      serialNumber
      status
      batteryLevel
      isActive
      maxFlightTime
      maxSpeed
      maxAltitude
      cameraResolution
      sensorTypes
      createdAt
    }
  }
`;

export const UPDATE_DRONE_MUTATION = gql`
  mutation UpdateDrone($id: ID!, $input: UpdateDroneInput!) {
    updateDrone(id: $id, input: $input) {
      id
      name
      model
      maxFlightTime
      maxSpeed
      maxAltitude
      cameraResolution
      sensorTypes
      updatedAt
    }
  }
`;

export const DELETE_DRONE_MUTATION = gql`
  mutation DeleteDrone($id: ID!) {
    deleteDrone(id: $id)
  }
`;

export const UPDATE_DRONE_STATUS_MUTATION = gql`
  mutation UpdateDroneStatus($id: ID!, $status: DroneStatus!) {
    updateDroneStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const UPDATE_DRONE_LOCATION_MUTATION = gql`
  mutation UpdateDroneLocation($id: ID!, $latitude: Float!, $longitude: Float!, $altitude: Float!) {
    updateDroneLocation(id: $id, latitude: $latitude, longitude: $longitude, altitude: $altitude) {
      id
      currentLatitude
      currentLongitude
      currentAltitude
      updatedAt
    }
  }
`;

export const UPDATE_DRONE_BATTERY_MUTATION = gql`
  mutation UpdateDroneBattery($id: ID!, $batteryLevel: Int!) {
    updateDroneBattery(id: $id, batteryLevel: $batteryLevel) {
      id
      batteryLevel
      updatedAt
    }
  }
`;

// ============================================================================
// MISSIONS
// ============================================================================

export const MISSIONS_QUERY = gql`
  query Missions($organizationId: ID!, $status: MissionStatus) {
    missions(organizationId: $organizationId, status: $status) {
      id
      name
      description
      type
      status
      priority
      flightPattern
      plannedAltitude
      plannedSpeed
      overlapPercentage
      scheduledAt
      startedAt
      completedAt
      estimatedDuration
      progress
      createdAt
      updatedAt
      createdBy {
        id
        firstName
        lastName
      }
      assignedTo {
        id
        firstName
        lastName
      }
      drone {
        id
        name
        model
        status
        batteryLevel
      }
      site {
        id
        name
        latitude
        longitude
      }
      waypoints {
        id
        sequence
        latitude
        longitude
        altitude
        action
        parameters
      }
    }
  }
`;

export const MISSION_QUERY = gql`
  query Mission($id: ID!) {
    mission(id: $id) {
      id
      name
      description
      type
      status
      priority
      flightPattern
      plannedAltitude
      plannedSpeed
      overlapPercentage
      scheduledAt
      startedAt
      completedAt
      estimatedDuration
      progress
      createdAt
      updatedAt
      createdBy {
        id
        firstName
        lastName
        email
      }
      assignedTo {
        id
        firstName
        lastName
        email
      }
      drone {
        id
        name
        model
        serialNumber
        status
        batteryLevel
        currentLatitude
        currentLongitude
        currentAltitude
      }
      site {
        id
        name
        description
        latitude
        longitude
        altitude
      }
      organization {
        id
        name
      }
      waypoints {
        id
        sequence
        latitude
        longitude
        altitude
        action
        parameters
      }
      flightLogs {
        id
        timestamp
        latitude
        longitude
        altitude
        speed
        batteryLevel
        gpsAccuracy
        heading
      }
      surveyData {
        id
        dataType
        fileUrl
        metadata
        capturedAt
        latitude
        longitude
        altitude
      }
    }
  }
`;

export const MY_MISSIONS_QUERY = gql`
  query MyMissions {
    myMissions {
      id
      name
      description
      type
      status
      priority
      scheduledAt
      startedAt
      completedAt
      progress
      createdAt
      drone {
        id
        name
        model
      }
      site {
        id
        name
      }
    }
  }
`;

export const ACTIVE_MISSIONS_QUERY = gql`
  query ActiveMissions($organizationId: ID!) {
    activeMissions(organizationId: $organizationId) {
      id
      name
      status
      progress
      startedAt
      estimatedDuration
      drone {
        id
        name
        batteryLevel
        currentLatitude
        currentLongitude
        currentAltitude
      }
      site {
        id
        name
        latitude
        longitude
      }
    }
  }
`;

export const CREATE_MISSION_MUTATION = gql`
  mutation CreateMission($input: CreateMissionInput!) {
    createMission(input: $input) {
      id
      name
      description
      type
      status
      priority
      flightPattern
      plannedAltitude
      plannedSpeed
      overlapPercentage
      scheduledAt
      estimatedDuration
      createdAt
      drone {
        id
        name
        model
      }
      site {
        id
        name
        latitude
        longitude
      }
    }
  }
`;

export const UPDATE_MISSION_MUTATION = gql`
  mutation UpdateMission($id: ID!, $input: UpdateMissionInput!) {
    updateMission(id: $id, input: $input) {
      id
      name
      description
      type
      status
      priority
      flightPattern
      plannedAltitude
      plannedSpeed
      overlapPercentage
      scheduledAt
      estimatedDuration
      updatedAt
    }
  }
`;

export const DELETE_MISSION_MUTATION = gql`
  mutation DeleteMission($id: ID!) {
    deleteMission(id: $id)
  }
`;

export const START_MISSION_MUTATION = gql`
  mutation StartMission($id: ID!) {
    startMission(id: $id) {
      id
      status
      startedAt
      progress
    }
  }
`;

export const PAUSE_MISSION_MUTATION = gql`
  mutation PauseMission($id: ID!) {
    pauseMission(id: $id) {
      id
      status
    }
  }
`;

export const RESUME_MISSION_MUTATION = gql`
  mutation ResumeMission($id: ID!) {
    resumeMission(id: $id) {
      id
      status
    }
  }
`;

export const ABORT_MISSION_MUTATION = gql`
  mutation AbortMission($id: ID!) {
    abortMission(id: $id) {
      id
      status
    }
  }
`;

export const COMPLETE_MISSION_MUTATION = gql`
  mutation CompleteMission($id: ID!) {
    completeMission(id: $id) {
      id
      status
      completedAt
      progress
    }
  }
`;

export const ASSIGN_MISSION_MUTATION = gql`
  mutation AssignMission($id: ID!, $userId: ID!) {
    assignMission(id: $id, userId: $userId) {
      id
      assignedTo {
        id
        firstName
        lastName
      }
    }
  }
`;

// ============================================================================
// ANALYTICS
// ============================================================================

export const ORGANIZATION_STATS_QUERY = gql`
  query OrganizationStats($organizationId: ID!) {
    organizationStats(organizationId: $organizationId) {
      totalDrones
      activeDrones
      totalMissions
      completedMissions
      totalSites
      totalFlightHours
      averageMissionDuration
    }
  }
`;

export const MISSION_STATS_QUERY = gql`
  query MissionStats($organizationId: ID!, $timeRange: String) {
    missionStats(organizationId: $organizationId, timeRange: $timeRange)
  }
`;

export const DRONE_UTILIZATION_QUERY = gql`
  query DroneUtilization($organizationId: ID!) {
    droneUtilization(organizationId: $organizationId)
  }
`;

// ============================================================================
// REAL-TIME DATA
// ============================================================================

export const REALTIME_FLIGHT_DATA_QUERY = gql`
  query RealtimeFlightData($missionId: ID!) {
    realtimeFlightData(missionId: $missionId) {
      id
      timestamp
      latitude
      longitude
      altitude
      speed
      batteryLevel
      gpsAccuracy
      heading
    }
  }
`;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const MISSION_UPDATED_SUBSCRIPTION = gql`
  subscription MissionUpdated($organizationId: ID!) {
    missionUpdated(organizationId: $organizationId) {
      id
      name
      status
      progress
      startedAt
      completedAt
      drone {
        id
        name
        batteryLevel
        currentLatitude
        currentLongitude
        currentAltitude
      }
    }
  }
`;

export const DRONE_STATUS_UPDATED_SUBSCRIPTION = gql`
  subscription DroneStatusUpdated($organizationId: ID!) {
    droneStatusUpdated(organizationId: $organizationId) {
      id
      name
      status
      batteryLevel
      currentLatitude
      currentLongitude
      currentAltitude
      lastMaintenanceAt
    }
  }
`;

export const FLIGHT_DATA_UPDATED_SUBSCRIPTION = gql`
  subscription FlightDataUpdated($missionId: ID!) {
    flightDataUpdated(missionId: $missionId) {
      id
      timestamp
      latitude
      longitude
      altitude
      speed
      batteryLevel
      gpsAccuracy
      heading
    }
  }
`;

export const SETTINGS_QUERY = gql`
  query Settings($organizationId: ID!) {
    settings(organizationId: $organizationId) {
      notifications {
        email
        push
        sms
      }
      theme
      language
      timezone
      units
      autoRefresh
      refreshInterval
    }
  }
`; 