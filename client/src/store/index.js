import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import ChangeItem_Transaction from '../transactions/ChangeItem_Transaction'
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CHANGE_ITEM_NAME: "CHANGE_ITEM_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    SET_LIST_NAME_EDIT_INACTIVE: "SET_LIST_NAME_EDIT_INACTIVE",
    SET_ITEM_NAME_EDIT_ACTIVE: "SET_ITEM_NAME_EDIT_ACTIVE",
    SET_ITEM_NAME_EDIT_INACTIVE: "SET_ITEM_NAME_EDIT_INACTIVE",
    LIST_MARKED_FOR_DELETION: "LIST_MARKED_FOR_DELETION",
    DELETE_LIST: "DELETE_LIST",
    CREATE_LIST: "CREATE_LIST"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: localStorage.getItem("newListCounter"),
        listNameActive: false,
        itemActive: false,
        listMarkedForDeletion: null,
        disableUndo: true,
        disableRedo: true
    });
    if(store.newListCounter === null) {
        store.newListCounter = 0;
    }
    localStorage.setItem("newListCounter", store.newListCounter);

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_LIST: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                })
            }
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_INACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // START EDITING AN ITEM
            case GlobalStoreActionType.SET_ITEM_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: true,
                    listMarkedForDeletion: null
                });
            }
            // STOP EDITING AN ITEM
            case GlobalStoreActionType.SET_ITEM_NAME_EDIT_INACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // START DELETING A LIST
            case GlobalStoreActionType.LIST_MARKED_FOR_DELETION: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: payload
                })
            }
            // WHILE DELETING THE LIST
            case GlobalStoreActionType.DELETE_LIST: {
                return setStore({
                    idNamePairs: payload,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: store.listMarkedForDeletion
                })
            }
            default:
                return store;
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                top5List.name = newName;
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List);
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray
                                    }
                                });
                            }
                        }
                        getListPairs(top5List);
                    }
                }
                updateList(top5List);
            }
        }
        asyncChangeListName(id);
        store.setCurrentList(null);
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions();
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getTop5ListPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
    }
    store.addChangeItemTransaction = function (id, start, end) {
        let transaction = new ChangeItem_Transaction(store, id, start, end);
        tps.addTransaction(transaction);
    }
    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    store.changeItem = function (id, text) {
        this.currentList.items[id] = text;
        store.updateCurrentList();
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        if(!store.isItemEditActive) {
            tps.undoTransaction();
        }
    }
    store.redo = function () {
        if(!store.isItemEditActive) {
            tps.doTransaction();
        }
        
    }

    store.disableButtons = function () {
        if(tps.hasTransactionToRedo()) {
            store.disableRedo = false;
        }
        else {
            store.disableRedo = true;
        }

        if(tps.hasTransactionToUndo()) {
            store.disableUndo = false;
        }
        else {
            store.disableUndo = true;
        }
    }

    store.getListMarkedForDeletion = function (list) {
        storeReducer({
            type: GlobalStoreActionType.LIST_MARKED_FOR_DELETION,
            payload: list
        })
        store.showDeleteListModal();
    }

    store.deleteMarkedList = function (id) {
        // Get the correct list
        async function asyncDeleteListById(id) {
            await api.deleteTop5ListById(id).then(() => {
                async function asyncGetNewListPairs() {
                    await api.getTop5ListPairs().then(response => {
                        let pairsArray = response.data.idNamePairs;
                        storeReducer({
                            type: GlobalStoreActionType.DELETE_LIST,
                            payload: pairsArray
                        });
                    });
                }
                asyncGetNewListPairs();
            });
        }
        asyncDeleteListById(id);
    }

    store.createNewList = function () {
        // Create a new list
        let counter = localStorage.getItem("newListCounter");
        let listString = '{"name": "Untitled'+counter+'", "items": ["?", "?", "?", "?", "?"]}';
        store.newListCounter++;
        localStorage.setItem("newListCounter", store.newListCounter);
        let newList = JSON.parse(listString);
        let current = null;
        async function asyncCreateList(newList) {
            let response = await api.createTop5List(newList);
            current = response.data.top5List._id;
            if(response.data.success) {
                async function asyncGetNewListPairs() {
                    response = await api.getTop5ListPairs();
                    if(response.data.success) {
                        let pairsArray = response.data.idNamePairs;
                        storeReducer({
                            type: GlobalStoreActionType.CREATE_LIST,
                            payload: {
                                idNamePairs: pairsArray
                            }
                        })
                        store.listMarkedForEditing = current;
                        store.setCurrentList(current);
                    }
                }
                asyncGetNewListPairs();
            }
        }
        asyncCreateList(newList);
    }

    window.onload = function() {
        store.closeCurrentList();
    }

    store.showDeleteListModal = function () {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }

    store.hideDeleteListModal = function () {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }
    store.setIsListNameEditInactive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_INACTIVE,
            payload: null
        });
    }
    store.setIsItemEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_ITEM_NAME_EDIT_ACTIVE,
            payload: null
        })
    }
    store.setIsItemEditInactive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_ITEM_NAME_EDIT_INACTIVE,
            payload: null
        })
    }

    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}