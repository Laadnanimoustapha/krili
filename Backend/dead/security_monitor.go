package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Security Monitoring Dashboard
type SecurityMonitor struct {
	db              *sql.DB
	clients         map[*websocket.Conn]bool
	broadcast       chan SecurityAlert
	mutex           sync.RWMutex
	alertThresholds map[string]int
	metrics         *SecurityMetrics
}

type SecurityAlert struct {
	ID          string                 `json:"id"`
	Type        string                 `json:"type"`
	Severity    string                 `json:"severity"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	UserID      *int                   `json:"user_id,omitempty"`
	IPAddress   string                 `json:"ip_address,omitempty"`
	Location    string                 `json:"location,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
	Timestamp   time.Time              `json:"timestamp"`
	Status      string                 `json:"status"` // new, acknowledged, resolved
}

type SecurityMetrics struct {
	TotalUsers           int                    `json:"total_users"`
	ActiveSessions       int                    `json:"active_sessions"`
	FailedLogins24h      int                    `json:"failed_logins_24h"`
	BlockedIPs           int                    `json:"blocked_ips"`
	HighRiskUsers        int                    `json:"high_risk_users"`
	CriticalAlerts       int                    `json:"critical_alerts"`
	TransactionsToday    int                    `json:"transactions_today"`
	FraudDetections      int                    `json:"fraud_detections"`
	SystemHealth         string                 `json:"system_health"`
	LastUpdated          time.Time              `json:"last_updated"`
	DetailedMetrics      map[string]interface{} `json:"detailed_metrics"`
}

type ThreatIntelligence struct {
	IPAddress      string    `json:"ip_address"`
	ThreatType     string    `json:"threat_type"`
	Severity       string    `json:"severity"`
	Description    string    `json:"description"`
	FirstSeen      time.Time `json:"first_seen"`
	LastSeen       time.Time `json:"last_seen"`
	AttackCount    int       `json:"attack_count"`
	CountryCode    string    `json:"country_code"`
	ISP            string    `json:"isp"`
	IsActive       bool      `json:"is_active"`
}

type SecurityDashboardData struct {
	Metrics           *SecurityMetrics      `json:"metrics"`
	RecentAlerts      []SecurityAlert       `json:"recent_alerts"`
	ThreatIntel       []ThreatIntelligence  `json:"threat_intelligence"`
	RiskDistribution  map[string]int        `json:"risk_distribution"`
	GeographicThreats map[string]int        `json:"geographic_threats"`
	TimelineData      []TimelinePoint       `json:"timeline_data"`
}

