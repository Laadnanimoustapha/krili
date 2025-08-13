package com.cybersecurity.model;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Security Event Model
 * ====================
 * 
 * Represents a security event logged by the system
 */
public class SecurityEvent {

    private String eventId;
    private String eventType;
    private String source;
    private int severity;
    private String description;
    private LocalDateTime timestamp;
    private String threatLevel;
    private String userId;
    private String sessionId;
    private String ipAddress;
    private String userAgent;
    private String action;
    private String resource;
    private boolean successful;
    private Map<String, Object> additionalData;
    private String resolution;
    private LocalDateTime resolvedAt;
    private String resolvedBy;

    // Constructors
    public SecurityEvent() {
        this.timestamp = LocalDateTime.now();
        this.successful = false;
    }

    public SecurityEvent(String eventType, String description, int severity) {
        this();
        this.eventType = eventType;
        this.description = description;
        this.severity = severity;
        this.eventId = generateEventId();
    }

    // Getters and Setters
    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public int getSeverity() {
        return severity;
    }

    public void setSeverity(int severity) {
        this.severity = severity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getThreatLevel() {
        return threatLevel;
    }

    public void setThreatLevel(String threatLevel) {
        this.threatLevel = threatLevel;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public Map<String, Object> getAdditionalData() {
        return additionalData;
    }

    public void setAdditionalData(Map<String, Object> additionalData) {
        this.additionalData = additionalData;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    // Utility methods
    public boolean isCritical() {
        return severity >= 8;
    }

    public boolean isResolved() {
        return resolution != null && resolvedAt != null;
    }

    public void resolve(String resolution, String resolvedBy) {
        this.resolution = resolution;
        this.resolvedBy = resolvedBy;
        this.resolvedAt = LocalDateTime.now();
    }

    private String generateEventId() {
        return "SEC_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }

    @Override
    public String toString() {
        return String.format("SecurityEvent{id='%s', type='%s', severity=%d, timestamp=%s}",
                eventId, eventType, severity, timestamp);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        SecurityEvent that = (SecurityEvent) obj;
        return eventId != null ? eventId.equals(that.eventId) : that.eventId == null;
    }

    @Override
    public int hashCode() {
        return eventId != null ? eventId.hashCode() : 0;
    }
}