(() => {
	class EListener {
		constructor() {
			this.tracker = { 'ids': [] };
			this.storedIDs = [];
			// The version of this library
			this.version = '1.0.0';	
		}

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
			while(this.storedIDs.includes(ID)) {
				ID = makeID();
			}
			this.storedIDs.push(ID);
			return ID;
		}
	
		on(pInstance, pEventName, pFunction) {
			if (typeof(pFunction) !== 'function') {
				console.error('EListener: pFunction parameter is missing or it is not of the function type!');
				return;
			}
	
			if (!pInstance.EListenerID) {
				const ID = this.generateID();
				pInstance.EListenerID = ID;
				this.tracker.ids.push(ID);
				this.tracker[pInstance.EListenerID] = {};
				this.tracker[pInstance.EListenerID]['listened'] = {};
			}
	
			if (!this.tracker[pInstance.EListenerID][pEventName]) this.tracker[pInstance.EListenerID][pEventName] = { 'counter': 0 };
			const listenerID = ++this.tracker[pInstance.EListenerID][pEventName].counter;
			if (!this.tracker[pInstance.EListenerID]['listened'][pEventName]) this.listenForEvent(pInstance, pEventName);
			this.tracker[pInstance.EListenerID][pEventName][listenerID] = pFunction;
			// If the event name is `onNew` then call immedietly, there is no way to capture this event
			if (pEventName === 'onNew') this.tracker[pInstance.EListenerID][pEventName][listenerID].bind(pInstance)();
		};
	
		off(pInstance, pEventName, pFunction) {
			if (typeof(pFunction) !== 'function') {
				console.error('EListener: pFunction parameter is missing or it is not of the function type!');
				return;
			}
			for (const listenerID in this.tracker[pInstance.EListenerID][pEventName]) {
				if (this.tracker[pInstance.EListenerID][pEventName][listenerID] === pFunction) {
					delete this.tracker[pInstance.EListenerID][pEventName][listenerID];
					return;
				}
			}
			console.error('EListener: This function is not being tracked.');
		};
	
		listenForEvent(pInstance, pEventName) {
			// If there was a valid event for this type, or there was one already defined then we need to modify it to allow listening events
			let originalEvent = pInstance[pEventName];
			const listener = function() {
				if (typeof(originalEvent) === 'function') {
					originalEvent.apply(pInstance, arguments);
				}
				for (const listener in VYLO.global.EListener.tracker[pInstance.EListenerID][pEventName]) {
					if (typeof(VYLO.global.EListener.tracker[pInstance.EListenerID][pEventName][listener]) === 'function') {
						VYLO.global.EListener.tracker[pInstance.EListenerID][pEventName][listener].apply(pInstance, arguments);
					}
				}
			}
			pInstance[pEventName] = listener;
			this.tracker[pInstance.EListenerID]['listened'][pEventName] = true;
		};
	}
	
	const EListenerManager = new EListener();
	globalThis.EListener = EListenerManager;
	VYLO.global.EListener = EListenerManager;
	if (globalThis.document) console.log("%cEListener.js: ✅ EListener.js@" + EListenerManager.version, "font-family:arial;");
})();
