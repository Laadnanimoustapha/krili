package com.cybersecurity.blockchain;

import com.cybersecurity.model.AttackSignal;
import com.cybersecurity.model.SecurityEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Blockchain-Based Security System
 * =================================
 * 
 * Implements blockchain technology for:
 * - Immutable security event logging
 * - Tamper-proof audit trails
 * - Distributed threat intelligence
 * - Consensus-based threat validation
 * - Cryptographic integrity verification
 * - Decentralized security governance
 */
@Service
public class BlockchainSecurity {

    private static final Logger logger = LoggerFactory.getLogger(BlockchainSecurity.class);

    // Blockchain components
    private final List<SecurityBlock> blockchain = new CopyOnWriteArrayList<>();
    private final Map<String, SecurityTransaction> pendingTransactions = new ConcurrentHashMap<>();
    private final Map<String, SecurityNode> securityNodes = new ConcurrentHashMap<>();
    private final Map<String, SmartContract> smartContracts = new ConcurrentHashMap<>();
    
    // Consensus mechanism
    private final ConsensusEngine consensusEngine = new ConsensusEngine();
    private final CryptographicValidator validator = new CryptographicValidator();
    
    // Mining and validation
    private final SecurityMiner miner = new SecurityMiner();
    private final int DIFFICULTY_TARGET = 4; // Number of leading zeros required
    private final int BLOCK_SIZE_LIMIT = 100; // Max transactions per block

    /**
     * Initialize blockchain security system
     */
    public void initializeBlockchain() {
        logger.info("⛓️ Initializing Blockchain Security System...");
        
        try {
            // Create genesis block
            createGenesisBlock();
            
            // Initialize security nodes
            initializeSecurityNodes();
            
            // Deploy smart contracts
            deploySecuritySmartContracts();
            
            // Start mining process
            startSecurityMining();
            
            logger.info("✅ Blockchain Security System initialized with {} blocks", blockchain.size());
            
        } catch (Exception e) {
            logger.error("❌ Failed to initialize blockchain security", e);
            throw new RuntimeException("Blockchain initialization failed", e);
        }
    }

    /**
     * Add security event to blockchain
     */
    public String addSecurityEventToBlockchain(AttackSignal signal) {
        logger.info("⛓️ Adding security event to blockchain: {}", signal.getSignalId());
        
        try {
            // Create security transaction
            SecurityTransaction transaction = createSecurityTransaction(signal);
            
            // Validate transaction
            if (!validator.validateTransaction(transaction)) {
                logger.error("❌ Invalid security transaction: {}", transaction.getTransactionId());
                return null;
            }
            
            // Add to pending transactions
            pendingTransactions.put(transaction.getTransactionId(), transaction);
            
            // Trigger consensus if enough transactions
            if (pendingTransactions.size() >= BLOCK_SIZE_LIMIT) {
                triggerConsensusAndMining();
            }
            
            logger.info("✅ Security event added to blockchain queue: {}", transaction.getTransactionId());
            return transaction.getTransactionId();
            
        } catch (Exception e) {
            logger.error("❌ Error adding security event to blockchain", e);
            return null;
        }
    }

