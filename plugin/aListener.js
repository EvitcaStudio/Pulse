(() => {
	const aListener = {};
	VS.global.aListener = aListener;

	aListener.tracker = {
		'ids': []
	};

	aListener.generateID = function(pID = 7) {
		let ID = '';
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (let i = 0; i < pID; i++) {
			ID += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return ID;
	}

	aListener.addEventListener = function(pInstance, pEventName, pFunction) {
		if (typeof(pFunction) !== 'function') {
			console.error('aListener: pFunction parameter is missing or it is not of the function type!');
			return;
		}

		if (!pInstance.aListenerID) {
			let id = this.generateID();
			while (this.tracker.ids.includes(id)) {
				id = this.generateID();
			}
			pInstance.aListenerID = id;
			this.tracker.ids.push(id);
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
		let originalEvent = this[pEventName];
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
