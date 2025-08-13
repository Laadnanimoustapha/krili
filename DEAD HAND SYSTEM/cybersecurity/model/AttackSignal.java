package com.cybersecurity.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Attack Signal Model
 * ===================
 * 
 * Represents an attack signal received from external components
 * (Python, TypeScript, or internal monitoring systems)
 */
public class AttackSignal {

    @JsonProperty("signal_id")
    private String signalId;

    @JsonProperty("attack_type")
    private String attackType;

    @JsonProperty("source")
    private String source;

    @JsonProperty("severity")
    private int severity; // 1-10 scale

    @JsonProperty("description")
    private String description;

    @JsonProperty("timestamp")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    @JsonProperty("source_ip")
    private String sourceIp;

    @JsonProperty("target_ip")
    private String targetIp;

    @JsonProperty("port")
    private Integer port;

    @JsonProperty("protocol")
    private String protocol;

    @JsonProperty("payload")
    private String payload;

    @JsonProperty("metadata")
    private Map<String, Object> metadata;

    @JsonProperty("confidence_level")
    private Double confidenceLevel; // 0.0-1.0

    @JsonProperty("attack_vector")
    private String attackVector;

    @JsonProperty("affected_systems")
    private String[] affectedSystems;

    @JsonProperty("recommended_actions")
    private String[] recommendedActions;

    @JsonProperty("is_ongoing")
    private boolean isOngoing;

    @JsonProperty("estimated_impact")
    private String estimatedImpact;

    // Constructors
    public AttackSignal() {
        this.timestamp = LocalDateTime.now();
        this.isOngoing = true;
        this.confidenceLevel = 1.0;
    }

    public AttackSignal(String signalId, String attackType, String source, int severity, String description) {
        this();
        this.signalId = signalId;
        this.attackType = attackType;
        this.source = source;
        this.severity = severity;
        this.description = description;
    }

    // Getters and Setters
    public String getSignalId() {
        return signalId;
    }

    public void setSignalId(String signalId) {
        this.signalId = signalId;
    }

    public String getAttackType() {
        return attackType;
    }

    public void setAttackType(String attackType) {
        this.attackType = attackType;
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
        this.severity = Math.max(1, Math.min(10, severity)); // Clamp between 1-10
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

    public String getSourceIp() {
        return sourceIp;
    }

    public void setSourceIp(String sourceIp) {
        this.sourceIp = sourceIp;
    }

    public String getTargetIp() {
        return targetIp;
    }

    public void setTargetIp(String targetIp) {
        this.targetIp = targetIp;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public Double getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(Double confidenceLevel) {
        this.confidenceLevel = Math.max(0.0, Math.min(1.0, confidenceLevel)); // Clamp between 0-1
    }

    public String getAttackVector() {
        return attackVector;
    }

    public void setAttackVector(String attackVector) {
        this.attackVector = attackVector;
    }

    public String[] getAffectedSystems() {
        return affectedSystems;
    }

    public void setAffectedSystems(String[] affectedSystems) {
        this.affectedSystems = affectedSystems;
    }

    public String[] getRecommendedActions() {
        return recommendedActions;
    }

    public void setRecommendedActions(String[] recommendedActions) {
        this.recommendedActions = recommendedActions;
    }

    public boolean isOngoing() {
        return isOngoing;
    }

    public void setOngoing(boolean ongoing) {
        isOngoing = ongoing;
    }

    public String getEstimatedImpact() {
        return estimatedImpact;
    }

    public void setEstimatedImpact(String estimatedImpact) {
        this.estimatedImpact = estimatedImpact;
    }

    // Utility methods
    public boolean isCritical() {
        return severity >= 8;
    }

    public boolean isHigh() {
        return severity >= 6 && severity < 8;
    }

    public boolean isMedium() {
        return severity >= 4 && severity < 6;
    }

    public boolean isLow() {
        return severity < 4;
    }

    public ThreatLevel getThreatLevel() {
        if (isCritical()) return ThreatLevel.CRITICAL;
        if (isHigh()) return ThreatLevel.HIGH;
        if (isMedium()) return ThreatLevel.MEDIUM;
        return ThreatLevel.LOW;
    }

    public boolean isHighConfidence() {
        return confidenceLevel != null && confidenceLevel >= 0.8;
    }

    public boolean requiresImmediateAction() {
        return isCritical() && isHighConfidence() && isOngoing;
    }

    @Override
    public String toString() {
        return String.format("AttackSignal{id='%s', type='%s', source='%s', severity=%d, timestamp=%s}",
                signalId, attackType, source, severity, timestamp);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        AttackSignal that = (AttackSignal) obj;
        return signalId != null ? signalId.equals(that.signalId) : that.signalId == null;
    }

    @Override
    public int hashCode() {
        return signalId != null ? signalId.hashCode() : 0;
    }
}