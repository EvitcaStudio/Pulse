# EListener
A plugin that allows you to add event listeners on objects. Have your code called alongside an event!

## Implementation 

### `CLIENT-SIDE`  
#### #INCLUDE SCRIPT elistener.min.js  
### `SERVER-SIDE` 
#### #INCLUDE SERSCRIPT elistener.min.js  

## How to reference  
### `Javascript`
#### EListener|VS.global.EListener  
  
### `VyScript`  
#### EListener

## API   

###  EListener.on(pInstance, pEventName, pFunction)
   - `pInstance`: The instance to add an event listener to  
   - `pEventName`: The name of the event to add the listener to  
   - `pFunction`: The function to be called when this event is called  
   - `desc`: Adds an event listener function to `pInstance` to call whenever `pEventName` is called  

###  EListener.off(pInstance, pEventName, pFunction)   
   - `pInstance`: The instance to remove the event listener from  
   - `pEventName`: The name of the event to remove  
   - `pFunction`: The function to be removed  
   - `desc`: Removes an event listener function from `pInstance`   