    /**
     * Verify blockchain integrity
     */
    public BlockchainIntegrityReport verifyBlockchainIntegrity() {
        logger.info("🔍 Verifying blockchain integrity...");
        
        BlockchainIntegrityReport report = new BlockchainIntegrityReport();
        report.setVerificationTime(LocalDateTime.now());
        report.setTotalBlocks(blockchain.size());
        
        try {
            List<String> integrityIssues = new ArrayList<>();
            boolean isValid = true;
            
            // Verify each block
            for (int i = 1; i < blockchain.size(); i++) {
                SecurityBlock currentBlock = blockchain.get(i);
                SecurityBlock previousBlock = blockchain.get(i - 1);
                
                // Verify hash chain
                if (!currentBlock.getPreviousHash().equals(previousBlock.getHash())) {
                    isValid = false;
                    integrityIssues.add("Hash chain broken at block " + i);
                }
                
                // Verify block hash
                String calculatedHash = calculateBlockHash(currentBlock);
                if (!currentBlock.getHash().equals(calculatedHash)) {
                    isValid = false;
                    integrityIssues.add("Invalid hash at block " + i);
                }
                
                // Verify proof of work
                if (!isValidProofOfWork(currentBlock.getHash(), DIFFICULTY_TARGET)) {
                    isValid = false;
                    integrityIssues.add("Invalid proof of work at block " + i);
                }
                
                // Verify transactions
                for (SecurityTransaction tx : currentBlock.getTransactions()) {
                    if (!validator.validateTransaction(tx)) {
                        isValid = false;
                        integrityIssues.add("Invalid transaction " + tx.getTransactionId() + " in block " + i);
                    }
                }
            }
            
            report.setIsValid(isValid);
            report.setIntegrityIssues(integrityIssues);
            report.setValidatedBlocks(blockchain.size());
            
            if (isValid) {
                logger.info("✅ Blockchain integrity verified - All {} blocks valid", blockchain.size());
            } else {
                logger.error("❌ Blockchain integrity compromised - {} issues found", integrityIssues.size());
            }
            
        } catch (Exception e) {
            logger.error("❌ Error verifying blockchain integrity", e);
            report.setIsValid(false);
            report.getIntegrityIssues().add("Verification error: " + e.getMessage());
        }
        
        return report;
    }

    /**
     * Query security events from blockchain
     */
    public List<SecurityTransaction> querySecurityEvents(SecurityEventQuery query) {
        logger.info("🔍 Querying security events from blockchain...");
        
        List<SecurityTransaction> results = new ArrayList<>();
        
        try {
            for (SecurityBlock block : blockchain) {
                for (SecurityTransaction tx : block.getTransactions()) {
                    if (matchesQuery(tx, query)) {
                        results.add(tx);
                    }
                }
            }
            
            // Sort by timestamp
            results.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
            
            logger.info("🔍 Found {} matching security events", results.size());
            
        } catch (Exception e) {
            logger.error("❌ Error querying security events", e);
        }
        
        return results;
    }

    /**
     * Execute smart contract for automated security response
     */
    public SmartContractResult executeSecuritySmartContract(String contractName, Map<String, Object> parameters) {
        logger.info("📜 Executing security smart contract: {}", contractName);
        
        try {
            SmartContract contract = smartContracts.get(contractName);
            if (contract == null) {
                logger.error("❌ Smart contract not found: {}", contractName);
                return SmartContractResult.error("Contract not found");
            }
            
            // Execute contract
            SmartContractResult result = contract.execute(parameters);
            
            // Log execution to blockchain
            if (result.isSuccess()) {
                SecurityTransaction contractTx = createContractExecutionTransaction(contractName, parameters, result);
                pendingTransactions.put(contractTx.getTransactionId(), contractTx);
            }
            
            logger.info("📜 Smart contract executed: {} - Success: {}", contractName, result.isSuccess());
            return result;
            
        } catch (Exception e) {
            logger.error("❌ Error executing smart contract", e);
            return SmartContractResult.error("Execution error: " + e.getMessage());
        }
    }

    /**
     * Get blockchain statistics
     */
    public BlockchainStats getBlockchainStats() {
        BlockchainStats stats = new BlockchainStats();
        
        stats.setTotalBlocks(blockchain.size());
        stats.setPendingTransactions(pendingTransactions.size());
        stats.setActiveNodes(securityNodes.size());
        stats.setSmartContracts(smartContracts.size());
        
        // Calculate total transactions
        int totalTransactions = blockchain.stream()
            .mapToInt(block -> block.getTransactions().size())
            .sum();
        stats.setTotalTransactions(totalTransactions);
        
        // Calculate blockchain size
        long blockchainSize = blockchain.stream()
            .mapToLong(block -> block.calculateSize())
            .sum();
        stats.setBlockchainSizeBytes(blockchainSize);
        
        // Get latest block info
        if (!blockchain.isEmpty()) {
            SecurityBlock latestBlock = blockchain.get(blockchain.size() - 1);
            stats.setLatestBlockHash(latestBlock.getHash());
            stats.setLatestBlockTime(latestBlock.getTimestamp());
        }
        
        return stats;
    }

