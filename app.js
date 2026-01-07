// Main Application Logic - INTELLIGENT VERSION WITH PREMIUM FEATURES
class LimenApp {
    constructor() {
        this.currentScreen = 'entry';
        this.currentState = null;
        this.currentIntervention = null;
        this.timerInterval = null;
        this.timeRemaining = 0;
        this.timerTotal = 0;
        this.feedbackGiven = false;
        this.currentSessionId = null;
        this.glowElement = null;
        this.useIntelligence = true; // Enable intelligent features
        this.predictiveEngine = null;
        this.premiumFeatures = {
            predictive: true,
            advancedAnalytics: true,
            personalizedSequences: false,
            dataExport: false
        };
        
        this.init();
    }

    init() {
        console.log('LIMEN Pro Intelligent App initializing...');
        
        // Bind all events
        this.bindEvents();
        
        // Show entry screen
        this.showScreen('entry');
        
        // Check emergency button visibility
        setTimeout(() => this.checkEmergencyButtonVisibility(), 1000);
        
        // Initialize intelligence features
        this.initializeIntelligence();
        
        // Initialize premium features
        this.initializePremiumFeatures();
    }

    initializeIntelligence() {
        // Check if user has enough data for intelligent features
        const stats = STORAGE.getStats();
        if (stats && stats.totalSessions >= 3) {
            this.useIntelligence = true;
            console.log('Intelligent features enabled for user with', stats.totalSessions, 'sessions');
        }
    }

    async initializePremiumFeatures() {
        console.log('Initializing premium features...');
        
        // Check which premium features are enabled
        const stats = STORAGE.getStats();
        if (stats && stats.premiumFeatures) {
            this.premiumFeatures = stats.premiumFeatures;
        }
        
        // Initialize predictive engine if enabled
        if (this.premiumFeatures.predictive && window.initPredictiveEngine) {
            try {
                this.predictiveEngine = await initPredictiveEngine();
                if (this.predictiveEngine) {
                    console.log('Predictive engine initialized successfully');
                    
                    // Start predictive notifications
                    if (window.predictiveNotifications) {
                        window.predictiveNotifications.start();
                    }
                }
            } catch (error) {
                console.error('Error initializing predictive engine:', error);
            }
        }
    }

