(() => {
	const aListener = {};
	VS.global.aListener = aListener;

	aListener.addEventListener = function(pInstance, pEventName, pFunction) {
		if (!pFunction || typeof(pFunction) !== 'function') {
			console.error('aListener: pFunction parameter is missing or it is not of the function type!');
			return;
		}
		if (!pInstance.aListener) pInstance.aListener = {};
		if (!pInstance.aListener[pEventName]) pInstance.aListener[pEventName] = { 'counter': 0 };
		if (!pInstance.aListened) pInstance.aListened = {};
		if (!pInstance.aListened[pEventName]) this.listenForEvent(pInstance, pEventName);
		const listenerID = pInstance.aListener[pEventName].counter++;
		pInstance.aListener[pEventName][listenerID] = pFunction;
		// If the event name is `onNew` then call immedietly, there is no way to capture this event
		if (pEventName === 'onNew') pInstance.aListener[pEventName][listenerID].bind(pInstance)();
	};

	aListener.removeEventListener = function(pInstance, pEventName, pFunction) {
		if (!pFunction || typeof(pFunction) !== 'function') {
			console.error('aListener: pFunction parameter is missing or it is not of the function type!');
			return;
		}
		for (const listenerID in pInstance.aListener[pEventName]) {
			if (pInstance.aListener[pEventName][listenerID] === pFunction) {
				delete pInstance.aListener[pEventName][listenerID];
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
			for (const listener in pInstance.aListener[pEventName]) {
				if (typeof(pInstance.aListener[pEventName][listener]) === 'function') {
					pInstance.aListener[pEventName][listener].apply(pInstance, arguments);
				}
			}
		}
		pInstance[pEventName] = listener;
		pInstance.aListened[pEventName] = true;
	};
})();