    // Private implementation methods

    private void createGenesisBlock() {
        logger.info("🏗️ Creating genesis block...");
        
        SecurityBlock genesisBlock = new SecurityBlock();
        genesisBlock.setIndex(0);
        genesisBlock.setTimestamp(LocalDateTime.now());
        genesisBlock.setPreviousHash("0");
        genesisBlock.setTransactions(new ArrayList<>());
        genesisBlock.setNonce(0);
        
        // Add genesis transaction
        SecurityTransaction genesisTx = new SecurityTransaction();
        genesisTx.setTransactionId("GENESIS_TX");
        genesisTx.setTransactionType("GENESIS");
        genesisTx.setTimestamp(LocalDateTime.now());
        genesisTx.setData("Blockchain Security System Genesis Block");
        genesisTx.setSignature(validator.signData("GENESIS"));
        
        genesisBlock.getTransactions().add(genesisTx);
        
        // Calculate hash
        genesisBlock.setHash(calculateBlockHash(genesisBlock));
        
        blockchain.add(genesisBlock);
        logger.info("✅ Genesis block created with hash: {}", genesisBlock.getHash());
    }

    private void initializeSecurityNodes() {
        logger.info("🌐 Initializing security nodes...");
        
        // Create primary security node
        SecurityNode primaryNode = new SecurityNode("PRIMARY_NODE", "localhost", 8080);
        primaryNode.setNodeType(SecurityNodeType.VALIDATOR);
        primaryNode.setStake(1000);
        securityNodes.put(primaryNode.getNodeId(), primaryNode);
        
        // Create backup nodes
        for (int i = 1; i <= 3; i++) {
            SecurityNode backupNode = new SecurityNode("BACKUP_NODE_" + i, "backup" + i + ".local", 8080 + i);
            backupNode.setNodeType(SecurityNodeType.BACKUP);
            backupNode.setStake(500);
            securityNodes.put(backupNode.getNodeId(), backupNode);
        }
        
        logger.info("✅ Initialized {} security nodes", securityNodes.size());
    }

    private void deploySecuritySmartContracts() {
        logger.info("📜 Deploying security smart contracts...");
        
        // Auto-response contract
        SmartContract autoResponseContract = new AutoResponseSmartContract();
        smartContracts.put("AUTO_RESPONSE", autoResponseContract);
        
        // Threat validation contract
        SmartContract threatValidationContract = new ThreatValidationSmartContract();
        smartContracts.put("THREAT_VALIDATION", threatValidationContract);
        
        // Emergency shutdown contract
        SmartContract emergencyShutdownContract = new EmergencyShutdownSmartContract();
        smartContracts.put("EMERGENCY_SHUTDOWN", emergencyShutdownContract);
        
        // Reputation management contract
        SmartContract reputationContract = new ReputationManagementSmartContract();
        smartContracts.put("REPUTATION_MANAGEMENT", reputationContract);
        
        logger.info("✅ Deployed {} smart contracts", smartContracts.size());
    }

    private void startSecurityMining() {
        logger.info("⛏️ Starting security mining process...");
        
        Thread miningThread = new Thread(() -> {
            while (true) {
                try {
                    if (pendingTransactions.size() >= 5) { // Mine when we have enough transactions
                        mineNewBlock();
                    }
                    Thread.sleep(10000); // Check every 10 seconds
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    logger.error("❌ Error in mining process", e);
                }
            }
        });
        
        miningThread.setDaemon(true);
        miningThread.start();
        
        logger.info("✅ Security mining process started");
    }

    private SecurityTransaction createSecurityTransaction(AttackSignal signal) {
        SecurityTransaction transaction = new SecurityTransaction();
        transaction.setTransactionId(UUID.randomUUID().toString());
        transaction.setTransactionType("SECURITY_EVENT");
        transaction.setTimestamp(LocalDateTime.now());
        
        // Create transaction data
        Map<String, Object> txData = new HashMap<>();
        txData.put("signalId", signal.getSignalId());
        txData.put("attackType", signal.getAttackType());
        txData.put("severity", signal.getSeverity());
        txData.put("sourceIp", signal.getSourceIp());
        txData.put("description", signal.getDescription());
        txData.put("timestamp", signal.getTimestamp());
        
        transaction.setData(txData.toString());
        transaction.setSignature(validator.signData(transaction.getData()));
        
        return transaction;
    }

