// predictive.js - Premium Predictive Intervention Engine
class PredictiveEngine {
    constructor() {
        this.userHistory = [];
        this.patterns = {};
        this.predictionThreshold = 0.7; // 70% confidence
    }
    
    async initialize() {
        // Load user history
        const history = STORAGE.getSessionHistory('all');
        this.userHistory = history.filter(s => s.feedback); // Only sessions with feedback
        
        if (this.userHistory.length < 5) {
            console.log('Need more data for predictions');
            return false;
        }
        
        this.analyzePatterns();
        return true;
    }
    
    analyzePatterns() {
        // 1. Time-based patterns
        this.patterns.timeBased = this.analyzeTimePatterns();
        
        // 2. State transition patterns
        this.patterns.stateTransitions = this.analyzeStateTransitions();
        
        // 3. Effectiveness patterns
        this.patterns.effectiveness = this.analyzeEffectivenessPatterns();
        
        console.log('Predictive patterns analyzed:', this.patterns);
    }
    
    analyzeTimePatterns() {
        const patterns = {
            byHour: {},
            byDay: {},
            bySessionCount: {}
        };
        
        // Group by hour
        this.userHistory.forEach(session => {
            const hour = new Date(session.timestamp).getHours();
            const timeSlot = this.getTimeSlot(hour);
            
            if (!patterns.byHour[timeSlot]) {
                patterns.byHour[timeSlot] = { total: 0, stressed: 0 };
            }
            
            patterns.byHour[timeSlot].total++;
            if (session.feedback === 'no' || session.state === 'CognitiveOverdrive') {
                patterns.byHour[timeSlot].stressed++;
            }
        });
        
        // Calculate stress probability per time slot
        for (const [timeSlot, data] of Object.entries(patterns.byHour)) {
            patterns.byHour[timeSlot].probability = data.stressed / data.total;
        }
        
        return patterns;
    }
    
    getTimeSlot(hour) {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
    }
    
    analyzeStateTransitions() {
        const transitions = {};
        
        for (let i = 0; i < this.userHistory.length - 1; i++) {
            const fromState = this.userHistory[i].state;
            const toState = this.userHistory[i + 1].state;
            
            if (!transitions[fromState]) {
                transitions[fromState] = {};
            }
            
            if (!transitions[fromState][toState]) {
                transitions[fromState][toState] = 0;
            }
            
            transitions[fromState][toState]++;
        }
        
        return transitions;
    }
    
    analyzeEffectivenessPatterns() {
        const patterns = {
            byState: {},
            byIntervention: {},
            byDuration: {}
        };
        
        this.userHistory.forEach(session => {
            if (session.state) {
                if (!patterns.byState[session.state]) {
                    patterns.byState[session.state] = { success: 0, total: 0 };
                }
                patterns.byState[session.state].total++;
                if (session.feedback === 'yes') {
                    patterns.byState[session.state].success++;
                }
            }
        });
        
        // Calculate success rates
        for (const [state, data] of Object.entries(patterns.byState)) {
            patterns.byState[state].rate = data.success / data.total;
        }
        
        return patterns;
    }
    
    // Predict next likely state
    predictNextState(currentState = null) {
        if (!currentState && this.userHistory.length > 0) {
            currentState = this.userHistory[this.userHistory.length - 1].state;
        }
        
        if (!currentState || !this.patterns.stateTransitions[currentState]) {
            return this.predictByTime();
        }
        
        // Find most likely next state based on transitions
        const possibleTransitions = this.patterns.stateTransitions[currentState];
        let mostLikelyState = null;
        let highestCount = 0;
        
        for (const [nextState, count] of Object.entries(possibleTransitions)) {
            if (count > highestCount) {
                highestCount = count;
                mostLikelyState = nextState;
            }
        }
        
        if (mostLikelyState && highestCount >= 2) {
            return {
                state: mostLikelyState,
                confidence: Math.min(highestCount / 3, 1), // Normalize confidence
                reason: `Based on your transition patterns from ${getStateDisplayName(currentState)}`
            };
        }
        
        return this.predictByTime();
    }
    
