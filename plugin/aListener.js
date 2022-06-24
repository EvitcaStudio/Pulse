(() => {
	const aListener = {};
	VS.global.aListener = aListener;

	aListener.tracker = {
		'ids': []
	};

	aListener.storedIDs = [];

	aListener.generateID = function(pID = 7) {
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

	aListener.addEventListener = function(pInstance, pEventName, pFunction) {
		if (typeof(pFunction) !== 'function') {
			console.error('aListener: pFunction parameter is missing or it is not of the function type!');
			return;
		}

		if (!pInstance.aListenerID) {
			const ID = this.generateID();
			pInstance.aListenerID = ID;
			this.tracker.ids.push(ID);
			this.tracker[pInstance.aListenerID] = {};
			this.tracker[pInstance.aListenerID]['listened'] = {};
		}

		if (!this.tracker[pInstance.aListenerID][pEventName]) this.tracker[pInstance.aListenerID][pEventName] = { 'counter': 0 };
		const listenerID = ++this.tracker[pInstance.aListenerID][pEventName].counter;
		if (!this.tracker[pInstance.aListenerID]['listened'][pEventName]) this.listenForEvent(pInstance, pEventName);
		this.tracker[pInstance.aListenerID][pEventName][listenerID] = pFunction;
		// If the event name is `onNew` then call immedietly, there is no way to capture this event
		if (pEventName === 'onNew') this.tracker[pInstance.aListenerID][pEventName][listenerID].bind(pInstance)();
	};

	aListener.removeEventListener = function(pInstance, pEventName, pFunction) {
		if (typeof(pFunction) !== 'function') {
			console.error('aListener: pFunction parameter is missing or it is not of the function type!');
			return;
		}
		for (const listenerID in this.tracker[pInstance.aListenerID][pEventName]) {
			if (this.tracker[pInstance.aListenerID][pEventName][listenerID] === pFunction) {
				delete this.tracker[pInstance.aListenerID][pEventName][listenerID];
				return;
			}
		}
		console.error('aListener: This function is not being tracked.');
	};

	aListener.listenForEvent = function(pInstance, pEventName) {
		// If there was a valid event for this type, or there was one already defined then we need to modify it to allow listening events
		let originalEvent = pInstance[pEventName];
		const listener = function() {
			if (originalEvent && typeof(originalEvent) === 'function') {
				originalEvent.apply(pInstance, arguments);
			}
			for (const listener in VS.global.aListener.tracker[pInstance.aListenerID][pEventName]) {
				if (typeof(VS.global.aListener.tracker[pInstance.aListenerID][pEventName][listener]) === 'function') {
					VS.global.aListener.tracker[pInstance.aListenerID][pEventName][listener].apply(pInstance, arguments);
				}
			}
		}
		pInstance[pEventName] = listener;
		this.tracker[pInstance.aListenerID]['listened'][pEventName] = true;
	};
})();