    bindEvents() {
        // Entry screen
        document.getElementById('btn-continue').addEventListener('click', () => {
            this.showScreen('state');
        });

        // State selection buttons
        document.querySelectorAll('.btn-state').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const state = e.target.dataset.state;
                this.selectState(state);
            });
        });

        // Feedback buttons
        document.querySelectorAll('.btn-feedback').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feedback = e.target.dataset.feedback;
                this.handleFeedback(feedback);
            });
        });

        // Weekly summary back button
        document.getElementById('btn-back-to-entry').addEventListener('click', () => {
            this.showScreen('entry');
        });

        // Emergency reset button
        document.getElementById('btn-emergency').addEventListener('click', (e) => {
            e.preventDefault();
            this.triggerEmergencyReset();
        });
    }

    showScreen(screenName) {
        console.log('Showing screen:', screenName);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(`screen-${screenName}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            // Screen-specific initialization
            switch(screenName) {
                case 'intervention':
                    this.startTimer();
                    break;
                case 'summary':
                    this.loadNeuropsychologicalSummary();
                    break;
                case 'state':
                    this.updateStateSelectionWithIntelligence();
                    break;
                case 'entry':
                    this.checkForPredictiveSuggestion();
                    break;
            }
        }
    }

    // Check for predictive suggestion on entry screen
    checkForPredictiveSuggestion() {
        if (!this.predictiveEngine || !this.premiumFeatures.predictive) return;
        
        setTimeout(() => {
            const insight = this.predictiveEngine.getPredictiveInsight();
            if (insight.available && insight.confidence >= 0.7) {
                this.showPredictiveSuggestion(insight);
            }
        }, 2000);
    }

    showPredictiveSuggestion(insight) {
        const entryContent = document.querySelector('#screen-entry .content');
        if (!entryContent) return;
        
        // Remove any existing suggestion
        const existingSuggestion = document.querySelector('.predictive-suggestion');
        if (existingSuggestion) {
            existingSuggestion.remove();
        }
        
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'predictive-suggestion premium-feature';
        suggestionDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; margin-bottom: 1rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#8b5cf6" style="margin-right: 8px; flex-shrink: 0; margin-top: 2px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #8b5cf6; margin-bottom: 4px;">Predictive Insight</div>
                    <div style="font-size: 0.9rem; color: #e5e5e5; line-height: 1.4;">${insight.message}</div>
                    <div style="font-size: 0.8rem; color: #a0a0b0; margin-top: 4px; font-style: italic;">${insight.suggestion}</div>
                </div>
            </div>
            <button class="btn-predictive-action" style="width: 100%; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); color: #8b5cf6; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease;">
                Start Preemptive Regulation
            </button>
        `;
        
        // Insert after the continue button
        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            entryContent.insertBefore(suggestionDiv, continueBtn.nextSibling);
            
            // Add event listener to the action button
            const actionBtn = suggestionDiv.querySelector('.btn-predictive-action');
            if (actionBtn) {
                actionBtn.addEventListener('click', () => {
                    this.selectState(insight.state);
                });
                
                // Style the button on hover
                actionBtn.addEventListener('mouseenter', () => {
                    actionBtn.style.background = 'rgba(139, 92, 246, 0.2)';
                    actionBtn.style.transform = 'translateY(-1px)';
                });
                
                actionBtn.addEventListener('mouseleave', () => {
                    actionBtn.style.background = 'rgba(139, 92, 246, 0.1)';
                    actionBtn.style.transform = 'translateY(0)';
                });
            }
        }
    }

    // Update state selection with intelligence
    updateStateSelectionWithIntelligence() {
        if (!this.useIntelligence) return;
        
        const stats = STORAGE.getStats();
        if (!stats || !stats.stateFrequency) return;
        
        const stateButtons = document.querySelectorAll('.btn-state');
        stateButtons.forEach(btn => {
            const state = btn.dataset.state;
            const frequency = stats.stateFrequency[state] || 0;
            const effectiveness = stats.stateEffectiveness[state] || 0;
            
            // Add intelligence indicator
            if (frequency > 0) {
                let indicator = '';
                if (effectiveness >= 70) {
                    indicator = ' ✓'; // High effectiveness
                } else if (effectiveness >= 50) {
                    indicator = ' ~'; // Moderate effectiveness
                }
                
                // Add frequency count if more than 1
                if (frequency > 1) {
                    btn.innerHTML = `${btn.textContent} <small style="color: #8b5cf6;">(${frequency})${indicator}</small>`;
                }
            }
        });
    }

    selectState(state) {
        console.log('User selected state:', state);
        this.currentState = state;
        
        // Record state selection
        STORAGE.updateProfile('lastSelectedState', state);
        STORAGE.updateProfile('lastStateSelection', new Date().toISOString());
        
        this.showIntervention(state);
    }

    showIntervention(state) {
        // Get intelligent intervention recommendation
        this.currentIntervention = getIntervention(state, this.useIntelligence);
        
        if (!this.currentIntervention) {
            console.error('No intervention found for state:', state);
            this.currentIntervention = getIntervention("CognitiveOverdrive", false);
        }
        
        // Update UI with intervention
        const interventionText = document.getElementById('intervention-text');
        if (interventionText) {
            interventionText.textContent = this.currentIntervention.text;
            
            // Add intelligence indicator if using smart recommendation
            if (this.useIntelligence) {
                const stats = STORAGE.getStats();
                if (stats && stats.stateEffectiveness[state]) {
                    const effectiveness = stats.stateEffectiveness[state];
                    const interventionTitle = document.getElementById('intervention-title');
                    if (interventionTitle) {
                        interventionTitle.textContent = `Recommended (${effectiveness}% effective for you)`;
                    }
                }
            }
        }
        
        // Set timer values
        this.timeRemaining = this.currentIntervention.duration;
        this.timerTotal = this.currentIntervention.duration;
        
        const timerText = document.getElementById('timer-text');
        if (timerText) {
            timerText.textContent = this.timeRemaining;
        }
        
        // Reset timer circle
        const timerFill = document.querySelector('.timer-fill');
        if (timerFill) {
            const circumference = 2 * Math.PI * 45;
            timerFill.style.strokeDasharray = circumference;
            timerFill.style.strokeDashoffset = circumference;
        }
        
        // Get glow element
        this.glowElement = document.getElementById('timer-glow');
        if (this.glowElement) {
            this.glowElement.classList.remove('amber');
        }
        
        this.showScreen('intervention');
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        const timerFill = document.querySelector('.timer-fill');
        const timerText = document.getElementById('timer-text');
        const circumference = 2 * Math.PI * 45;
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            
            if (timerText) {
                timerText.textContent = this.timeRemaining;
            }
            
            // Update progress circle
            if (timerFill && this.timerTotal > 0) {
                const progress = this.timeRemaining / this.timerTotal;
                const offset = circumference * progress;
                timerFill.style.strokeDashoffset = offset;
            }
            
            // Change glow color when 5 seconds remain
            if (this.timeRemaining <= 5 && this.glowElement) {
                this.glowElement.classList.add('amber');
            }
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.timerComplete();
            }
        }, 1000);
    }

    timerComplete() {
        console.log('Timer completed for state:', this.currentState);
        
        // Save session before feedback
        this.saveSession();
        
        // Show feedback screen
        this.showScreen('feedback');
    }

    handleFeedback(feedback) {
        if (this.feedbackGiven) return;
        
        this.feedbackGiven = true;
        console.log('User feedback:', feedback);
        
        const feedbackMessage = document.getElementById('feedback-message');
        
        // Update feedback message based on intelligence
        const stats = STORAGE.getStats();
        if (stats && this.useIntelligence) {
            switch(feedback) {
                case 'yes':
                    if (stats.currentStreak > 1) {
                        feedbackMessage.textContent = `Excellent! ${stats.currentStreak} successful sessions in a row.`;
                    } else {
                        feedbackMessage.textContent = 'Successfully regulated.';
                    }
                    this.handlePositiveFeedback();
                    break;
                    
                case 'little':
                    const partialSuccessRate = stats.partialSuccessCount / stats.totalSessions * 100;
                    if (partialSuccessRate > 30) {
                        feedbackMessage.textContent = 'Partial success. Trying a different approach...';
                    } else {
                        feedbackMessage.textContent = 'Some improvement. Adjusting technique...';
                    }
                    this.handlePartialFeedback();
                    break;
                    
                case 'no':
                    if (stats.stateEffectiveness[this.currentState] < 30) {
                        feedbackMessage.textContent = 'Noticing patterns. Trying alternative state...';
                    } else {
                        feedbackMessage.textContent = 'Adjusting approach based on your patterns...';
                    }
                    this.handleNegativeFeedback();
                    break;
            }
        } else {
            // Default messages
            switch(feedback) {
                case 'yes':
                    feedbackMessage.textContent = 'Returning to baseline.';
                    this.handlePositiveFeedback();
                    break;
                    
                case 'little':
                    feedbackMessage.textContent = 'Trying alternative...';
                    this.handlePartialFeedback();
                    break;
                    
                case 'no':
                    feedbackMessage.textContent = 'Adjusting...';
                    this.handleNegativeFeedback();
                    break;
            }
        }
        
        // Update session with feedback
        this.updateSessionFeedback(feedback);
    }

    handlePositiveFeedback() {
        setTimeout(() => {
            // Show neuropsychological summary immediately after successful regulation
            this.showNeuropsychologicalSummary();
            this.resetSession();
        }, 1500);
    }

    handlePartialFeedback() {
        setTimeout(() => {
            // Show alternative intervention based on intelligence
            const alternative = getAlternativeIntervention(this.currentState);
            this.currentIntervention = alternative;
            
            const interventionText = document.getElementById('intervention-text');
            if (interventionText) {
                interventionText.textContent = alternative.text;
                
                // Add note about trying alternative
                if (this.useIntelligence) {
                    const interventionTitle = document.getElementById('intervention-title');
                    if (interventionTitle) {
                        interventionTitle.textContent = 'Alternative approach';
                    }
                }
            }
            
            this.timeRemaining = alternative.duration;
            this.timerTotal = alternative.duration;
            
            const timerText = document.getElementById('timer-text');
            if (timerText) {
                timerText.textContent = this.timeRemaining;
            }
            
            // Reset glow
            if (this.glowElement) {
                this.glowElement.classList.remove('amber');
            }
            
            this.showScreen('intervention');
            this.startTimer();
            this.feedbackGiven = false;
        }, 1500);
    }

    handleNegativeFeedback() {
        setTimeout(() => {
            // Try a different state based on intelligence
            const newState = this.getIntelligentFallbackState();
            this.selectState(newState);
            this.feedbackGiven = false;
        }, 1500);
    }

    getIntelligentFallbackState() {
        const stats = STORAGE.getStats();
        
        // If we have intelligence data, use it
        if (this.useIntelligence && stats && stats.intelligence) {
            // Check for most effective state for this user
            const mostEffective = stats.intelligence.mostEffectiveInterventions[0];
            if (mostEffective && mostEffective.effectiveness > 60) {
                return mostEffective.state;
            }
            
            // Check user patterns for frequently co-occurring states
            const currentState = this.currentState;
            const history = STORAGE.getSessionHistory(30);
            
            // Find what state users typically go to after current state
            const transitions = {};
            for (let i = 0; i < history.length - 1; i++) {
                if (history[i].state === currentState && history[i + 1].state) {
                    const nextState = history[i + 1].state;
                    transitions[nextState] = (transitions[nextState] || 0) + 1;
                }
            }
            
            // Find most common transition
            let mostCommon = null;
            let maxCount = 0;
            for (const [state, count] of Object.entries(transitions)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommon = state;
                }
            }
            
            if (mostCommon && mostCommon !== currentState) {
                return mostCommon;
            }
        }
        
        // Fallback to default logic
        return this.getFallbackState();
    }

    getFallbackState() {
        // Fallback logic based on current state
        const fallbacks = {
            'CognitiveOverdrive': 'RecoveryDebt',
            'RecoveryDebt': 'ShutdownDrift',
            'AnticipatoryStress': 'SomaticTension',
            'SomaticTension': 'EmotionalLoad',
            'EmotionalLoad': 'Baseline',
            'Hypervigilance': 'RecoveryDebt',
            'DecisionFatigue': 'Baseline',
            'Understimulated': 'CognitiveOverdrive',
            'FragmentedFocus': 'RecoveryDebt',
            'SocialDepletion': 'ShutdownDrift',
            'ShutdownDrift': 'Baseline',
            'Baseline': 'CognitiveOverdrive'
        };
        
        return fallbacks[this.currentState] || 'Baseline';
    }

    triggerEmergencyReset() {
        // Add pulse animation to emergency button
        const emergencyBtn = document.getElementById('btn-emergency');
        emergencyBtn.classList.add('pulse');
        
        // Immediate intervention for acute dysregulation
        const emergencyIntervention = {
            title: "Emergency Reset",
            text: "Place both feet flat on the ground. Press palms together firmly. Breathe: 4 seconds in, 7 seconds hold, 8 seconds out. Repeat 3 times.",
            duration: 120,
            color: "#ff4444"
        };
        
        this.currentIntervention = emergencyIntervention;
        this.currentState = "EmergencyReset";
        
        // Update UI
        const interventionText = document.getElementById('intervention-text');
        if (interventionText) {
            interventionText.textContent = emergencyIntervention.text;
        }
        
        this.timeRemaining = emergencyIntervention.duration;
        this.timerTotal = emergencyIntervention.duration;
        
        const timerText = document.getElementById('timer-text');
        if (timerText) {
            timerText.textContent = this.timeRemaining;
        }
        
        // Show intervention screen immediately
        this.showScreen('intervention');
        
        // Log emergency session
        const session = {
            state: "EmergencyReset",
            intervention: "Emergency Reset",
            duration: 120,
            emergency: true,
            timestamp: new Date().toISOString()
        };
        
        STORAGE.addSession(session);
        
        // Remove pulse animation after 2 seconds
        setTimeout(() => {
            emergencyBtn.classList.remove('pulse');
        }, 2000);
    }

    saveSession() {
        if (!this.currentState || !this.currentIntervention) return;
        
        const session = {
            state: this.currentState,
            intervention: this.currentIntervention.title || this.currentState,
            duration: this.currentIntervention.duration || 90,
            feedback: null,
            timestamp: new Date().toISOString(),
            returnedToBaseline: false,
            intelligentRecommendation: this.useIntelligence
        };
        
        const savedSession = STORAGE.addSession(session);
        if (savedSession) {
            this.currentSessionId = savedSession.id;
        }
    }

    updateSessionFeedback(feedback) {
        if (!this.currentSessionId) return;
        
        const data = STORAGE.getData();
        if (!data || !data.sessionHistory) return;
        
        const sessionIndex = data.sessionHistory.findIndex(s => s.id === this.currentSessionId);
        
        if (sessionIndex !== -1) {
            data.sessionHistory[sessionIndex].feedback = feedback;
            data.sessionHistory[sessionIndex].completedAt = new Date().toISOString();
            data.sessionHistory[sessionIndex].returnedToBaseline = (feedback === 'yes');
            STORAGE.setData(data);
        }
    }

    // NEUROPSYCHOLOGICAL SUMMARY FUNCTIONS - INTELLIGENT VERSION
    showNeuropsychologicalSummary() {
        this.showScreen('summary');
        this.loadNeuropsychologicalSummary();
    }

    loadNeuropsychologicalSummary() {
        const stats = STORAGE.getStats();
        if (!stats) return;
        
        // Update basic stats
        document.getElementById('total-sessions').textContent = stats.totalSessions || 0;
        document.getElementById('effectiveness-rate').textContent = stats.effectivenessRate + '%' || '0%';
        
        // Show improvement if any
        const currentStreakEl = document.getElementById('current-streak');
        if (currentStreakEl) {
            if (stats.improvement > 0) {
                currentStreakEl.textContent = `+${stats.improvement}% improvement`;
                currentStreakEl.style.color = '#8b5cf6';
            } else if (stats.improvement < 0) {
                currentStreakEl.textContent = `${stats.improvement}% change`;
                currentStreakEl.style.color = '#ff6b6b';
            } else {
                currentStreakEl.textContent = stats.currentStreak || 0;
                currentStreakEl.style.color = '';
            }
        }
        
        // Load intelligent pattern insight
        this.loadIntelligentPatternInsight(stats);
        
        // Load state distribution chart
        this.loadIntelligentStateDistribution(stats);
        
        // Load personalized neuroscience insight
        this.loadPersonalizedNeuroscienceTip(stats);
        
        // Add predictive insights if available
        setTimeout(() => {
            this.addPredictiveInsights(stats);
        }, 100);
    }

    loadIntelligentPatternInsight(stats) {
        const insightEl = document.getElementById('pattern-insight');
        
        if (stats.totalSessions === 0) {
            insightEl.textContent = 'Complete your first session to unlock intelligent pattern insights.';
            return;
        }
        
        if (stats.personalizedInsight && stats.personalizedInsight.text) {
            insightEl.textContent = stats.personalizedInsight.text;
            return;
        }
        
        // Generate insight from intelligence data
        if (stats.intelligence) {
            const intel = stats.intelligence;
            
            // Check for dominant pattern
            if (intel.dominantStates && intel.dominantStates.length > 0) {
                const dominant = intel.dominantStates[0];
                if (dominant.count >= 3) {
                    const stateName = getStateDisplayName(dominant.state);
                    const percentage = Math.round((dominant.count / Math.min(stats.totalSessions, 20)) * 100);
                    insightEl.textContent = `Your nervous system shows a recurring pattern of ${stateName.toLowerCase()} (${percentage}% of recent sessions).`;
                    return;
                }
            }
            
            // Check for time patterns
            if (intel.bestTimes && intel.bestTimes.length > 0) {
                const bestTime = intel.bestTimes[0];
                if (bestTime.effectiveness >= 80 && bestTime.total >= 3) {
                    const timeOfDay = bestTime.hour < 12 ? 'morning' : bestTime.hour < 17 ? 'afternoon' : 'evening';
                    insightEl.textContent = `Your regulation is most effective in the ${timeOfDay} (${Math.round(bestTime.effectiveness)}% success rate).`;
                    return;
                }
            }
            
            // Check for most effective interventions
            if (intel.mostEffectiveInterventions && intel.mostEffectiveInterventions.length > 0) {
                const mostEffective = intel.mostEffectiveInterventions[0];
                if (mostEffective.effectiveness >= 70 && mostEffective.total >= 3) {
                    const stateName = getStateDisplayName(mostEffective.state);
                    insightEl.textContent = `You're particularly skilled at regulating ${stateName.toLowerCase()} (${Math.round(mostEffective.effectiveness)}% effective).`;
                    return;
                }
            }
        }
        
        // Default insight based on effectiveness
        if (stats.effectivenessRate >= 70) {
            insightEl.textContent = 'Your nervous system shows strong regulation capacity with consistent effectiveness.';
        } else if (stats.effectivenessRate >= 50) {
            insightEl.textContent = 'You\'re developing reliable regulation skills. Notice which techniques feel most natural.';
        } else {
            insightEl.textContent = 'Regulation improves with practice. Each session strengthens your neural pathways.';
        }
    }

    loadIntelligentStateDistribution(stats) {
        const chartContainer = document.getElementById('state-chart');
        chartContainer.innerHTML = '';
        
        if (!stats.stateFrequency || Object.keys(stats.stateFrequency).length === 0) {
            chartContainer.innerHTML = '<p style="color: #a0a0b0; text-align: center;">No state data yet</p>';
            return;
        }
        
        // Sort states by frequency with effectiveness coloring
        const sortedStates = Object.entries(stats.stateFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6); // Show top 6
        
        sortedStates.forEach(([stateId, count]) => {
            const percentage = Math.round((count / stats.totalSessions) * 100);
            const displayName = getStateDisplayName(stateId);
            const color = getStateColor(stateId);
            const effectiveness = stats.stateEffectiveness[stateId] || 0;
            
            // Adjust opacity based on effectiveness
            let opacity = 1;
            let effectivenessText = '';
            
            if (effectiveness >= 70) {
                opacity = 1;
                effectivenessText = '✓ High effectiveness';
            } else if (effectiveness >= 50) {
                opacity = 0.8;
                effectivenessText = '~ Moderate effectiveness';
            } else if (effectiveness > 0) {
                opacity = 0.6;
                effectivenessText = 'Developing';
            } else {
                opacity = 0.4;
                effectivenessText = 'No data';
            }
            
            const barElement = document.createElement('div');
            barElement.className = 'chart-bar';
            
            barElement.innerHTML = `
                <span class="chart-label">${displayName}</span>
                <div class="chart-bar-container">
                    <div class="chart-bar-fill" style="width: ${percentage}%; background-color: ${color}; opacity: ${opacity};"></div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; min-width: 80px;">
                    <span style="color: ${color}; font-weight: 500;">${percentage}%</span>
                    <small style="font-size: 0.7rem; color: #a0a0b0;">${effectivenessText}</small>
                </div>
            `;
            
            chartContainer.appendChild(barElement);
        });
    }

    loadPersonalizedNeuroscienceTip(stats) {
        const tipEl = document.getElementById('psychological-tip');
        
        if (!stats || stats.totalSessions < 3) {
            tipEl.textContent = 'The vagus nerve regulates your stress response. Complete 3+ sessions for personalized neuroscience insights.';
            return;
        }
        
        // Get personalized tip based on user data
        const personalizedTip = STORAGE.getPersonalizedNeuroscienceTip(this.currentState);
        tipEl.textContent = personalizedTip;
        
        // Add data citation if we have enough data
        if (stats.totalSessions >= 10) {
            const effectiveness = stats.effectivenessRate;
            const adaptation = stats.adaptationLevel || 1;
            
            // Add adaptation level indicator
            tipEl.innerHTML += `<br><small style="color: #8b5cf6; margin-top: 0.5rem; display: block;">Adaptation Level: ${adaptation}/5 (based on ${stats.totalSessions} sessions)</small>`;
        }
    }

    // Add predictive insights to summary
    addPredictiveInsights(stats) {
        if (!this.premiumFeatures.predictive || !this.predictiveEngine) return;
        
        const summaryContainer = document.querySelector('.summary-container');
        if (!summaryContainer) return;
        
        // Remove existing predictive section if present
        const existingPredictive = document.querySelector('.predictive-insight');
        if (existingPredictive) {
            existingPredictive.remove();
        }
        
        const predictiveInsight = this.predictiveEngine.getPredictiveInsight();
        
        if (predictiveInsight.available) {
            const predictiveSection = document.createElement('div');
            predictiveSection.className = 'predictive-insight premium-feature';
            predictiveSection.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#8b5cf6" style="margin-right: 8px;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                    <h3 style="color: #8b5cf6; margin: 0;">Predictive Insight <span class="premium-badge">PRO</span></h3>
                </div>
                <p style="margin: 0; line-height: 1.5;">${predictiveInsight.message}</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #a0a0b0; font-style: italic;">
                    ${predictiveInsight.suggestion}
                </p>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border-left: 3px solid #8b5cf6;">
                    <div style="font-size: 0.8rem; color: #8b5cf6; margin-bottom: 0.25rem;">Confidence: ${Math.round(predictiveInsight.confidence * 100)}%</div>
                    <div style="font-size: 0.8rem; color: #a0a0b0;">${predictiveInsight.reason}</div>
                </div>
            `;
            
            // Insert after pattern insight
            const patternInsight = document.querySelector('.pattern-insight');
            if (patternInsight) {
                patternInsight.parentNode.insertBefore(predictiveSection, patternInsight.nextSibling);
            }
            
            // Store the insight
            STORAGE.addPredictiveInsight({
                state: predictiveInsight.state,
                confidence: predictiveInsight.confidence,
                message: predictiveInsight.message,
                reason: predictiveInsight.reason,
                suggestion: predictiveInsight.suggestion
            });
        }
    }

    checkEmergencyButtonVisibility() {
        const history = STORAGE.getSessionHistory(1);
        const recentNegativeFeedback = history.filter(s => s.feedback === 'no').length;
        const totalSessions = STORAGE.getStats()?.totalSessions || 0;
        
        // More lenient conditions for showing emergency button
        const shouldShow = recentNegativeFeedback >= 1 || 
                          totalSessions >= 2 ||
                          history.length >= 3;
        
        const emergencyReset = document.getElementById('emergency-reset');
        if (emergencyReset) {
            emergencyReset.style.display = 'block';
            if (shouldShow) {
                emergencyReset.classList.add('active');
            } else {
                emergencyReset.classList.remove('active');
            }
        }
    }

    resetSession() {
        this.currentState = null;
        this.currentIntervention = null;
        this.currentSessionId = null;
        this.feedbackGiven = false;
        this.timeRemaining = 0;
        this.timerTotal = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.glowElement) {
            this.glowElement.classList.remove('amber');
        }
    }

    cleanup() {
        console.log('Cleaning up app...');
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (window.pushManager) {
            window.pushManager.stop();
        }
        
        if (window.predictiveNotifications) {
            window.predictiveNotifications.stop();
        }
    }

    // Debug methods
    showDebugInfo() {
        const stats = STORAGE.getStats();
        console.log('=== LIMEN PRO INTELLIGENT DEBUG INFO ===');
        console.log('Total Sessions:', stats?.totalSessions);
        console.log('Effectiveness Rate:', stats?.effectivenessRate + '%');
        console.log('Adaptation Level:', stats?.adaptationLevel);
        console.log('Current State:', this.currentState);
        console.log('Using Intelligence:', this.useIntelligence);
        console.log('Premium Features:', this.premiumFeatures);
        console.log('Predictive Engine:', this.predictiveEngine ? 'Active' : 'Inactive');
        console.log('Intelligence Data:', stats?.intelligence);
        console.log('========================');
    }
}

// Initialize app when DOM is loaded
let app = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new LimenApp();
        window.app = app;
        
        // Add debug shortcuts
        window.addEventListener('keydown', (e) => {
            // Ctrl+Shift+S for summary
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                app.showNeuropsychologicalSummary();
            }
            // Ctrl+Shift+I for intelligence info
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                app.showDebugInfo();
            }
            // Ctrl+Shift+P for predictive insights
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                if (app.predictiveEngine) {
                    const insight = app.predictiveEngine.getPredictiveInsight();
                    console.log('Predictive Insight:', insight);
                    if (insight.available) {
                        alert(`Predictive Insight: ${insight.message}`);
                    }
                }
            }
        });
        
        console.log('LIMEN Pro Intelligent App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize LIMEN Pro Intelligent App:', error);
    }
});

// Handle service worker updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker updated, reloading...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
}

// Ambient Audio Manager (unchanged from previous)
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.currentSound = null;
        this.isEnabled = false;
        this.volume = 0.1;
        
        this.checkPreference();
    }
    
    async init() {
        if (window.AudioContext || window.webkitAudioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Audio context created');
                
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
            } catch (error) {
                console.log('Audio context creation failed:', error);
            }
        }
    }
    
    checkPreference() {
        const data = STORAGE.getData();
        this.isEnabled = data?.userProfile?.preferences?.ambientAudio || false;
    }
    
    playBrownNoise(duration = 90) {
        if (!this.isEnabled || !this.audioContext) return;
        
        try {
            const bufferSize = this.audioContext.sampleRate * duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                const brown = (lastOut + (0.02 * white)) / 1.02;
                lastOut = brown;
                output[i] = brown * 3.5;
            }
            
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            const gainNode = this.audioContext.createGain();
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.volume, now + 1);
            gainNode.gain.linearRampToValueAtTime(0, now + duration - 1);
            
            source.start();
            this.currentSound = source;
            
            source.stop(now + duration);
            
            source.onended = () => {
                this.currentSound = null;
            };
            
        } catch (error) {
            console.log('Error playing brown noise:', error);
        }
    }
    
    playFocusTone(duration = 60) {
        if (!this.isEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(432, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(528, this.audioContext.currentTime + duration/2);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
            
            this.currentSound = oscillator;
            
            oscillator.onended = () => {
                this.currentSound = null;
            };
            
        } catch (error) {
            console.log('Error playing focus tone:', error);
        }
    }
    
    stopAll() {
        if (this.currentSound) {
            try {
                this.currentSound.stop();
                this.currentSound = null;
            } catch (error) {
                console.log('Error stopping audio:', error);
            }
        }
    }
    
    toggle(enabled) {
        this.isEnabled = enabled;
        STORAGE.updateProfile('preferences', {
            ...(STORAGE.getData()?.userProfile?.preferences || {}),
            ambientAudio: enabled
        });
        
        if (!enabled) {
            this.stopAll();
        }
        
        return enabled;
    }
    
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
    }
}

// Initialize audio manager
let audioManager = null;

function initAudioOnInteraction() {
    if (!audioManager && (window.AudioContext || window.webkitAudioContext)) {
        audioManager = new AudioManager();
        audioManager.init();
        
        document.removeEventListener('click', initAudioOnInteraction);
        document.removeEventListener('touchstart', initAudioOnInteraction);
    }
}

document.addEventListener('click', initAudioOnInteraction, { once: true });
document.addEventListener('touchstart', initAudioOnInteraction, { once: true });

window.audioManager = audioManager;

// Environment Sensor (unchanged)
class EnvironmentSensor {
    constructor() {
        this.lastInteractionTime = Date.now();
        this.activityPattern = [];
        this.inactivityTimer = null;
        
        this.init();
    }
    
    init() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.recordInactivity();
            } else {
                this.recordActivity();
                this.checkInactivityNotification();
            }
        });
        
        document.addEventListener('click', this.recordActivity.bind(this));
        document.addEventListener('touchstart', this.recordActivity.bind(this));
        
        this.startInactivityMonitor();
    }
    
    recordActivity() {
        const now = Date.now();
        const timeSinceLast = now - this.lastInteractionTime;
        
        this.activityPattern.push({
            time: now,
            duration: timeSinceLast
        });
        
        if (this.activityPattern.length > 100) {
            this.activityPattern.shift();
        }
        
        this.lastInteractionTime = now;
        
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        this.startInactivityMonitor();
    }
    
    recordInactivity() {
        console.log('User inactive, screen hidden');
    }
    
    startInactivityMonitor() {
        this.inactivityTimer = setTimeout(() => {
            this.checkInactivityNotification();
        }, 30 * 60 * 1000);
    }
    
    checkInactivityNotification() {
        const data = STORAGE.getData();
        if (!data?.userProfile?.notificationEnabled) return;
        
        const now = Date.now();
        const inactiveTime = now - this.lastInteractionTime;
        
        if (inactiveTime > 45 * 60 * 1000) {
            this.suggestMicroBreak();
        }
    }
    
    suggestMicroBreak() {
        const data = STORAGE.getData();
        if (!data?.userProfile?.notificationEnabled) return;
        
        const lastSuggestion = data.userProfile.lastMicroBreakSuggestion;
        if (lastSuggestion) {
            const lastTime = new Date(lastSuggestion);
            const hoursSince = (Date.now() - lastTime.getTime()) / (1000 * 60 * 60);
            if (hoursSince < 2) return;
        }
        
        const messages = [
            "Your attention has been sustained. A 60-second reset would help.",
            "Time for a nervous system refresh.",
            "Pause. Reset. Continue.",
            "Your focus has been steady. A brief reset will enhance clarity."
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('LIMEN Pro', {
                body: randomMessage,
                icon: 'icon-192.png',
                silent: true
            });
            
            STORAGE.updateProfile('lastMicroBreakSuggestion', new Date().toISOString());
        }
    }
    
    getActivityPattern() {
        const recent = this.activityPattern.slice(-10);
        const avgInterval = recent.length > 0 
            ? recent.reduce((sum, a) => sum + a.duration, 0) / recent.length
            : 0;
        
        return {
            avgInterval,
            isHighFrequency: avgInterval < 5000,
            lastActive: this.lastInteractionTime,
            totalInteractions: this.activityPattern.length
        };
    }
    
    estimateCognitiveLoad() {
        const pattern = this.getActivityPattern();
        
        if (pattern.isHighFrequency && pattern.totalInteractions > 20) {
            return { state: 'CognitiveOverdrive', confidence: 0.6 };
        }
        
        const inactiveHours = (Date.now() - pattern.lastActive) / (1000 * 60 * 60);
        if (inactiveHours > 3) {
            return { state: 'Understimulated', confidence: 0.5 };
        }
        
        return null;
    }
}

const environmentSensor = new EnvironmentSensor();
window.environmentSensor = environmentSensor;
