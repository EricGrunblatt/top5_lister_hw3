import { React, useContext, useState } from "react";
import { GlobalStoreContext } from '../store'
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const { store } = useContext(GlobalStoreContext);
    const [draggedTo, setDraggedTo] = useState(0);
    const [ editItemActive, setEditItemActive ] = useState(false);

    function handleDragStart(event) {
        event.dataTransfer.setData("item", event.target.id);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDragEnter(event) {
        event.preventDefault();
        setDraggedTo(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDraggedTo(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("item");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        setDraggedTo(false);

        // UPDATE THE LIST
        if(sourceId !== targetId) {
            store.addMoveItemTransaction(sourceId, targetId);
        }
    }

    function handleToggleItemEdit(event) {
        if(!editItemActive) {
            event.stopPropagation();
            toggleItemEdit();
        }
    }

    function toggleItemEdit() {
        let newActive = !editItemActive;
        if (newActive) {
            store.setIsItemEditActive();
        }
        setEditItemActive(newActive);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            if(event.target.value === "" || event.target.value === " ") {
                store.addChangeItemTransaction(index, props.text, "?");
            }
            else if(props.text !== event.target.value) {
                store.addChangeItemTransaction(index, props.text, event.target.value);
            }
            toggleItemEdit();
            store.setIsItemEditInactive();
        }
    }

    function handleItemFocus(event) {
        event.target.select();
    }

    let { index } = props;
    let itemClass = "top5-item";
    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }

    let disableButtons = false;
    let draggable = true;
    if(store.isItemEditActive) {
        disableButtons = true;
        draggable = false;
    }

    if (editItemActive) {
        return (
            <input
                autoFocus
                id={"item-" + (index + 1)}
                className={itemClass}
                type='text'
                onKeyPress={handleKeyPress}
                onFocus={handleItemFocus}
                defaultValue={props.text}
                
            />
        );
    }
    return (
        <div
            id={'item-' + (index + 1)}
            className={itemClass}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggable={draggable}
        >
            <input
                disabled={disableButtons}
                type="button"
                id={"edit-item-" + index + 1}
                className="list-card-button"
                value={"\u270E"}
                onClick={handleToggleItemEdit}
            />
            {props.text}
        </div>)
}

export default Top5Item;