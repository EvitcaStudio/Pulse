(() => {
	class AListener {
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
	
		addEventListener(pInstance, pEventName, pFunction) {
			if (typeof(pFunction) !== 'function') {
				console.error('AListener: pFunction parameter is missing or it is not of the function type!');
				return;
			}
	
			if (!pInstance.AListenerID) {
				const ID = this.generateID();
				pInstance.AListenerID = ID;
				this.tracker.ids.push(ID);
				this.tracker[pInstance.AListenerID] = {};
				this.tracker[pInstance.AListenerID]['listened'] = {};
			}
	
			if (!this.tracker[pInstance.AListenerID][pEventName]) this.tracker[pInstance.AListenerID][pEventName] = { 'counter': 0 };
			const listenerID = ++this.tracker[pInstance.AListenerID][pEventName].counter;
			if (!this.tracker[pInstance.AListenerID]['listened'][pEventName]) this.listenForEvent(pInstance, pEventName);
			this.tracker[pInstance.AListenerID][pEventName][listenerID] = pFunction;
			// If the event name is `onNew` then call immedietly, there is no way to capture this event
			if (pEventName === 'onNew') this.tracker[pInstance.AListenerID][pEventName][listenerID].bind(pInstance)();
		};
	
		removeEventListener(pInstance, pEventName, pFunction) {
			if (typeof(pFunction) !== 'function') {
				console.error('AListener: pFunction parameter is missing or it is not of the function type!');
				return;
			}
			for (const listenerID in this.tracker[pInstance.AListenerID][pEventName]) {
				if (this.tracker[pInstance.AListenerID][pEventName][listenerID] === pFunction) {
					delete this.tracker[pInstance.AListenerID][pEventName][listenerID];
					return;
				}
			}
			console.error('AListener: This function is not being tracked.');
		};
	
		listenForEvent(pInstance, pEventName) {
			// If there was a valid event for this type, or there was one already defined then we need to modify it to allow listening events
			let originalEvent = pInstance[pEventName];
			const listener = function() {
				if (typeof(originalEvent) === 'function') {
					originalEvent.apply(pInstance, arguments);
				}
				for (const listener in VS.global.AListener.tracker[pInstance.AListenerID][pEventName]) {
					if (typeof(VS.global.AListener.tracker[pInstance.AListenerID][pEventName][listener]) === 'function') {
						VS.global.AListener.tracker[pInstance.AListenerID][pEventName][listener].apply(pInstance, arguments);
					}
				}
			}
			pInstance[pEventName] = listener;
			this.tracker[pInstance.AListenerID]['listened'][pEventName] = true;
		};
	}
	
	const AListenerManager = new AListener();
	globalThis.AListener = AListenerManager;
	VS.global.AListener = AListenerManager;
	if (globalThis.document) console.log("%cAListener.js: ✅ AListener.js@" + AListenerManager.version, "font-family:arial;");
})();