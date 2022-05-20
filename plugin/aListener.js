(() => {
	const aListener = {};
	VS.global.aListener = aListener;

	aListener.addEventListener = function(pInstance, pEventName, pFunction) {
		if (!pFunction || typeof(pFunction) !== 'function') {
			console.error('aListener: pFunction parameter is missing or it is not of the function type!');
			return;
		}
		if (!pInstance.aListener) pInstance.aListener = Object.assign(this.events, {});
		if (!pInstance.aListener[pEventName]) pInstance.aListener[pEventName] = { 'counter': 0 };
		const listenerID = pInstance.aListener[pEventName].counter++;
		if (!pInstance.aListened) pInstance.aListened = {};
		if (!pInstance.aListened[pEventName]) this.listenForEvent(pInstance, pEventName);
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

	// Object that will store the events you are listening to and the function to call when using it.
	aListener.events = {
		// 'onNew': { 'counter': 0 },
		'onDel': { 'counter': 0 },
		'onTickerAdd': { 'counter': 0 },
		'onTickerRemove': { 'counter': 0 },
		'onTick': { 'counter': 0 },
		// 'onCross': { 'counter': 0 },
		'onCrossed': { 'counter': 0 },
		'onUncrossed': { 'counter': 0 },
		'onCrossedRelocated': { 'counter': 0 },
		'onBumped': { 'counter': 0 },
		'onMouseClick': { 'counter': 0 },
		'onMouseDblClick': { 'counter': 0 },
		'onMouseEnter': { 'counter': 0 },
		'onMouseExit': { 'counter': 0 },
		'onMouseMove': { 'counter': 0 },
		'onMouseDown': { 'counter': 0 },
		'onMouseUp': { 'counter': 0 },
		'onMouseWheelScrollUp': { 'counter': 0 },
		'onMouseWheelScrollDown': { 'counter': 0 },
		'onScreenShow': { 'counter': 0 },
		'onScreenHide': { 'counter': 0 },
		'onAddOverlay': { 'counter': 0 },
		'onRemoveOverlay': { 'counter': 0 },
		'onIconUpdate': { 'counter': 0 },
		'onMapChange': { 'counter': 0 },
		'onTransition': { 'counter': 0 },
		'onPacket': { 'counter': 0 },
		'onClientSyncData': { 'counter': 0 },
		'onResized': { 'counter': 0 },
		'onBump': { 'counter': 0 },
		// 'onMove': { 'counter': 0 },
		'onMoved': { 'counter': 0 },
		'onMoveStart': { 'counter': 0 },
		'onMoveEnd': { 'counter': 0 },
		'onRelocated': { 'counter': 0 },
		'onScreenMoved': { 'counter': 0 },
		'onDirUpdate': { 'counter': 0 },
		// 'onEnter': { 'counter': 0 },
		// 'onExit': { 'counter': 0 },
		'onEntered': { 'counter': 0 },
		'onExited': { 'counter': 0 },
		'onLogin': { 'counter': 0 },
		'onLogout': { 'counter': 0 },
		'onStarted': { 'counter': 0 },
		'onEnded': { 'counter': 0 },
		'onStopped': { 'counter': 0 },
		'onResumed': { 'counter': 0 },
		'onFocus': { 'counter': 0 },
		'onUnfocus': { 'counter': 0 },
		'onShow': { 'counter': 0 },
		'onHide': { 'counter': 0 },
		'onExecute': { 'counter': 0 },
		'onWindowResize': { 'counter': 0 },
		'onWindowFocus': { 'counter': 0 },
		'onWindowBlur': { 'counter': 0 },
		'onScreenRender': { 'counter': 0 },
		'onConnect': { 'counter': 0 },
		'onDisconnect': { 'counter': 0 },
		'onKeyDown': { 'counter': 0 },
		'onKeyUp': { 'counter': 0 },
		'onInterfaceLoaded': { 'counter': 0 },
		'onInterfaceShow': { 'counter': 0 },
		'onInterfaceHide': { 'counter': 0 },
		// Add event functions for libraries
	};
})();