    predictByTime() {
        const currentHour = new Date().getHours();
        const timeSlot = this.getTimeSlot(currentHour);
        
        if (this.patterns.timeBased?.byHour[timeSlot]) {
            const timeData = this.patterns.timeBased.byHour[timeSlot];
            
            if (timeData.probability >= 0.5) {
                // User tends to be stressed at this time
                const likelyStates = this.getStressProneStates();
                if (likelyStates.length > 0) {
                    return {
                        state: likelyStates[0],
                        confidence: timeData.probability,
                        reason: `Based on your ${timeSlot} stress patterns`
                    };
                }
            }
        }
        
        return null;
    }
    
    getStressProneStates() {
        const states = [];
        
        if (this.patterns.effectiveness?.byState) {
            for (const [state, data] of Object.entries(this.patterns.effectiveness.byState)) {
                if (data.rate < 0.5) { // Less than 50% success rate
                    states.push(state);
                }
            }
        }
        
        return states.slice(0, 3); // Return top 3 stress-prone states
    }
    
    // Check if we should suggest an intervention now
    shouldSuggestIntervention() {
        const lastSession = this.userHistory[this.userHistory.length - 1];
        if (!lastSession) return false;
        
        const lastSessionTime = new Date(lastSession.timestamp);
        const hoursSinceLast = (Date.now() - lastSessionTime) / (1000 * 60 * 60);
        
        // Don't suggest if had a session in last hour
        if (hoursSinceLast < 1) return false;
        
        // Check time-based patterns
        const currentHour = new Date().getHours();
        const timeSlot = this.getTimeSlot(currentHour);
        
        if (this.patterns.timeBased?.byHour[timeSlot]) {
            const timeData = this.patterns.timeBased.byHour[timeSlot];
            if (timeData.probability >= this.predictionThreshold) {
                return true;
            }
        }
        
        // Check if we're approaching a predicted stress time
        const prediction = this.predictNextState();
        return prediction && prediction.confidence >= this.predictionThreshold;
    }
    
    // Get predictive insight for display
    getPredictiveInsight() {
        if (this.userHistory.length < 10) {
            return {
                available: false,
                message: "Complete 10+ sessions to unlock predictive insights"
            };
        }
        
        const prediction = this.predictNextState();
        if (!prediction) {
            return {
                available: false,
                message: "Continue using LIMEN Pro to build predictive models"
            };
        }
        
        const stateName = getStateDisplayName(prediction.state);
        const confidencePercent = Math.round(prediction.confidence * 100);
        
        return {
            available: true,
            state: prediction.state,
            stateName: stateName,
            confidence: prediction.confidence,
            reason: prediction.reason,
            message: `You may experience ${stateName.toLowerCase()} soon (${confidencePercent}% confidence). ${prediction.reason}.`,
            suggestion: `Consider a preemptive intervention to maintain baseline.`
        };
    }
}

// Initialize predictive engine
let predictiveEngine = null;

async function initPredictiveEngine() {
    if (!window.STORAGE) {
        console.log('Storage not available for predictive engine');
        return null;
    }
    
    predictiveEngine = new PredictiveEngine();
    const initialized = await predictiveEngine.initialize();
    
    if (initialized) {
        console.log('Predictive engine initialized successfully');
        // Start periodic checks
        startPredictiveChecks();
    }
    
    return predictiveEngine;
}

function startPredictiveChecks() {
    // Check every 30 minutes if we should suggest intervention
    setInterval(() => {
        if (predictiveEngine && predictiveEngine.shouldSuggestIntervention()) {
            showPredictiveSuggestion();
        }
    }, 30 * 60 * 1000); // 30 minutes
}

function showPredictiveSuggestion() {
    // Don't show if app is active
    if (!document.hidden) return;
    
    const insight = predictiveEngine.getPredictiveInsight();
    if (!insight.available) return;
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('LIMEN Pro Predictive', {
            body: `${insight.message} ${insight.suggestion}`,
            icon: 'icon-192.png',
            silent: true,
            tag: 'predictive-suggestion'
        });
    }
    
    // Store that we showed this suggestion
    const suggestion = {
        type: 'predictive_suggestion',
        timestamp: new Date().toISOString(),
        predictedState: insight.state,
        confidence: insight.confidence,
        shown: true
    };
    
    STORAGE.addSession(suggestion);
}

// Export for use in app
window.predictiveEngine = predictiveEngine;
window.initPredictiveEngine = initPredictiveEngine;
window.showPredictiveSuggestion = showPredictiveSuggestion;