    private SecurityTransaction createContractExecutionTransaction(String contractName, 
            Map<String, Object> parameters, SmartContractResult result) {
        SecurityTransaction transaction = new SecurityTransaction();
        transaction.setTransactionId(UUID.randomUUID().toString());
        transaction.setTransactionType("SMART_CONTRACT_EXECUTION");
        transaction.setTimestamp(LocalDateTime.now());
        
        Map<String, Object> txData = new HashMap<>();
        txData.put("contractName", contractName);
        txData.put("parameters", parameters);
        txData.put("result", result.getResult());
        txData.put("success", result.isSuccess());
        
        transaction.setData(txData.toString());
        transaction.setSignature(validator.signData(transaction.getData()));
        
        return transaction;
    }

    private void triggerConsensusAndMining() {
        logger.info("🤝 Triggering consensus and mining...");
        
        try {
            // Get consensus from nodes
            boolean consensus = consensusEngine.achieveConsensus(new ArrayList<>(pendingTransactions.values()));
            
            if (consensus) {
                mineNewBlock();
            } else {
                logger.warn("⚠️ Consensus not achieved, discarding invalid transactions");
                // Remove invalid transactions
                pendingTransactions.clear();
            }
            
        } catch (Exception e) {
            logger.error("❌ Error in consensus and mining", e);
        }
    }

    private void mineNewBlock() {
        logger.info("⛏️ Mining new security block...");
        
        try {
            SecurityBlock newBlock = new SecurityBlock();
            newBlock.setIndex(blockchain.size());
            newBlock.setTimestamp(LocalDateTime.now());
            newBlock.setPreviousHash(blockchain.get(blockchain.size() - 1).getHash());
            newBlock.setTransactions(new ArrayList<>(pendingTransactions.values()));
            
            // Mine the block (find valid nonce)
            long startTime = System.currentTimeMillis();
            newBlock = miner.mineBlock(newBlock, DIFFICULTY_TARGET);
            long miningTime = System.currentTimeMillis() - startTime;
            
            // Add to blockchain
            blockchain.add(newBlock);
            
            // Clear pending transactions
            pendingTransactions.clear();
            
            logger.info("✅ New block mined in {}ms - Hash: {}", miningTime, newBlock.getHash());
            
        } catch (Exception e) {
            logger.error("❌ Error mining new block", e);
        }
    }

