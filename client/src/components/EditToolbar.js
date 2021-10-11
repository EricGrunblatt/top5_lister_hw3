import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { useHistory } from 'react-router-dom'
/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();

    let enabledButtonClass = "top5-button";
    function handleUndo() {
        store.undo();
    }
    function handleRedo() {
        store.redo();
    }
    function handleClose() {
        history.push("/");
        store.closeCurrentList();
    }
    let editStatus = false;
    let disableUndo = "";
    let disableRedo = "";
    store.disableButtons();
    if(store.disableUndo) {
        disableUndo = "-disabled";
    }
    if(store.disableRedo) {
        disableRedo = "-disabled";
    }
    if (store.isItemEditActive || store.isListNameEditActive) {
        editStatus = true;
    }
    let disableClose = "";
    if (store.currentList === null) {
        disableUndo = "-disabled";
        disableRedo = "-disabled";
        disableClose = "-disabled";
    }
    return (
        <div id="edit-toolbar">
            <div
                disabled={editStatus}
                id='undo-button'
                onClick={handleUndo}
                className={enabledButtonClass+disableUndo}>
                &#x21B6;
            </div>
            <div
                disabled={editStatus}
                id='redo-button'
                onClick={handleRedo}
                className={enabledButtonClass+disableRedo}>
                &#x21B7;
            </div>
            <div
                disabled={editStatus}
                id='close-button'
                onClick={handleClose}
                className={enabledButtonClass+disableClose}>
                &#x24E7;
            </div>
        </div>
    )
}

export default EditToolbar;