type TimelinePoint struct {
	Timestamp time.Time `json:"timestamp"`
	Events    int       `json:"events"`
	Severity  string    `json:"severity"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Configure allowed origins for WebSocket connections
		return true // In production, implement proper origin checking
	},
}

func NewSecurityMonitor(db *sql.DB) *SecurityMonitor {
	sm := &SecurityMonitor{
		db:        db,
		clients:   make(map[*websocket.Conn]bool),
		broadcast: make(chan SecurityAlert),
		alertThresholds: map[string]int{
			"failed_logins":     10,
			"blocked_ips":       5,
			"high_risk_users":   20,
			"fraud_detections":  5,
		},
		metrics: &SecurityMetrics{},
	}

	// Start background monitoring
	go sm.monitorSecurityEvents()
	go sm.handleWebSocketBroadcast()
	go sm.updateMetricsPeriodically()

	return sm
}

// WebSocket handler for real-time security monitoring
func (sm *SecurityMonitor) handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	sm.mutex.Lock()
	sm.clients[conn] = true
	sm.mutex.Unlock()

	// Send current metrics to new client
	sm.sendMetricsToClient(conn)

	// Handle client messages (for acknowledgments, etc.)
	for {
		var msg map[string]interface{}
		err := conn.ReadJSON(&msg)
		if err != nil {
			sm.mutex.Lock()
			delete(sm.clients, conn)
			sm.mutex.Unlock()
			break
		}

		// Handle client messages (acknowledge alerts, etc.)
		sm.handleClientMessage(msg, conn)
	}
}

// Security Dashboard API endpoint
func (sm *SecurityMonitor) getDashboardData(c *gin.Context) {
	data := &SecurityDashboardData{
		Metrics:           sm.getSecurityMetrics(),
		RecentAlerts:      sm.getRecentAlerts(50),
		ThreatIntel:       sm.getThreatIntelligence(),
		RiskDistribution:  sm.getRiskDistribution(),
		GeographicThreats: sm.getGeographicThreats(),
		TimelineData:      sm.getTimelineData(24), // Last 24 hours
	}

	c.JSON(http.StatusOK, data)
}

// Get security metrics
func (sm *SecurityMonitor) getSecurityMetrics() *SecurityMetrics {
	metrics := &SecurityMetrics{
		LastUpdated:     time.Now(),
		DetailedMetrics: make(map[string]interface{}),
	}

	// Total users
	sm.db.QueryRow("SELECT COUNT(*) FROM users WHERE is_active = true").Scan(&metrics.TotalUsers)

	// Active sessions
	sm.db.QueryRow("SELECT COUNT(*) FROM secure_sessions WHERE is_active = true AND expires_at > NOW()").Scan(&metrics.ActiveSessions)

	// Failed logins in last 24 hours
	sm.db.QueryRow("SELECT COUNT(*) FROM login_attempts WHERE success = false AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)").Scan(&metrics.FailedLogins24h)

	// Blocked IPs
	sm.db.QueryRow("SELECT COUNT(*) FROM ip_reputation WHERE is_blocked = true").Scan(&metrics.BlockedIPs)

	// High risk users
	sm.db.QueryRow("SELECT COUNT(*) FROM risk_scores WHERE current_score > 70").Scan(&metrics.HighRiskUsers)

	// Critical alerts
	sm.db.QueryRow("SELECT COUNT(*) FROM security_events WHERE severity = 'critical' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)").Scan(&metrics.CriticalAlerts)

	// Transactions today
	sm.db.QueryRow("SELECT COUNT(*) FROM transactions WHERE DATE(created_at) = CURDATE()").Scan(&metrics.TransactionsToday)

	// Fraud detections
	sm.db.QueryRow("SELECT COUNT(*) FROM security_events WHERE event_type LIKE '%fraud%' AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)").Scan(&metrics.FraudDetections)

	// System health calculation
	metrics.SystemHealth = sm.calculateSystemHealth(metrics)

	// Detailed metrics
	metrics.DetailedMetrics = sm.getDetailedMetrics()

	sm.metrics = metrics
	return metrics
}

// Calculate system health score
func (sm *SecurityMonitor) calculateSystemHealth(metrics *SecurityMetrics) string {
	score := 100

	// Deduct points for security issues
	if metrics.FailedLogins24h > 100 {
		score -= 20
	} else if metrics.FailedLogins24h > 50 {
		score -= 10
	}

	if metrics.BlockedIPs > 20 {
		score -= 15
	} else if metrics.BlockedIPs > 10 {
		score -= 8
	}

	if metrics.HighRiskUsers > 50 {
		score -= 25
	} else if metrics.HighRiskUsers > 20 {
		score -= 12
	}

	if metrics.CriticalAlerts > 10 {
		score -= 30
	} else if metrics.CriticalAlerts > 5 {
		score -= 15
	}

	if metrics.FraudDetections > 20 {
		score -= 20
	} else if metrics.FraudDetections > 10 {
		score -= 10
	}

	// Determine health status
	if score >= 90 {
		return "excellent"
	} else if score >= 75 {
		return "good"
	} else if score >= 60 {
		return "fair"
	} else if score >= 40 {
		return "poor"
	} else {
		return "critical"
	}
}

// Get detailed metrics
func (sm *SecurityMonitor) getDetailedMetrics() map[string]interface{} {
	detailed := make(map[string]interface{})

	// Authentication metrics
	authMetrics := make(map[string]interface{})
	sm.db.QueryRow("SELECT COUNT(*) FROM login_attempts WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)").Scan(&authMetrics["total_login_attempts"])
	sm.db.QueryRow("SELECT COUNT(*) FROM login_attempts WHERE success = true AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)").Scan(&authMetrics["successful_logins"])
	sm.db.QueryRow("SELECT COUNT(DISTINCT user_id) FROM two_factor_auth WHERE is_enabled = true").Scan(&authMetrics["users_with_2fa"])
	detailed["authentication"] = authMetrics

	// Transaction metrics
	transactionMetrics := make(map[string]interface{})
	sm.db.QueryRow("SELECT COUNT(*) FROM transactions WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) AND status = 'completed'").Scan(&transactionMetrics["completed_transactions"])
	sm.db.QueryRow("SELECT COUNT(*) FROM transactions WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) AND status = 'failed'").Scan(&transactionMetrics["failed_transactions"])
	sm.db.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE DATE(created_at) = CURDATE() AND status = 'completed'").Scan(&transactionMetrics["total_volume_today"])
	detailed["transactions"] = transactionMetrics

	// Security events by type
	rows, err := sm.db.Query(`
		SELECT event_type, COUNT(*) as count 
		FROM security_events 
		WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) 
		GROUP BY event_type 
		ORDER BY count DESC 
		LIMIT 10
	`)
	if err == nil {
		eventTypes := make(map[string]int)
		for rows.Next() {
			var eventType string
			var count int
			rows.Scan(&eventType, &count)
			eventTypes[eventType] = count
		}
		rows.Close()
		detailed["security_events_by_type"] = eventTypes
	}

	// Geographic distribution of threats
	rows, err = sm.db.Query(`
		SELECT gd.country_code, COUNT(*) as threat_count
		FROM security_events se
		LEFT JOIN geolocation_data gd ON se.ip_address = gd.ip_address
		WHERE se.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
		AND se.severity IN ('high', 'critical')
		AND gd.country_code IS NOT NULL
		GROUP BY gd.country_code
		ORDER BY threat_count DESC
		LIMIT 10
	`)
	if err == nil {
		geoThreats := make(map[string]int)
		for rows.Next() {
			var country string
			var count int
			rows.Scan(&country, &count)
			geoThreats[country] = count
		}
		rows.Close()
		detailed["geographic_threats"] = geoThreats
	}

	return detailed
}

// Get recent security alerts
func (sm *SecurityMonitor) getRecentAlerts(limit int) []SecurityAlert {
	query := `
		SELECT id, event_type, severity, description, user_id, ip_address, location, created_at
		FROM security_events 
		WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
		ORDER BY created_at DESC 
		LIMIT ?
	`

	rows, err := sm.db.Query(query, limit)
	if err != nil {
		log.Printf("Error fetching recent alerts: %v", err)
		return []SecurityAlert{}
	}
	defer rows.Close()

	var alerts []SecurityAlert
	for rows.Next() {
		var alert SecurityAlert
		var userID sql.NullInt64
		var location sql.NullString

		err := rows.Scan(&alert.ID, &alert.Type, &alert.Severity, &alert.Description,
			&userID, &alert.IPAddress, &location, &alert.Timestamp)
		if err != nil {
			continue
		}

		if userID.Valid {
			uid := int(userID.Int64)
			alert.UserID = &uid
		}
		if location.Valid {
			alert.Location = location.String
		}

		alert.Status = "new"
		alert.Title = sm.generateAlertTitle(alert.Type, alert.Severity)
		alerts = append(alerts, alert)
	}

	return alerts
}

// Get threat intelligence data
func (sm *SecurityMonitor) getThreatIntelligence() []ThreatIntelligence {
	query := `
		SELECT ir.ip_address, 'malicious_ip' as threat_type, 
			   CASE WHEN ir.reputation_score < 20 THEN 'critical'
					WHEN ir.reputation_score < 40 THEN 'high'
					WHEN ir.reputation_score < 60 THEN 'medium'
					ELSE 'low' END as severity,
			   ir.block_reason as description,
			   ir.created_at as first_seen,
			   ir.last_seen,
			   COALESCE(attack_counts.count, 0) as attack_count,
			   ir.country_code,
			   gd.isp,
			   ir.is_blocked as is_active
		FROM ip_reputation ir
		LEFT JOIN geolocation_data gd ON ir.ip_address = gd.ip_address
		LEFT JOIN (
			SELECT ip_address, COUNT(*) as count
			FROM security_events
			WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
			GROUP BY ip_address
		) attack_counts ON ir.ip_address = attack_counts.ip_address
		WHERE ir.reputation_score < 70
		ORDER BY ir.reputation_score ASC, attack_counts.count DESC
		LIMIT 50
	`

	rows, err := sm.db.Query(query)
	if err != nil {
		log.Printf("Error fetching threat intelligence: %v", err)
		return []ThreatIntelligence{}
	}
	defer rows.Close()

	var threats []ThreatIntelligence
	for rows.Next() {
		var threat ThreatIntelligence
		var description, countryCode, isp sql.NullString

		err := rows.Scan(&threat.IPAddress, &threat.ThreatType, &threat.Severity,
			&description, &threat.FirstSeen, &threat.LastSeen, &threat.AttackCount,
			&countryCode, &isp, &threat.IsActive)
		if err != nil {
			continue
		}

		if description.Valid {
			threat.Description = description.String
		}
		if countryCode.Valid {
			threat.CountryCode = countryCode.String
		}
		if isp.Valid {
			threat.ISP = isp.String
		}

		threats = append(threats, threat)
	}

	return threats
}

// Get risk distribution
func (sm *SecurityMonitor) getRiskDistribution() map[string]int {
	distribution := make(map[string]int)

	query := `
		SELECT 
			CASE 
				WHEN current_score >= 80 THEN 'critical'
				WHEN current_score >= 60 THEN 'high'
				WHEN current_score >= 40 THEN 'medium'
				ELSE 'low'
			END as risk_level,
			COUNT(*) as count
		FROM risk_scores
		GROUP BY risk_level
	`

	rows, err := sm.db.Query(query)
	if err != nil {
		return distribution
	}
	defer rows.Close()

	for rows.Next() {
		var riskLevel string
		var count int
		rows.Scan(&riskLevel, &count)
		distribution[riskLevel] = count
	}

	return distribution
}

// Get geographic threats
func (sm *SecurityMonitor) getGeographicThreats() map[string]int {
	threats := make(map[string]int)

	query := `
		SELECT gd.country_code, COUNT(*) as threat_count
		FROM security_events se
		LEFT JOIN geolocation_data gd ON se.ip_address = gd.ip_address
		WHERE se.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
		AND se.severity IN ('high', 'critical')
		AND gd.country_code IS NOT NULL
		GROUP BY gd.country_code
		ORDER BY threat_count DESC
		LIMIT 20
	`

	rows, err := sm.db.Query(query)
	if err != nil {
		return threats
	}
	defer rows.Close()

	for rows.Next() {
		var country string
		var count int
		rows.Scan(&country, &count)
		threats[country] = count
	}

	return threats
}

// Get timeline data
func (sm *SecurityMonitor) getTimelineData(hours int) []TimelinePoint {
	query := `
		SELECT 
			DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as hour,
			COUNT(*) as events,
			MAX(CASE 
				WHEN severity = 'critical' THEN 'critical'
				WHEN severity = 'high' THEN 'high'
				WHEN severity = 'medium' THEN 'medium'
				ELSE 'low'
			END) as max_severity
		FROM security_events
		WHERE created_at > DATE_SUB(NOW(), INTERVAL ? HOUR)
		GROUP BY hour
		ORDER BY hour
	`

	rows, err := sm.db.Query(query, hours)
	if err != nil {
		return []TimelinePoint{}
	}
	defer rows.Close()

	var timeline []TimelinePoint
	for rows.Next() {
		var point TimelinePoint
		var hourStr string
		rows.Scan(&hourStr, &point.Events, &point.Severity)
		
		if timestamp, err := time.Parse("2006-01-02 15:04:05", hourStr); err == nil {
			point.Timestamp = timestamp
			timeline = append(timeline, point)
		}
	}

	return timeline
}

// Monitor security events in background
func (sm *SecurityMonitor) monitorSecurityEvents() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			sm.checkForNewAlerts()
		}
	}
}

// Check for new security alerts
func (sm *SecurityMonitor) checkForNewAlerts() {
	// Check for critical events in the last minute
	query := `
		SELECT id, event_type, severity, description, user_id, ip_address, location, created_at
		FROM security_events 
		WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
		AND severity IN ('critical', 'high')
		ORDER BY created_at DESC
	`

	rows, err := sm.db.Query(query)
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var alert SecurityAlert
		var userID sql.NullInt64
		var location sql.NullString

		err := rows.Scan(&alert.ID, &alert.Type, &alert.Severity, &alert.Description,
			&userID, &alert.IPAddress, &location, &alert.Timestamp)
		if err != nil {
			continue
		}

		if userID.Valid {
			uid := int(userID.Int64)
			alert.UserID = &uid
		}
		if location.Valid {
			alert.Location = location.String
		}

		alert.Status = "new"
		alert.Title = sm.generateAlertTitle(alert.Type, alert.Severity)

		// Broadcast alert to connected clients
		select {
		case sm.broadcast <- alert:
		default:
		}
	}
}

// Handle WebSocket broadcast
func (sm *SecurityMonitor) handleWebSocketBroadcast() {
	for {
		alert := <-sm.broadcast
		sm.mutex.RLock()
		for client := range sm.clients {
			err := client.WriteJSON(map[string]interface{}{
				"type": "security_alert",
				"data": alert,
			})
			if err != nil {
				client.Close()
				delete(sm.clients, client)
			}
		}
		sm.mutex.RUnlock()
	}
}

// Update metrics periodically
func (sm *SecurityMonitor) updateMetricsPeriodically() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			metrics := sm.getSecurityMetrics()
			sm.broadcastMetricsUpdate(metrics)
		}
	}
}

// Broadcast metrics update to all clients
func (sm *SecurityMonitor) broadcastMetricsUpdate(metrics *SecurityMetrics) {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()

	for client := range sm.clients {
		err := client.WriteJSON(map[string]interface{}{
			"type": "metrics_update",
			"data": metrics,
		})
		if err != nil {
			client.Close()
			delete(sm.clients, client)
		}
	}
}

// Send current metrics to a specific client
func (sm *SecurityMonitor) sendMetricsToClient(conn *websocket.Conn) {
	metrics := sm.getSecurityMetrics()
	conn.WriteJSON(map[string]interface{}{
		"type": "initial_metrics",
		"data": metrics,
	})
}

// Handle client messages
func (sm *SecurityMonitor) handleClientMessage(msg map[string]interface{}, conn *websocket.Conn) {
	msgType, ok := msg["type"].(string)
	if !ok {
		return
	}

	switch msgType {
	case "acknowledge_alert":
		if alertID, ok := msg["alert_id"].(string); ok {
			sm.acknowledgeAlert(alertID)
		}
	case "resolve_alert":
		if alertID, ok := msg["alert_id"].(string); ok {
			sm.resolveAlert(alertID)
		}
	case "block_ip":
		if ip, ok := msg["ip_address"].(string); ok {
			sm.blockIP(ip, "Manual block from security dashboard")
		}
	case "unblock_ip":
		if ip, ok := msg["ip_address"].(string); ok {
			sm.unblockIP(ip)
		}
	}
}

// Acknowledge alert
func (sm *SecurityMonitor) acknowledgeAlert(alertID string) {
	_, err := sm.db.Exec("UPDATE security_events SET resolved = true WHERE id = ?", alertID)
	if err != nil {
		log.Printf("Error acknowledging alert: %v", err)
	}
}

// Resolve alert
func (sm *SecurityMonitor) resolveAlert(alertID string) {
	_, err := sm.db.Exec("UPDATE security_events SET resolved = true, resolved_at = NOW() WHERE id = ?", alertID)
	if err != nil {
		log.Printf("Error resolving alert: %v", err)
	}
}

// Block IP address
func (sm *SecurityMonitor) blockIP(ip, reason string) {
	_, err := sm.db.Exec(`
		INSERT INTO ip_reputation (ip_address, reputation_score, is_blocked, block_reason, blocked_until)
		VALUES (?, 0, true, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
		ON DUPLICATE KEY UPDATE
			is_blocked = true,
			block_reason = ?,
			blocked_until = DATE_ADD(NOW(), INTERVAL 24 HOUR)
	`, ip, reason, reason)
	
	if err != nil {
		log.Printf("Error blocking IP: %v", err)
	}
}

// Unblock IP address
func (sm *SecurityMonitor) unblockIP(ip string) {
	_, err := sm.db.Exec(`
		UPDATE ip_reputation 
		SET is_blocked = false, blocked_until = NULL, reputation_score = 50
		WHERE ip_address = ?
	`, ip)
	
	if err != nil {
		log.Printf("Error unblocking IP: %v", err)
	}
}

// Generate alert title based on type and severity
func (sm *SecurityMonitor) generateAlertTitle(eventType, severity string) string {
	titles := map[string]map[string]string{
		"failed_login": {
			"critical": "Critical: Multiple Failed Login Attempts",
			"high":     "High: Suspicious Login Activity",
			"medium":   "Medium: Failed Login Detected",
		},
		"fraud_detection": {
			"critical": "Critical: Fraud Detected",
			"high":     "High: Suspicious Transaction",
			"medium":   "Medium: Transaction Flagged",
		},
		"blocked_ip": {
			"critical": "Critical: Malicious IP Blocked",
			"high":     "High: Suspicious IP Activity",
			"medium":   "Medium: IP Address Blocked",
		},
		"high_risk_transaction": {
			"critical": "Critical: High-Risk Transaction",
			"high":     "High: Transaction Requires Review",
			"medium":   "Medium: Transaction Flagged",
		},
	}

	if typeMap, exists := titles[eventType]; exists {
		if title, exists := typeMap[severity]; exists {
			return title
		}
	}

	return fmt.Sprintf("%s: %s Event", severity, eventType)
}

// API endpoints for security management
func (sm *SecurityMonitor) getSecurityEvents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	severity := c.Query("severity")
	eventType := c.Query("type")

	offset := (page - 1) * limit

	query := "SELECT id, event_type, severity, description, user_id, ip_address, location, created_at FROM security_events WHERE 1=1"
	args := []interface{}{}

	if severity != "" {
		query += " AND severity = ?"
		args = append(args, severity)
	}

	if eventType != "" {
		query += " AND event_type = ?"
		args = append(args, eventType)
	}

	query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	rows, err := sm.db.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch security events"})
		return
	}
	defer rows.Close()

	var events []SecurityAlert
	for rows.Next() {
		var event SecurityAlert
		var userID sql.NullInt64
		var location sql.NullString

		err := rows.Scan(&event.ID, &event.Type, &event.Severity, &event.Description,
			&userID, &event.IPAddress, &location, &event.Timestamp)
		if err != nil {
			continue
		}

		if userID.Valid {
			uid := int(userID.Int64)
			event.UserID = &uid
		}
		if location.Valid {
			event.Location = location.String
		}

		event.Title = sm.generateAlertTitle(event.Type, event.Severity)
		events = append(events, event)
	}

	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"page":   page,
		"limit":  limit,
	})
}

// Get user risk profile
func (sm *SecurityMonitor) getUserRiskProfile(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get risk score
	var riskScore RiskScore
	err = sm.db.QueryRow(`
		SELECT user_id, current_score, location_risk, device_risk, behavior_risk, 
			   transaction_risk, last_calculated
		FROM risk_scores WHERE user_id = ?
	`, userID).Scan(&riskScore.UserID, &riskScore.CurrentScore, &riskScore.LocationRisk,
		&riskScore.DeviceRisk, &riskScore.BehaviorRisk, &riskScore.TransactionRisk,
		&riskScore.LastCalculated)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User risk profile not found"})
		return
	}

	// Get recent security events for this user
	events := sm.getUserSecurityEvents(userID, 20)

	// Get user devices
	devices := sm.getUserDevices(userID)

	c.JSON(http.StatusOK, gin.H{
		"risk_score":      riskScore,
		"recent_events":   events,
		"trusted_devices": devices,
	})
}

// Get user security events
func (sm *SecurityMonitor) getUserSecurityEvents(userID, limit int) []SecurityAlert {
	query := `
		SELECT id, event_type, severity, description, ip_address, location, created_at
		FROM security_events 
		WHERE user_id = ?
		ORDER BY created_at DESC 
		LIMIT ?
	`

	rows, err := sm.db.Query(query, userID, limit)
	if err != nil {
		return []SecurityAlert{}
	}
	defer rows.Close()

	var events []SecurityAlert
	for rows.Next() {
		var event SecurityAlert
		var location sql.NullString

		err := rows.Scan(&event.ID, &event.Type, &event.Severity, &event.Description,
			&event.IPAddress, &location, &event.Timestamp)
		if err != nil {
			continue
		}

		if location.Valid {
			event.Location = location.String
		}

		event.UserID = &userID
		event.Title = sm.generateAlertTitle(event.Type, event.Severity)
		events = append(events, event)
	}

	return events
}

// Get user devices
func (sm *SecurityMonitor) getUserDevices(userID int) []DeviceFingerprint {
	query := `
		SELECT id, user_id, device_id, device_info, ip_address, location, 
			   is_trusted, last_seen, created_at
		FROM device_fingerprints 
		WHERE user_id = ?
		ORDER BY last_seen DESC
	`

	rows, err := sm.db.Query(query, userID)
	if err != nil {
		return []DeviceFingerprint{}
	}
	defer rows.Close()

	var devices []DeviceFingerprint
	for rows.Next() {
		var device DeviceFingerprint
		var location sql.NullString

		err := rows.Scan(&device.ID, &device.UserID, &device.DeviceID, &device.DeviceInfo,
			&device.IPAddress, &location, &device.IsTrusted, &device.LastSeen, &device.CreatedAt)
		if err != nil {
			continue
		}

		if location.Valid {
			device.Location = location.String
		}

		devices = append(devices, device)
	}

	return devices
}

// Setup security monitoring routes
func (sm *SecurityMonitor) SetupRoutes(r *gin.Engine, config *Config) {
	// WebSocket endpoint for real-time monitoring
	r.GET("/ws/security", sm.handleWebSocket)

	// API endpoints
	api := r.Group("/api/v1/security")
	api.Use(authMiddleware(config)) // Require authentication

	api.GET("/dashboard", sm.getDashboardData)
	api.GET("/events", sm.getSecurityEvents)
	api.GET("/users/:user_id/risk", sm.getUserRiskProfile)
	api.POST("/alerts/:alert_id/acknowledge", sm.acknowledgeAlertEndpoint)
	api.POST("/alerts/:alert_id/resolve", sm.resolveAlertEndpoint)
	api.POST("/ips/:ip/block", sm.blockIPEndpoint)
	api.DELETE("/ips/:ip/block", sm.unblockIPEndpoint)
}

// API endpoint handlers
func (sm *SecurityMonitor) acknowledgeAlertEndpoint(c *gin.Context) {
	alertID := c.Param("alert_id")
	sm.acknowledgeAlert(alertID)
	c.JSON(http.StatusOK, gin.H{"message": "Alert acknowledged"})
}

func (sm *SecurityMonitor) resolveAlertEndpoint(c *gin.Context) {
	alertID := c.Param("alert_id")
	sm.resolveAlert(alertID)
	c.JSON(http.StatusOK, gin.H{"message": "Alert resolved"})
}

func (sm *SecurityMonitor) blockIPEndpoint(c *gin.Context) {
	ip := c.Param("ip")
	var req struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&req)
	
	if req.Reason == "" {
		req.Reason = "Manual block from API"
	}
	
	sm.blockIP(ip, req.Reason)
	c.JSON(http.StatusOK, gin.H{"message": "IP blocked successfully"})
}

func (sm *SecurityMonitor) unblockIPEndpoint(c *gin.Context) {
	ip := c.Param("ip")
	sm.unblockIP(ip)
	c.JSON(http.StatusOK, gin.H{"message": "IP unblocked successfully"})
}