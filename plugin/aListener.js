// Object that will store the events you are listening to and the function to call when using it.
Diob.prototype.aListener = {
	'onNew': { 'counter': 1 },
	'onDel': { 'counter': 1 },
	'onTickerAdd': { 'counter': 1 },
	'onTickerRemove': { 'counter': 1 },
	'onTick': { 'counter': 1 },
	// 'onCross': { 'counter': 1 },
	'onCrossed': { 'counter': 1 },
	'onUncrossed': { 'counter': 1 },
	'onCrossedRelocated': { 'counter': 1 },
	'onBumped': { 'counter': 1 },
	'onMouseClick': { 'counter': 1 },
	'onMouseDblClick': { 'counter': 1 },
	'onMouseEnter': { 'counter': 1 },
	'onMouseExit': { 'counter': 1 },
	'onMouseMove': { 'counter': 1 },
	'onMouseDown': { 'counter': 1 },
	'onMouseUp': { 'counter': 1 },
	'onMouseWheelScrollUp': { 'counter': 1 },
	'onMouseWheelScrollDown': { 'counter': 1 },
	'onScreenShow': { 'counter': 1 },
	'onScreenHide': { 'counter': 1 },
	'onAddOverlay': { 'counter': 1 },
	'onRemoveOverlay': { 'counter': 1 },
	'onIconUpdate': { 'counter': 1 },
	'onMapChange': { 'counter': 1 },
	'onTransition': { 'counter': 1 },
	'onPacket': { 'counter': 1 },
	'onClientSyncData': { 'counter': 1 },
	'onResized': { 'counter': 1 },
	'onBump': { 'counter': 1 },
	// 'onMove': { 'counter': 1 },
	'onMoved': { 'counter': 1 },
	'onMoveStart': { 'counter': 1 },
	'onMoveEnd': { 'counter': 1 },
	'onRelocated': { 'counter': 1 },
	'onScreenMoved': { 'counter': 1 },
	'onDirUpdate': { 'counter': 1 },
	// 'onEnter': { 'counter': 1 },
	// 'onExit': { 'counter': 1 },
	'onEntered': { 'counter': 1 },
	'onExited': { 'counter': 1 },
	'onLogin': { 'counter': 1 },
	'onLogout': { 'counter': 1 },
	'onStarted': { 'counter': 1 },
	'onEnded': { 'counter': 1 },
	'onStopped': { 'counter': 1 },
	'onResumed': { 'counter': 1 },
	'onFocus': { 'counter': 1 },
	'onUnfocus': { 'counter': 1 },
	'onShow': { 'counter': 1 },
	'onHide': { 'counter': 1 },
	'onExecute': { 'counter': 1 },
	'onWindowResize': { 'counter': 1 },
	'onWindowFocus': { 'counter': 1 },
	'onWindowBlur': { 'counter': 1 },
	'onScreenRender': { 'counter': 1 },
	'onConnect': { 'counter': 1 },
	'onDisconnect': { 'counter': 1 },
	'onKeyDown': { 'counter': 1 },
	'onKeyUp': { 'counter': 1 },
	'onInterfaceLoaded': { 'counter': 1 },
	'onInterfaceShow': { 'counter': 1 },
	'onInterfaceHide': { 'counter': 1 },
};

Diob.prototype.aListenForEvents = function() {
	const self = this;
	for (let event of Object.keys(this.aListener)) {
		// If the event has the start word `on`. If it is indeed a function or if it does not exist, recreate it to be compatibile for event listeners
		if (event.match(/^on/g) && (typeof(this[event]) === 'function' || !this[event])) {
			const oldFunc = this[event];
			const newFunc = function() {
				if (oldFunc && typeof(oldFunc) === 'function') {
					oldFunc.apply(self, arguments);
				}
				for (const listener in self.aListener[event]) {
					if (typeof(self.aListener[event][listener]) === 'function') {
						self.aListener[event][listener].apply(self, arguments);
					}
				}
			}
			this[event] = newFunc;
		}
	}
}

Diob.prototype.addEventListener = function(pEventName, pFunction) {
	if (!pFunction || typeof(pFunction) !== 'function') {
		console.error('aListener: pFunction parameter is missing or it is not of the function type!');
		return;
	}
	if (Object.keys(this.aListener).includes(pEventName)) {
		this.aListener[pEventName].counter++;
		const listenerID = this.aListener[pEventName].counter;
		this.aListener[pEventName][listenerID] = pFunction;
	} else {
		console.error('aListener: Invalid event name');
	}
};

Diob.prototype.removeEventListener = function(pEventName, pFunction) {
	if (!pFunction || typeof(pFunction) !== 'function') {
		console.error('aListener: pFunction parameter is missing or it is not of the function type!');
		return;
	}
	if (Object.keys(this.aListener).includes(pEventName)) {
		for (const funcID in this.aListener[pEventName]) {
			if (this.aListener[pEventName][funcID] === pFunction) {
				delete this.aListener[pEventName][funcID];
				return;
			}
		}
		console.error('aListener: This function is not being tracked.');
	} else {
		console.error('aListener: Invalid event name');
	}
}

const onNewDefault = VS.Type.getFunction('Diob', 'onNew');
const onNewCustom = function() {
	this.aListenForEvents();
	if (onNewDefault && typeof(onNewDefault) === 'function') {
		onNewDefault.apply(this, arguments);
	}
}

VS.Type.setFunction('Diob', 'onNew', onNewCustom);
