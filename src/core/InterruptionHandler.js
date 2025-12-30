// core/InterruptionHandler.js - Handle user interruptions during automated actions
// When user manually intervenes, treat their action as "finishing" the current automated action

export class InterruptionHandler {
  constructor() {
    // Current automated action
    this.currentAction = null; // { type, startTime, endTime, config }
    this.actionHistory = [];

    // Interruption callbacks
    this.onInterruption = null;
  }

  /**
   * Register an automated action
   * @param {string} type - 'ad_break' | 'scheduled_play' | 'scheduled_pause'
   * @param {object} config - Action configuration
   */
  registerAction(type, config = {}) {
    const action = {
      type,
      config,
      startTime: Date.now(),
      endTime: config.duration ? Date.now() + (config.duration * 60 * 1000) : null,
      isActive: true,
      wasInterrupted: false
    };

    this.currentAction = action;
    console.log(`📋 InterruptionHandler: Registered action - ${type}`, config);

    return action;
  }

  /**
   * User manually changed something - handle interruption
   * @param {string} actionType - 'station_select' | 'mode_switch' | 'volume_change' | 'pause' | 'play'
   * @param {object} details - Details about the user action
   */
  handleUserAction(actionType, details = {}) {
    if (!this.currentAction || !this.currentAction.isActive) {
      // No active automated action, user action is standalone
      console.log(`👤 InterruptionHandler: User action (no interruption) - ${actionType}`);
      return {
        wasInterrupted: false,
        action: null
      };
    }

    // User interrupted an automated action
    const interruptedAction = this.currentAction;
    console.log(`⚠️ InterruptionHandler: User interrupted ${interruptedAction.type} with ${actionType}`);

    // Mark action as finished/interrupted
    this.finishCurrentAction(true);

    // Call interruption callback if set
    if (this.onInterruption) {
      this.onInterruption({
        interruptedAction,
        userAction: {
          type: actionType,
          details,
          timestamp: Date.now()
        }
      });
    }

    return {
      wasInterrupted: true,
      action: interruptedAction
    };
  }

  /**
   * Finish the current automated action
   * @param {boolean} wasInterrupted - Whether it was interrupted by user
   */
  finishCurrentAction(wasInterrupted = false) {
    if (!this.currentAction) return;

    this.currentAction.isActive = false;
    this.currentAction.wasInterrupted = wasInterrupted;
    this.currentAction.endTime = Date.now();

    // Move to history
    this.actionHistory.push(this.currentAction);

    // Keep only last 10 actions in history
    if (this.actionHistory.length > 10) {
      this.actionHistory.shift();
    }

    console.log(`✅ InterruptionHandler: Action finished - ${this.currentAction.type} (interrupted: ${wasInterrupted})`);

    this.currentAction = null;
  }

  /**
   * Check if there's an active automated action
   */
  hasActiveAction() {
    return this.currentAction !== null && this.currentAction.isActive;
  }

  /**
   * Get current active action
   */
  getCurrentAction() {
    return this.currentAction;
  }

  /**
   * Get action type (if any)
   */
  getCurrentActionType() {
    return this.currentAction ? this.currentAction.type : null;
  }

  /**
   * Check if a specific type of action is active
   */
  isActionActive(type) {
    return this.currentAction?.type === type && this.currentAction?.isActive;
  }

  /**
   * Cancel current action without marking as interrupted
   */
  cancelCurrentAction() {
    if (!this.currentAction) return;

    console.log(`🚫 InterruptionHandler: Canceling action - ${this.currentAction.type}`);
    this.finishCurrentAction(false);
  }

  /**
   * Get time remaining for current action (in seconds)
   */
  getTimeRemaining() {
    if (!this.currentAction || !this.currentAction.endTime) {
      return null;
    }

    const remaining = Math.max(0, this.currentAction.endTime - Date.now());
    return Math.ceil(remaining / 1000);
  }

  /**
   * Extend current action by specified seconds
   */
  extendCurrentAction(seconds) {
    if (!this.currentAction || !this.currentAction.endTime) {
      console.warn('⚠️ InterruptionHandler: No action to extend');
      return false;
    }

    this.currentAction.endTime += (seconds * 1000);
    console.log(`⏰ InterruptionHandler: Extended action by ${seconds}s`);
    return true;
  }

  /**
   * Set callback for when interruption occurs
   */
  setInterruptionCallback(callback) {
    this.onInterruption = callback;
  }

  /**
   * Get recent action history
   */
  getHistory() {
    return [...this.actionHistory];
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.actionHistory = [];
  }

  /**
   * Get status summary
   */
  getStatus() {
    return {
      hasActiveAction: this.hasActiveAction(),
      currentActionType: this.getCurrentActionType(),
      timeRemaining: this.getTimeRemaining(),
      historyCount: this.actionHistory.length
    };
  }

  /**
   * Reset everything
   */
  reset() {
    this.currentAction = null;
    this.actionHistory = [];
    console.log('🔄 InterruptionHandler: Reset');
  }
}

export default InterruptionHandler;
