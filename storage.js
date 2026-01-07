// Local Storage Management - INTELLIGENT VERSION
const STORAGE = {
    KEY: 'limen_pro_intelligent_v2',
    VERSION: '2.0.0',
    
    // Initialize storage with intelligence tracking
    init() {
        let data = this.getData();
        if (!data || data.version !== this.VERSION) {
            // Initialize with comprehensive intelligence tracking
            data = {
                version: this.VERSION,
                sessionHistory: [],
                userProfile: {
                    joined: new Date().toISOString(),
                    notificationEnabled: false,
                    lastStateSelection: null,
                    lastSelectedState: null,
                    lastSummaryShown: null,
                    totalSessions: 0,
                    totalReturnToBaseline: 0,
                    totalPartialSuccess: 0,
                    totalNoSuccess: 0,
                    psychologicalPatterns: [],
                    currentStreak: 0,
                    bestStreak: 0,
                    preferences: {
                        ambientAudio: false
                    },
                    // Intelligence tracking
                    learnedEffectiveness: {}, // State -> intervention effectiveness
                    timePatterns: {},
                    adaptationLevel: 1, // 1-5 scale, increases with mastery
                    personalizedTips: [],
                    interventionHistory: [], // Track which interventions were tried when
                    predictiveInsights: [] // Store predictive insights
                },
                appStats: {
                    totalSessions: 0,
                    totalTime: 0,
                    totalReturnToBaseline: 0,
                    totalPartialSuccess: 0,
                    totalNoSuccess: 0,
                    firstUse: new Date().toISOString(),
                    lastUse: null,
                    avgEffectiveness: 0,
                    improvementRate: 0
                },
                weeklyStats: {
                    currentWeekStart: this.getWeekStartDate(),
                    sessionsThisWeek: 0,
                    returnToBaselineThisWeek: 0,
                    partialSuccessThisWeek: 0,
                    noSuccessThisWeek: 0
                },
                // Intelligence data
                intelligence: {
                    stateEffectiveness: {}, // State -> {intervention: {success: X, total: Y}}
                    timeEffectiveness: {}, // Hour -> effectiveness
                    interventionSuccessRates: {},
                    userPatterns: {
                        dominantStates: [],
                        bestTimes: [],
                        worstTimes: [],
                        mostEffectiveInterventions: [],
                        leastEffectiveInterventions: []
                    },
                    learningLog: [],
                    predictiveData: {
                        timePatterns: {},
                        stateTransitions: {},
                        effectivenessByHour: {}
                    }
                },
                patternInsights: [],
                premiumFeatures: {
                    predictiveEnabled: true,
                    advancedAnalytics: true,
                    personalizedSequences: false, // Will be enabled later
                    dataExport: false // Will be enabled later
                }
            };
            this.setData(data);
        }
        
        // Update week tracking if needed
        this.updateWeekTracking();
        return data;
    },

    // Get week start date (Monday)
    getWeekStartDate() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday.toISOString();
    },

    // Check and update week tracking
    updateWeekTracking() {
        const data = this.getData();
        if (!data) return;
        
        const currentWeekStart = this.getWeekStartDate();
        const storedWeekStart = data.weeklyStats.currentWeekStart;
        
        if (storedWeekStart !== currentWeekStart) {
            // New week, reset weekly stats but preserve intelligence
            data.weeklyStats = {
                currentWeekStart: currentWeekStart,
                sessionsThisWeek: 0,
                returnToBaselineThisWeek: 0,
                partialSuccessThisWeek: 0,
                noSuccessThisWeek: 0
            };
            this.setData(data);
        }
    },

    // Get all data
    getData() {
        try {
            const data = localStorage.getItem(this.KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading storage:', error);
            return null;
        }
    },

    // Save all data
    setData(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving storage:', error);
            return false;
        }
    },

    // Add a new session with intelligence tracking
    addSession(session) {
        const data = this.getData();
        if (!data) return null;
        
        session.id = Date.now() + Math.random().toString(36).substr(2, 9);
        session.timestamp = new Date().toISOString();
        session.week = this.getWeekStartDate();
        session.hour = new Date().getHours();
        
        data.sessionHistory.push(session);
        
        // Update all stats
        data.appStats.totalSessions++;
        data.appStats.totalTime += (session.duration || 0);
        data.appStats.lastUse = session.timestamp;
        data.userProfile.totalSessions++;
        
        // Update weekly stats
        data.weeklyStats.sessionsThisWeek++;
        
        // Track all feedback types for intelligence
        if (session.feedback === 'yes') {
            data.appStats.totalReturnToBaseline++;
            data.userProfile.totalReturnToBaseline++;
            data.weeklyStats.returnToBaselineThisWeek++;
            this.updateStreak(data, true);
        } else if (session.feedback === 'little') {
            data.appStats.totalPartialSuccess++;
            data.userProfile.totalPartialSuccess++;
            data.weeklyStats.partialSuccessThisWeek++;
            this.updateStreak(data, false);
        } else if (session.feedback === 'no') {
            data.appStats.totalNoSuccess++;
            data.userProfile.totalNoSuccess++;
            data.weeklyStats.noSuccessThisWeek++;
            this.updateStreak(data, false);
        }
        
        // Update intelligence data for ALL sessions (not just successful ones)
        this.updateIntelligence(data, session);
        
        // Update predictive data
        this.updatePredictiveData(data);
        
        // Generate personalized insight
        this.generatePersonalizedInsight(data, session);
        
        // Update adaptation level based on performance
        this.updateAdaptationLevel(data);
        
        // Keep only last 1000 sessions (more data for better intelligence)
        if (data.sessionHistory.length > 1000) {
            data.sessionHistory = data.sessionHistory.slice(-1000);
        }
        
        this.setData(data);
        return session;
    },

    // Update intelligence based on session
    updateIntelligence(data, session) {
        if (!session.state || !session.feedback) return;
        
        const state = session.state;
        const hour = session.hour;
        const feedback = session.feedback;
        const intervention = session.intervention || 'default';
        
        // Initialize state effectiveness tracking
        if (!data.intelligence.stateEffectiveness[state]) {
            data.intelligence.stateEffectiveness[state] = {};
        }
        
        if (!data.intelligence.stateEffectiveness[state][intervention]) {
            data.intelligence.stateEffectiveness[state][intervention] = {
                success: 0,
                partial: 0,
                failure: 0,
                total: 0,
                lastAttempt: null
            };
        }
        
        const stat = data.intelligence.stateEffectiveness[state][intervention];
        stat.total++;
        stat.lastAttempt = session.timestamp;
        
        // Update based on feedback
        if (feedback === 'yes') {
            stat.success++;
        } else if (feedback === 'little') {
            stat.partial++;
        } else if (feedback === 'no') {
            stat.failure++;
        }
        
        // Track time effectiveness
        if (!data.intelligence.timeEffectiveness[hour]) {
            data.intelligence.timeEffectiveness[hour] = {
                success: 0,
                partial: 0,
                failure: 0,
                total: 0
            };
        }
        
        const timeStat = data.intelligence.timeEffectiveness[hour];
        timeStat.total++;
        if (feedback === 'yes') timeStat.success++;
        if (feedback === 'little') timeStat.partial++;
        if (feedback === 'no') timeStat.failure++;
        
        // Track intervention in user history
        data.userProfile.interventionHistory.push({
            state: state,
            intervention: intervention,
            feedback: feedback,
            timestamp: session.timestamp,
            hour: hour
        });
        
        // Keep only last 100 intervention history
        if (data.userProfile.interventionHistory.length > 100) {
            data.userProfile.interventionHistory = data.userProfile.interventionHistory.slice(-100);
        }
        
        // Add to learning log
        data.intelligence.learningLog.push({
            timestamp: session.timestamp,
            state: state,
            intervention: intervention,
            feedback: feedback,
            effectiveness: this.calculateEffectivenessScore(feedback)
        });
        
        // Keep learning log manageable
        if (data.intelligence.learningLog.length > 200) {
            data.intelligence.learningLog = data.intelligence.learningLog.slice(-200);
        }
        
        // Update user patterns
        this.updateUserPatterns(data);
    },

    // Update predictive data
    updatePredictiveData(data) {
        const sessions = data.sessionHistory.filter(s => s.feedback);
        
        // Calculate time patterns for predictions
        data.intelligence.predictiveData.timePatterns = this.calculateTimePatterns(sessions);
        data.intelligence.predictiveData.stateTransitions = this.calculateStateTransitions(sessions);
        data.intelligence.predictiveData.effectivenessByHour = this.calculateEffectivenessByHour(sessions);
    },

    calculateTimePatterns(sessions) {
        const patterns = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        
        sessions.forEach(session => {
            const hour = new Date(session.timestamp).getHours();
            let timeSlot;
            
            if (hour >= 5 && hour < 12) timeSlot = 'morning';
            else if (hour >= 12 && hour < 17) timeSlot = 'afternoon';
            else if (hour >= 17 && hour < 22) timeSlot = 'evening';
            else timeSlot = 'night';
            
            patterns[timeSlot]++;
        });
        
        return patterns;
    },

    calculateStateTransitions(sessions) {
        const transitions = {};
        
        for (let i = 0; i < sessions.length - 1; i++) {
            const from = sessions[i].state;
            const to = sessions[i + 1].state;
            
            if (from && to) {
                if (!transitions[from]) transitions[from] = {};
                transitions[from][to] = (transitions[from][to] || 0) + 1;
            }
        }
        
        return transitions;
    },

    calculateEffectivenessByHour(sessions) {
        const hourMap = {};
        
        for (let hour = 0; hour < 24; hour++) {
            hourMap[hour] = { success: 0, total: 0 };
        }
        
        sessions.forEach(session => {
            if (session.feedback) {
                const hour = new Date(session.timestamp).getHours();
                hourMap[hour].total++;
                if (session.feedback === 'yes') hourMap[hour].success++;
            }
        });
        
        // Convert to effectiveness percentages
        const effectiveness = {};
        for (const [hour, data] of Object.entries(hourMap)) {
            if (data.total > 0) {
                effectiveness[hour] = Math.round((data.success / data.total) * 100);
            }
        }
        
        return effectiveness;
    },

    // Get predictive data for engine
    getPredictiveData() {
        const data = this.getData();
        if (!data) return null;
        
        return {
            totalSessions: data.appStats.totalSessions,
            timePatterns: data.intelligence.predictiveData.timePatterns,
            stateTransitions: data.intelligence.predictiveData.stateTransitions,
            effectivenessByHour: data.intelligence.predictiveData.effectivenessByHour,
            sessionHistory: data.sessionHistory.filter(s => s.feedback)
        };
    },

    // Calculate effectiveness score (0-100)
    calculateEffectivenessScore(feedback) {
        switch(feedback) {
            case 'yes': return 100;
            case 'little': return 50;
            case 'no': return 0;
            default: return 0;
        }
    },

    // Update user patterns based on data
    updateUserPatterns(data) {
        const patterns = data.intelligence.userPatterns;
        
        // Calculate most dominant states (by frequency)
        const stateCounts = {};
        data.sessionHistory.forEach(s => {
            if (s.state) {
                stateCounts[s.state] = (stateCounts[s.state] || 0) + 1;
            }
        });
        
        patterns.dominantStates = Object.entries(stateCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([state, count]) => ({ state, count }));
        
        // Calculate best/worst times
        const timeStats = [];
        for (const [hour, stat] of Object.entries(data.intelligence.timeEffectiveness)) {
            if (stat.total >= 3) { // Only consider times with enough data
                const effectiveness = (stat.success / stat.total) * 100;
                timeStats.push({ hour: parseInt(hour), effectiveness, total: stat.total });
            }
        }
        
        patterns.bestTimes = timeStats
            .sort((a, b) => b.effectiveness - a.effectiveness)
            .slice(0, 3);
            
        patterns.worstTimes = timeStats
            .sort((a, b) => a.effectiveness - b.effectiveness)
            .slice(0, 3);
        
        // Calculate most/least effective interventions
        const interventionStats = [];
        for (const [state, interventions] of Object.entries(data.intelligence.stateEffectiveness)) {
            for (const [intervention, stat] of Object.entries(interventions)) {
                if (stat.total >= 2) { // Only consider interventions tried multiple times
                    const effectiveness = ((stat.success * 100) + (stat.partial * 50)) / stat.total;
                    interventionStats.push({
                        state,
                        intervention,
                        effectiveness,
                        total: stat.total,
                        success: stat.success
                    });
                }
            }
        }
        
        patterns.mostEffectiveInterventions = interventionStats
            .sort((a, b) => b.effectiveness - a.effectiveness)
            .slice(0, 5);
            
        patterns.leastEffectiveInterventions = interventionStats
            .sort((a, b) => a.effectiveness - b.effectiveness)
            .slice(0, 5);
        
        // Update average effectiveness
        const allSessions = data.sessionHistory.filter(s => s.feedback);
        if (allSessions.length > 0) {
            const totalScore = allSessions.reduce((sum, s) => {
                return sum + this.calculateEffectivenessScore(s.feedback);
            }, 0);
            data.appStats.avgEffectiveness = Math.round(totalScore / allSessions.length);
        }
    },

    // Update adaptation level (1-5)
    updateAdaptationLevel(data) {
        const totalSessions = data.userProfile.totalSessions;
        const successRate = data.appStats.avgEffectiveness;
        
        let newLevel = 1;
        
        if (totalSessions >= 20 && successRate >= 70) newLevel = 5;
        else if (totalSessions >= 15 && successRate >= 60) newLevel = 4;
        else if (totalSessions >= 10 && successRate >= 50) newLevel = 3;
        else if (totalSessions >= 5 && successRate >= 40) newLevel = 2;
        else newLevel = 1;
        
        // Only increase level, don't decrease (prevents frustration)
        if (newLevel > data.userProfile.adaptationLevel) {
            data.userProfile.adaptationLevel = newLevel;
        }
    },

    // Generate personalized insight
    generatePersonalizedInsight(data, session) {
        if (data.sessionHistory.length < 3) return;
        
        const recentSessions = data.sessionHistory.slice(-10);
        const patterns = data.intelligence.userPatterns;
        
        // Generate insight based on actual user data
        let insight = "";
        
        // Check for improvement trends
        if (recentSessions.length >= 5) {
            const recentSuccess = recentSessions.filter(s => s.feedback === 'yes').length;
            const recentEffectiveness = (recentSuccess / recentSessions.length) * 100;
            
            const olderSessions = data.sessionHistory.slice(-20, -10);
            if (olderSessions.length >= 5) {
                const olderSuccess = olderSessions.filter(s => s.feedback === 'yes').length;
                const olderEffectiveness = (olderSuccess / olderSessions.length) * 100;
                
                if (recentEffectiveness > olderEffectiveness + 15) {
                    insight = `Your regulation effectiveness improved by ${Math.round(recentEffectiveness - olderEffectiveness)}% recently. Your nervous system is learning to self-regulate more efficiently.`;
                }
            }
        }
        
        // If no improvement insight, check for patterns
        if (!insight && patterns.dominantStates.length > 0) {
            const dominantState = patterns.dominantStates[0];
            const stateName = getStateDisplayName(dominantState.state);
            const percentage = Math.round((dominantState.count / Math.min(data.sessionHistory.length, 10)) * 100);
            
            if (percentage >= 40) {
                insight = `You frequently experience ${stateName.toLowerCase()} (${percentage}% of recent sessions). Let's explore what triggers this pattern.`;
            }
        }
        
        // Check for time patterns
        if (!insight && patterns.bestTimes.length > 0 && patterns.bestTimes[0].total >= 3) {
            const bestTime = patterns.bestTimes[0];
            if (bestTime.effectiveness >= 80) {
                const timeLabel = bestTime.hour < 12 ? 'morning' : bestTime.hour < 17 ? 'afternoon' : 'evening';
                insight = `Your regulation is most effective in the ${timeLabel} (${bestTime.effectiveness}% success rate). Consider scheduling important tasks during this time.`;
            }
        }
        
        // Default insight if none generated
        if (!insight) {
            insight = this.generateDefaultInsight(data, session);
        }
        
        // Save the insight
        const insightObj = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            text: insight,
            type: 'personalized',
            dataBased: true,
            relevantTo: session.state || 'general'
        };
        
        data.patternInsights.push(insightObj);
        
        // Keep only last 20 insights
        if (data.patternInsights.length > 20) {
            data.patternInsights = data.patternInsights.slice(-20);
        }
        
        return insightObj;
    },

    // Generate default insight based on data
    generateDefaultInsight(data, session) {
        const totalSessions = data.userProfile.totalSessions;
        
        if (totalSessions < 3) {
            return "Complete a few more sessions to unlock personalized insights about your nervous system patterns.";
        }
        
        const successRate = data.appStats.avgEffectiveness;
        
        if (successRate >= 70) {
            return "Your nervous system shows strong regulation capacity. This consistency builds long-term resilience.";
        } else if (successRate >= 50) {
            return "You're developing reliable regulation skills. Notice which techniques feel most natural to you.";
        } else {
            return "Regulation is a skill that improves with practice. Each attempt strengthens your neural pathways.";
        }
    },

    // Add predictive insight
    addPredictiveInsight(insight) {
        const data = this.getData();
        if (!data) return;
        
        if (!data.userProfile.predictiveInsights) {
            data.userProfile.predictiveInsights = [];
        }
        
        insight.id = Date.now();
        insight.timestamp = new Date().toISOString();
        
        data.userProfile.predictiveInsights.push(insight);
        
        // Keep only last 10 predictive insights
        if (data.userProfile.predictiveInsights.length > 10) {
            data.userProfile.predictiveInsights = data.userProfile.predictiveInsights.slice(-10);
        }
        
        this.setData(data);
        return insight;
    },

    // Get latest predictive insight
    getLatestPredictiveInsight() {
        const data = this.getData();
        if (!data || !data.userProfile.predictiveInsights) return null;
        
        return data.userProfile.predictiveInsights.slice(-1)[0];
    },

    // Update streak
    updateStreak(data, success) {
        if (success) {
            data.userProfile.currentStreak++;
            if (data.userProfile.currentStreak > data.userProfile.bestStreak) {
                data.userProfile.bestStreak = data.userProfile.currentStreak;
            }
        } else {
            data.userProfile.currentStreak = 0;
        }
    },

    // Get session history
    getSessionHistory(days = 7) {
        const data = this.getData();
        if (!data || !data.sessionHistory) return [];
        
        if (days === 'all') return data.sessionHistory;
        if (days === 'week') {
            const weekStart = this.getWeekStartDate();
            return data.sessionHistory.filter(session => 
                session.week === weekStart
            );
        }
        
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        return data.sessionHistory.filter(session => {
            return new Date(session.timestamp) >= cutoff;
        });
    },

    // Get statistics with intelligence insights
    getStats() {
        const history = this.getSessionHistory(30);
        const weeklyHistory = this.getSessionHistory('week');
        const data = this.getData();
        
        if (!data) return null;
        
        const feedbackCounts = history.reduce((acc, session) => {
            const feedback = session.feedback || 'none';
            acc[feedback] = (acc[feedback] || 0) + 1;
            return acc;
        }, {});
        
        const totalSessions = history.length;
        const yesCount = feedbackCounts.yes || 0;
        const littleCount = feedbackCounts.little || 0;
        const noCount = feedbackCounts.no || 0;
        
        // Calculate weighted effectiveness (yes=100%, little=50%, no=0%)
        const effectivenessRate = totalSessions > 0 
            ? Math.round(((yesCount * 100) + (littleCount * 50)) / totalSessions)
            : 0;
        
        // Calculate state distribution with effectiveness
        const stateFrequency = {};
        const stateEffectiveness = {};
        
        history.forEach(session => {
            if (session.state) {
                stateFrequency[session.state] = (stateFrequency[session.state] || 0) + 1;
                
                if (!stateEffectiveness[session.state]) {
                    stateEffectiveness[session.state] = { success: 0, total: 0 };
                }
                stateEffectiveness[session.state].total++;
                if (session.feedback === 'yes') stateEffectiveness[session.state].success++;
            }
        });
        
        // Calculate effectiveness per state
        const stateEffectivenessRates = {};
        for (const [state, stats] of Object.entries(stateEffectiveness)) {
            stateEffectivenessRates[state] = stats.total > 0 
                ? Math.round((stats.success / stats.total) * 100)
                : 0;
        }
        
        // Get latest personalized insight
        const latestInsight = data.patternInsights.slice(-1)[0];
        
        // Get latest predictive insight
        const latestPredictive = this.getLatestPredictiveInsight();
        
        // Get user patterns
        const userPatterns = data.intelligence.userPatterns;
        
        // Calculate improvement
        let improvement = 0;
        if (history.length >= 10) {
            const recent = history.slice(-5);
            const older = history.slice(-10, -5);
            
            const recentEffectiveness = recent.filter(s => s.feedback === 'yes').length / recent.length * 100;
            const olderEffectiveness = older.filter(s => s.feedback === 'yes').length / older.length * 100;
            
            improvement = Math.round(recentEffectiveness - olderEffectiveness);
        }
        
        return {
            totalSessions,
            effectivenessRate,
            improvement,
            feedbackCounts,
            stateFrequency,
            stateEffectiveness: stateEffectivenessRates,
            last7Days: this.getSessionHistory(7).length,
            returnToBaselineCount: yesCount,
            partialSuccessCount: littleCount,
            noSuccessCount: noCount,
            weeklyStats: data.weeklyStats,
            currentStreak: data.userProfile.currentStreak || 0,
            bestStreak: data.userProfile.bestStreak || 0,
            adaptationLevel: data.userProfile.adaptationLevel || 1,
            personalizedInsight: latestInsight,
            predictiveInsight: latestPredictive,
            userPatterns: userPatterns,
            intelligence: {
                bestTimes: userPatterns.bestTimes,
                worstTimes: userPatterns.worstTimes,
                mostEffectiveInterventions: userPatterns.mostEffectiveInterventions,
                leastEffectiveInterventions: userPatterns.leastEffectiveInterventions,
                dominantStates: userPatterns.dominantStates
            },
            avgEffectiveness: data.appStats.avgEffectiveness || 0,
            premiumFeatures: data.premiumFeatures
        };
    },

    // Get recommended intervention for a state based on intelligence
    getRecommendedIntervention(state) {
        const data = this.getData();
        if (!data || !data.intelligence.stateEffectiveness[state]) {
            return null; // No data yet, will use default
        }
        
        const interventions = data.intelligence.stateEffectiveness[state];
        let bestIntervention = null;
        let bestScore = -1;
        
        for (const [intervention, stats] of Object.entries(interventions)) {
            if (stats.total >= 2) { // Need at least 2 attempts for reliable data
                // Calculate weighted score (success * 100 + partial * 50) / total
                const score = ((stats.success * 100) + (stats.partial * 50)) / stats.total;
                
                // Add recency bonus (within last 7 days)
                if (stats.lastAttempt) {
                    const daysSince = (Date.now() - new Date(stats.lastAttempt).getTime()) / (1000 * 60 * 60 * 24);
                    if (daysSince <= 7) {
                        score += 10 * (1 - (daysSince / 7)); // Bonus up to 10 points
                    }
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestIntervention = intervention;
                }
            }
        }
        
        return bestIntervention;
    },

    // Get personalized neuroscience insight
    getPersonalizedNeuroscienceTip(state = null) {
        const data = this.getData();
        const stats = this.getStats();
        
        if (!stats || stats.totalSessions < 5) {
            return "The vagus nerve regulates your stress response. Regular practice strengthens this connection.";
        }
        
        // Generate data-driven tip
        if (state && stats.stateEffectiveness[state]) {
            const effectiveness = stats.stateEffectiveness[state];
            const stateName = getStateDisplayName(state);
            
            if (effectiveness >= 70) {
                return `Your nervous system responds well to ${stateName} regulation (${effectiveness}% effective). This suggests strong vagal tone for this state.`;
            } else if (effectiveness >= 50) {
                return `You're building resilience for ${stateName} (${effectiveness}% effective). Each session strengthens the prefrontal cortex's regulation capacity.`;
            } else {
                return `For ${stateName}, try different techniques. The amygdala may need varied approaches to signal safety effectively.`;
            }
        }
        
        // General tip based on overall effectiveness
        if (stats.effectivenessRate >= 70) {
            return "High effectiveness suggests strong vagal tone. Your nervous system efficiently returns to baseline after stress.";
        } else if (stats.effectivenessRate >= 50) {
            return "Moderate effectiveness shows developing regulation skills. The prefrontal cortex is learning to modulate emotional responses.";
        } else {
            return "Practice builds neural pathways. Each regulation attempt strengthens the connection between prefrontal cortex and amygdala.";
        }
    },

    // Check if premium feature is enabled
    isPremiumFeatureEnabled(feature) {
        const data = this.getData();
        if (!data || !data.premiumFeatures) return false;
        
        return data.premiumFeatures[feature] === true;
    },

    // Enable premium feature
    enablePremiumFeature(feature) {
        const data = this.getData();
        if (!data || !data.premiumFeatures) return false;
        
        data.premiumFeatures[feature] = true;
        this.setData(data);
        return true;
    },

    // Update user setting
    updateSetting(key, value) {
        const data = this.getData();
        if (data && data.userProfile && data.userProfile.preferences) {
            data.userProfile.preferences[key] = value;
            this.setData(data);
            return true;
        }
        return false;
    },

    // Update user profile
    updateProfile(key, value) {
        const data = this.getData();
        if (data && data.userProfile) {
            if (key === 'preferences' && typeof value === 'object') {
                data.userProfile.preferences = {
                    ...(data.userProfile.preferences || {}),
                    ...value
                };
            } else {
                data.userProfile[key] = value;
            }
            this.setData(data);
            return true;
        }
        return false;
    },

    // Enable notifications
    enableNotifications() {
        return this.updateProfile('notificationEnabled', true);
    },

    // Disable notifications
    disableNotifications() {
        return this.updateProfile('notificationEnabled', false);
    },

    // Record state selection
    recordStateSelection() {
        return this.updateProfile('lastStateSelection', new Date().toISOString());
    },

    // Clear all data
    clearData() {
        try {
            localStorage.removeItem(this.KEY);
            this.init();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },

    // Export data as JSON
    exportData() {
        return JSON.stringify(this.getData(), null, 2);
    },

    // Import data from JSON
    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            const currentData = this.getData();
            
            const mergedData = {
                ...currentData,
                ...importedData,
                version: this.VERSION,
                sessionHistory: [...(currentData?.sessionHistory || []), ...(importedData.sessionHistory || [])],
                userProfile: {
                    ...currentData?.userProfile,
                    ...importedData.userProfile
                }
            };
            
            this.setData(mergedData);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
};

// Initialize storage on load
STORAGE.init();

// Export for debugging
window.STORAGE = STORAGE;