    private String calculateBlockHash(SecurityBlock block) {
        try {
            String blockData = block.getIndex() + 
                             block.getTimestamp().toString() + 
                             block.getPreviousHash() + 
                             block.getTransactions().toString() + 
                             block.getNonce();
            
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(blockData.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
            
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private boolean isValidProofOfWork(String hash, int difficulty) {
        String target = "0".repeat(difficulty);
        return hash.startsWith(target);
    }

    private boolean matchesQuery(SecurityTransaction tx, SecurityEventQuery query) {
        // Implement query matching logic
        if (query.getAttackType() != null && !tx.getData().contains(query.getAttackType())) {
            return false;
        }
        
        if (query.getSourceIp() != null && !tx.getData().contains(query.getSourceIp())) {
            return false;
        }
        
        if (query.getStartTime() != null && tx.getTimestamp().isBefore(query.getStartTime())) {
            return false;
        }
        
        if (query.getEndTime() != null && tx.getTimestamp().isAfter(query.getEndTime())) {
            return false;
        }
        
        return true;
    }

    // Inner classes and data structures

    public static class SecurityBlock {
        private int index;
        private LocalDateTime timestamp;
        private String previousHash;
        private List<SecurityTransaction> transactions;
        private long nonce;
        private String hash;

        // Getters and setters
        public int getIndex() { return index; }
        public void setIndex(int index) { this.index = index; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public String getPreviousHash() { return previousHash; }
        public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }
        
        public List<SecurityTransaction> getTransactions() { return transactions; }
        public void setTransactions(List<SecurityTransaction> transactions) { this.transactions = transactions; }
        
        public long getNonce() { return nonce; }
        public void setNonce(long nonce) { this.nonce = nonce; }
        
        public String getHash() { return hash; }
        public void setHash(String hash) { this.hash = hash; }
        
        public long calculateSize() {
            return toString().getBytes(StandardCharsets.UTF_8).length;
        }
    }

    public static class SecurityTransaction {
        private String transactionId;
        private String transactionType;
        private LocalDateTime timestamp;
        private String data;
        private String signature;

        // Getters and setters
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        
        public String getTransactionType() { return transactionType; }
        public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public String getData() { return data; }
        public void setData(String data) { this.data = data; }
        
        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
    }

    public static class SecurityNode {
        private String nodeId;
        private String address;
        private int port;
        private SecurityNodeType nodeType;
        private int stake;
        private boolean isActive = true;

        public SecurityNode(String nodeId, String address, int port) {
            this.nodeId = nodeId;
            this.address = address;
            this.port = port;
        }

        // Getters and setters
        public String getNodeId() { return nodeId; }
        public String getAddress() { return address; }
        public int getPort() { return port; }
        public SecurityNodeType getNodeType() { return nodeType; }
        public void setNodeType(SecurityNodeType nodeType) { this.nodeType = nodeType; }
        public int getStake() { return stake; }
        public void setStake(int stake) { this.stake = stake; }
        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
    }

    public enum SecurityNodeType {
        VALIDATOR, BACKUP, OBSERVER
    }

    // Additional classes for blockchain functionality...
    private static class ConsensusEngine {
        public boolean achieveConsensus(List<SecurityTransaction> transactions) {
            // Implement consensus algorithm (simplified)
            return true; // For demo purposes
        }
    }

    private static class CryptographicValidator {
        public boolean validateTransaction(SecurityTransaction transaction) {
            // Implement transaction validation
            return transaction.getTransactionId() != null && 
                   transaction.getData() != null && 
                   transaction.getSignature() != null;
        }

        public String signData(String data) {
            // Implement digital signature
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
                return Base64.getEncoder().encodeToString(hash);
            } catch (NoSuchAlgorithmException e) {
                return "SIGNATURE_ERROR";
            }
        }
    }

    private static class SecurityMiner {
        public SecurityBlock mineBlock(SecurityBlock block, int difficulty) {
            String target = "0".repeat(difficulty);
            long nonce = 0;
            String hash;
            
            do {
                nonce++;
                block.setNonce(nonce);
                hash = calculateHash(block);
            } while (!hash.startsWith(target));
            
            block.setHash(hash);
            return block;
        }

        private String calculateHash(SecurityBlock block) {
            try {
                String blockData = block.getIndex() + 
                                 block.getTimestamp().toString() + 
                                 block.getPreviousHash() + 
                                 block.getTransactions().toString() + 
                                 block.getNonce();
                
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(blockData.getBytes(StandardCharsets.UTF_8));
                
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) {
                        hexString.append('0');
                    }
                    hexString.append(hex);
                }
                
                return hexString.toString();
                
            } catch (NoSuchAlgorithmException e) {
                throw new RuntimeException("SHA-256 algorithm not available", e);
            }
        }
    }

    // Smart Contract implementations
    private abstract static class SmartContract {
        public abstract SmartContractResult execute(Map<String, Object> parameters);
    }

    private static class AutoResponseSmartContract extends SmartContract {
        @Override
        public SmartContractResult execute(Map<String, Object> parameters) {
            // Implement auto-response logic
            return SmartContractResult.success("Auto-response executed");
        }
    }

    private static class ThreatValidationSmartContract extends SmartContract {
        @Override
        public SmartContractResult execute(Map<String, Object> parameters) {
            // Implement threat validation logic
            return SmartContractResult.success("Threat validated");
        }
    }

    private static class EmergencyShutdownSmartContract extends SmartContract {
        @Override
        public SmartContractResult execute(Map<String, Object> parameters) {
            // Implement emergency shutdown logic
            return SmartContractResult.success("Emergency shutdown initiated");
        }
    }

