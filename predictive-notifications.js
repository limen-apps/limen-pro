// predictive-notifications.js
class PredictiveNotifications {
    constructor() {
        this.checkInterval = null;
        this.lastCheck = null;
    }
    
    start() {
        // Check every hour for predictive notifications
        this.checkInterval = setInterval(() => {
            this.checkForPredictiveNotification();
        }, 60 * 60 * 1000); // 1 hour
        
        // Initial check after 5 minutes
        setTimeout(() => this.checkForPredictiveNotification(), 5 * 60 * 1000);
    }
    
    async checkForPredictiveNotification() {
        if (!window.predictiveEngine || !window.STORAGE) return;
        
        const shouldNotify = await this.shouldSendNotification();
        if (shouldNotify) {
            this.sendPredictiveNotification();
        }
        
        this.lastCheck = new Date();
    }
    
    async shouldSendNotification() {
        // Check if user is likely to need intervention soon
        if (!window.predictiveEngine) return false;
        
        const insight = window.predictiveEngine.getPredictiveInsight();
        if (!insight.available || insight.confidence < 0.7) return false;
        
        // Check last notification time
        const history = STORAGE.getSessionHistory(1); // Last day
        const recentNotifications = history.filter(s => s.type === 'predictive_notification');
        if (recentNotifications.length >= 2) return false; // Max 2 per day
        
        // Check last session time
        const lastSession = history.filter(s => s.feedback).slice(-1)[0];
        if (lastSession) {
            const lastSessionTime = new Date(lastSession.timestamp);
            const hoursSince = (Date.now() - lastSessionTime) / (1000 * 60 * 60);
            if (hoursSince < 2) return false; // Had session recently
        }
        
        return true;
    }
    
    sendPredictiveNotification() {
        if (!window.predictiveEngine) return;
        
        const insight = window.predictiveEngine.getPredictiveInsight();
        const stateName = getStateDisplayName(insight.state);
        const confidence = Math.round(insight.confidence * 100);
        
        const messages = [
            `LIMEN Pro predicts ${stateName} (${confidence}% confidence). Preemptive regulation can help maintain baseline.`,
            `Based on your patterns, ${stateName.toLowerCase()} may occur soon. A brief intervention now could prevent escalation.`,
            `Your nervous system shows patterns suggesting ${stateName.toLowerCase()}. Consider a preemptive reset.`,
            `Predictive insight: ${stateName} likely within next few hours. Proactive regulation recommended.`
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('LIMEN Pro Predictive', {
                body: randomMessage,
                icon: 'icon-192.png',
                badge: 'icon-192.png',
                tag: 'limen-predictive',
                silent: true,
                requireInteraction: false
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
                if (window.app) {
                    window.app.showScreen('state');
                }
            };
            
            // Log the notification
            const notificationRecord = {
                type: 'predictive_notification',
                timestamp: new Date().toISOString(),
                predictedState: insight.state,
                confidence: insight.confidence,
                message: randomMessage
            };
            
            STORAGE.addSession(notificationRecord);
            
            return true;
        }
        
        return false;
    }
    
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

// Initialize
let predictiveNotifications = null;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        predictiveNotifications = new PredictiveNotifications();
        predictiveNotifications.start();
        window.predictiveNotifications = predictiveNotifications;
    }, 10000); // Start after 10 seconds
});

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden && predictiveNotifications) {
        // Page hidden, check if we should send notification
        setTimeout(() => {
            if (predictiveNotifications) {
                predictiveNotifications.checkForPredictiveNotification();
            }
        }, 60000); // Check after 1 minute of inactivity
    }
});
