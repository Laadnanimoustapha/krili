package com.cybersecurity.model;

/**
 * Threat Level Enumeration
 * =========================
 * 
 * Defines the different threat levels for security incidents
 */
public enum ThreatLevel {
    LOW(1, "Low", "Minimal threat - routine monitoring"),
    MEDIUM(2, "Medium", "Moderate threat - increased monitoring required"),
    HIGH(3, "High", "High threat - immediate attention required"),
    CRITICAL(4, "Critical", "Critical threat - emergency response required");

    private final int level;
    private final String displayName;
    private final String description;

    ThreatLevel(int level, String displayName, String description) {
        this.level = level;
        this.displayName = displayName;
        this.description = description;
    }

    public int getLevel() {
        return level;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isHigherThan(ThreatLevel other) {
        return this.level > other.level;
    }

    public boolean isLowerThan(ThreatLevel other) {
        return this.level < other.level;
    }

    public static ThreatLevel fromSeverity(int severity) {
        if (severity >= 8) return CRITICAL;
        if (severity >= 6) return HIGH;
        if (severity >= 4) return MEDIUM;
        return LOW;
    }

    public static ThreatLevel fromString(String threatLevel) {
        if (threatLevel == null) return LOW;
        
        switch (threatLevel.toUpperCase()) {
            case "CRITICAL":
                return CRITICAL;
            case "HIGH":
                return HIGH;
            case "MEDIUM":
                return MEDIUM;
            case "LOW":
            default:
                return LOW;
        }
    }

    @Override
    public String toString() {
        return displayName;
    }
}