    private static class ReputationManagementSmartContract extends SmartContract {
        @Override
        public SmartContractResult execute(Map<String, Object> parameters) {
            // Implement reputation management logic
            return SmartContractResult.success("Reputation updated");
        }
    }

    public static class SmartContractResult {
        private boolean success;
        private String result;
        private String error;

        public static SmartContractResult success(String result) {
            SmartContractResult scr = new SmartContractResult();
            scr.success = true;
            scr.result = result;
            return scr;
        }

        public static SmartContractResult error(String error) {
            SmartContractResult scr = new SmartContractResult();
            scr.success = false;
            scr.error = error;
            return scr;
        }

        public boolean isSuccess() { return success; }
        public String getResult() { return result; }
        public String getError() { return error; }
    }

    // Query and reporting classes
    public static class SecurityEventQuery {
        private String attackType;
        private String sourceIp;
        private LocalDateTime startTime;
        private LocalDateTime endTime;

        // Getters and setters
        public String getAttackType() { return attackType; }
        public void setAttackType(String attackType) { this.attackType = attackType; }
        
        public String getSourceIp() { return sourceIp; }
        public void setSourceIp(String sourceIp) { this.sourceIp = sourceIp; }
        
        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
        
        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    }

    public static class BlockchainIntegrityReport {
        private LocalDateTime verificationTime;
        private int totalBlocks;
        private int validatedBlocks;
        private boolean isValid;
        private List<String> integrityIssues = new ArrayList<>();

        // Getters and setters
        public LocalDateTime getVerificationTime() { return verificationTime; }
        public void setVerificationTime(LocalDateTime verificationTime) { this.verificationTime = verificationTime; }
        
        public int getTotalBlocks() { return totalBlocks; }
        public void setTotalBlocks(int totalBlocks) { this.totalBlocks = totalBlocks; }
        
        public int getValidatedBlocks() { return validatedBlocks; }
        public void setValidatedBlocks(int validatedBlocks) { this.validatedBlocks = validatedBlocks; }
        
        public boolean isValid() { return isValid; }
        public void setIsValid(boolean valid) { isValid = valid; }
        
        public List<String> getIntegrityIssues() { return integrityIssues; }
        public void setIntegrityIssues(List<String> integrityIssues) { this.integrityIssues = integrityIssues; }
    }

    public static class BlockchainStats {
        private int totalBlocks;
        private int totalTransactions;
        private int pendingTransactions;
        private int activeNodes;
        private int smartContracts;
        private long blockchainSizeBytes;
        private String latestBlockHash;
        private LocalDateTime latestBlockTime;

        // Getters and setters
        public int getTotalBlocks() { return totalBlocks; }
        public void setTotalBlocks(int totalBlocks) { this.totalBlocks = totalBlocks; }
        
        public int getTotalTransactions() { return totalTransactions; }
        public void setTotalTransactions(int totalTransactions) { this.totalTransactions = totalTransactions; }
        
        public int getPendingTransactions() { return pendingTransactions; }
        public void setPendingTransactions(int pendingTransactions) { this.pendingTransactions = pendingTransactions; }
        
        public int getActiveNodes() { return activeNodes; }
        public void setActiveNodes(int activeNodes) { this.activeNodes = activeNodes; }
        
        public int getSmartContracts() { return smartContracts; }
        public void setSmartContracts(int smartContracts) { this.smartContracts = smartContracts; }
        
        public long getBlockchainSizeBytes() { return blockchainSizeBytes; }
        public void setBlockchainSizeBytes(long blockchainSizeBytes) { this.blockchainSizeBytes = blockchainSizeBytes; }
        
        public String getLatestBlockHash() { return latestBlockHash; }
        public void setLatestBlockHash(String latestBlockHash) { this.latestBlockHash = latestBlockHash; }
        
        public LocalDateTime getLatestBlockTime() { return latestBlockTime; }
        public void setLatestBlockTime(LocalDateTime latestBlockTime) { this.latestBlockTime = latestBlockTime; }
    }
}