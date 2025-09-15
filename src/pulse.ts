// @ts-ignore - Logger is a vendor file without types
import { Logger } from './vendor/logger.min.mjs';

/** 
 * @file A plugin that allows you to add event listeners on objects. Have your code called alongside an event!
 * 
 * @author https://github.com/doubleactii
 * @license Pulse is free software, available under the terms of a MIT style License.
 */
class PulseComponent {
	/**
	 * Array that tracks events for instances
	 * @type {Array}
	 */
	static tracker: { ids: string[]; [key: string]: any } = { 'ids': [] };
	/**
	 * Array of stored IDs so that multiple of the same ID cannot be claimed
	 * @type {Array}
	 */
	static storedIDs: string[] = [];
	/**
	 * Weakmap to track data belonging to instances used in this module.
	 * @type {WeakMap}
	 */
	instanceWeakMap = new WeakMap<object, string>();
	/**
	 * The version of the module.
	 */
	version = "VERSION_REPLACE_ME";
	/**
	 * The logger module this module uses to log errors / logs
	 * @type {Object}
	 */
	private logger: any;

	constructor() {
		this.logger = new Logger();
        this.logger.registerType('PulseComponent-Module', '#ff6600');
	}
	
	/**
	 * Generates a random ID based on the specified length and ensures its uniqueness
	 * within the stored IDs.
	 * @param {number} [pID = 7] - The length of the generated ID.
	 * @returns {string} A unique random ID.
	 */
	generateID(pID: number = 7): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const makeID = function(): string {
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
	on(pInstance: any, pEventName: string, pFunction: Function): void {
		if (!pInstance) {
			this.logger.prefix('PulseComponent-Module').error('pInstance not passed.');
			return;
		}
		if (!pEventName) {
			this.logger.prefix('PulseComponent-Module').error('pEventName not passed.');
			return;
		}
		if (typeof(pFunction) !== 'function') {
			this.logger.prefix('PulseComponent-Module').error('pFunction argument is missing or it is not of the function type!');
			return;
		}

		// Get the data stored for this instance
		let pulseComponentListenerID = this.instanceWeakMap.get(pInstance);
		// If it couldn't get any data stored, we need to generate an ID and store it
		if (!pulseComponentListenerID) {
			const ID = this.generateID();
			pulseComponentListenerID = ID;
			this.instanceWeakMap.set(pInstance, pulseComponentListenerID);
			PulseComponent.tracker.ids.push(pulseComponentListenerID);
			PulseComponent.tracker[pulseComponentListenerID] = {};
			PulseComponent.tracker[pulseComponentListenerID]['listened'] = {};
		}
		if (!PulseComponent.tracker[pulseComponentListenerID][pEventName]) PulseComponent.tracker[pulseComponentListenerID][pEventName] = { 'counter': 0 };
		const listenerID = ++PulseComponent.tracker[pulseComponentListenerID][pEventName].counter;
		if (!PulseComponent.tracker[pulseComponentListenerID]['listened'][pEventName]) this.listenForEvent(pInstance, pEventName);
		PulseComponent.tracker[pulseComponentListenerID][pEventName][listenerID] = pFunction;
		// If the event name is `onNew` then call immedietly, there is no way to capture this event
		if (pEventName === 'onNew') PulseComponent.tracker[pulseComponentListenerID][pEventName][listenerID].bind(pInstance)();
	};

	/**
	 * Removes an event listener function from pInstance
	 * 
	 * @param {Object} pInstance - The instance to remove the event listener from
	 * @param {string} pEventName - The name of the event to remove
	 * @param {Function} pFunction - The function to be removed
	 */
	off(pInstance: any, pEventName: string, pFunction: Function): void {
		if (!pInstance) {
			this.logger.prefix('PulseComponent-Module').error('pInstance not passed.');
			return;
		}
		if (!pEventName) {
			this.logger.prefix('PulseComponent-Module').error('pEventName not passed.');
			return;
		}
		if (typeof(pFunction) !== 'function') {
			this.logger.prefix('PulseComponent-Module').error('pFunction argument is missing or it is not of the function type!');
			return;
		}
		// Get the data stored for this instance
		const pulseComponentListenerID = this.instanceWeakMap.get(pInstance);
		// No event can be removed from this instance as its not even being tracked
		if (!pulseComponentListenerID) return;

		for (const listenerID in PulseComponent.tracker[pulseComponentListenerID][pEventName]) {
			if (PulseComponent.tracker[pulseComponentListenerID][pEventName][listenerID] === pFunction) {
				delete PulseComponent.tracker[pulseComponentListenerID][pEventName][listenerID];
				return;
			}
		}
		this.logger.prefix('PulseComponent-Module').error('This function is not being tracked.');
	};

	/**
	 * Listens for an event on an instance. Preserves any original event function code, while also allowing multiple event listeners to call on the same event.
	 * @param {Object} pInstance - The instance that has the event
	 * @param {string} pEventName - The event name to listen for
	 */
	listenForEvent(pInstance: any, pEventName: string): void {
		// If there was a valid event for this type, or there was one already defined then we need to modify it to allow listening events
		let originalEvent = pInstance[pEventName];
		// Get the data stored for this instance
		const pulseComponentListenerID = this.instanceWeakMap.get(pInstance);
		if (!pulseComponentListenerID) return;
		
		const listener = function(this: any) {
			if (typeof(originalEvent) === 'function') {
				originalEvent.apply(pInstance, arguments);
			}
			// Loop the event name in the tracker to see if multiple events have been registered, if so we need to call each event when this event is dispatched.
			const eventTracker = PulseComponent.tracker[pulseComponentListenerID][pEventName];
			if (eventTracker) {
				for (const listener in eventTracker) {
					if (typeof(eventTracker[listener]) === 'function') {
						eventTracker[listener].apply(pInstance, arguments);
					}
				}
			}
		}
		pInstance[pEventName] = listener;
		PulseComponent.tracker[pulseComponentListenerID]['listened'][pEventName] = true;
	};
}

export const Pulse = new PulseComponent();
export { PulseComponent };
