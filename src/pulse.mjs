import { Logger } from './vendor/logger.min.mjs';

class PulseComponent {
	/**
	 * Array that tracks events for instances
	 * @private
	 * @type {Array}
	 */
	static tracker = { 'ids': [] };
	/**
	 * Array of stored IDs so that multiple of the same ID cannot be claimed
	 * @private
	 * @type {Array}
	 */
	static storedIDs = [];

	constructor() {
		/**
		 * The logger module this module uses to log errors / logs
		 * @private
		 * @type {Object}
		 */
		this.logger = new Logger();
        this.logger.registerType('PulseComponent-Module', this.logger.FG_BLUE);
        this.logger.prefix('PulseComponent-Module').log('PulseComponent module loaded');
	}
	
	/**
	 * Generates a random ID based on the specified length and ensures its uniqueness
	 * within the stored IDs.
	 * @private
	 * @param {number} [pID = 7] - The length of the generated ID.
	 * @returns {string} A unique random ID.
	 */
	generateID(pID = 7) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const makeID = function() {
			let ID = '';
			for (let i = 0; i < pID; i++) {
				ID += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			return ID;
		}
		let ID = makeID();
		while(PulseComponent.storedIDs.includes(ID)) {
			ID = makeID();
		}
		PulseComponent.storedIDs.push(ID);
		return ID;
	}
	/**
	 * Adds an event listener function to pInstance to call whenever pEventName is called
	 * 
	 * @param {Object} pInstance - The instance to add an event listener to
	 * @param {string} pEventName - The name of the event to add the listener to
	 * @param {Function} pFunction - The function to be called when this event is called
	 */
	on(pInstance, pEventName, pFunction) {
		if (typeof(pFunction) !== 'function') {
			this.logger.prefix('PulseComponent-Module').error('pFunction argument is missing or it is not of the function type!');
			return;
		}

		if (!pInstance.pulseComponentListenerID) {
			const ID = this.generateID();
			pInstance.pulseComponentListenerID = ID;
			PulseComponent.tracker.ids.push(ID);
			PulseComponent.tracker[pInstance.pulseComponentListenerID] = {};
			PulseComponent.tracker[pInstance.pulseComponentListenerID]['listened'] = {};
		}

		if (!PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName]) PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName] = { 'counter': 0 };
		const listenerID = ++PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName].counter;
		if (!PulseComponent.tracker[pInstance.pulseComponentListenerID]['listened'][pEventName]) this.listenForEvent(pInstance, pEventName);
		PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName][listenerID] = pFunction;
		// If the event name is `onNew` then call immedietly, there is no way to capture this event
		if (pEventName === 'onNew') PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName][listenerID].bind(pInstance)();
	};

	/**
	 * Removes an event listener function from pInstance
	 * 
	 * @param {Object} pInstance - The instance to remove the event listener from
	 * @param {string} pEventName - The name of the event to remove
	 * @param {Function} pFunction - The function to be removed
	 */
	off(pInstance, pEventName, pFunction) {
		if (typeof(pFunction) !== 'function') {
			this.logger.prefix('PulseComponent-Module').error('pFunction argument is missing or it is not of the function type!');
			return;
		}
		for (const listenerID in PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName]) {
			if (PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName][listenerID] === pFunction) {
				delete PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName][listenerID];
				return;
			}
		}
		this.logger.prefix('PulseComponent-Module').error('This function is not being tracked.');
	};

	/**
	 * Listens for an event on an instance. Preserves any original event function code, while also allowing multiple event listeners to call on the same event.
	 * @private
	 * @param {Object} pInstance - The instance that has the event
	 * @param {string} pEventName - The event name to listen for
	 */
	listenForEvent(pInstance, pEventName) {
		// If there was a valid event for this type, or there was one already defined then we need to modify it to allow listening events
		let originalEvent = pInstance[pEventName];
		const listener = function() {
			if (typeof(originalEvent) === 'function') {
				originalEvent.apply(pInstance, arguments);
			}
			// Loop the event name in the tracker to see if multiple events have been registered, if so we need to call each event when this event is dispatched.
			for (const listener in PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName]) {
				if (typeof(PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName][listener]) === 'function') {
					PulseComponent.tracker[pInstance.pulseComponentListenerID][pEventName][listener].apply(pInstance, arguments);
				}
			}
		}
		pInstance[pEventName] = listener;
		PulseComponent.tracker[pInstance.pulseComponentListenerID]['listened'][pEventName] = true;
	};
}

export const Pulse = new PulseComponent();
