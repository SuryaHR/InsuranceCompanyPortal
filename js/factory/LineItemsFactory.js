angular.module('MetronicApp').factory('LineItemsFactory', function () {
    // LineItemsFactory is a factory used to manipulate data and 
    // will be injected as a Dependency injection into controllers.
    // To access data    
    var data = {
        "originalItemsList": []
    };

    var db;
    var request = window.indexedDB.open('MyDatabase', 1);
   
    request.onerror = function(event) {
    console.log('Database error: ' + event.target.errorCode);
    };
   
    request.onsuccess = function(event) {
    db = event.target.result;
    console.log('Database opened successfully');
    };
   
    request.onupgradeneeded = function(event) {
    db = event.target.result;
    var objectStore = db.createObjectStore('MyObjectStore', { keyPath: 'id' });

    // Create an index for searching
    objectStore.createIndex('name', 'name', { unique: false });
    };
    
       
        // Define functions to interact with IndexedDB
     var   addToDatabase= function(data) {
            var transaction = db.transaction(['MyObjectStore'], 'readwrite');
            var objectStore = transaction.objectStore('MyObjectStore');
            var request = objectStore.add(data);
    };

    var   getFromDatabase = function(data, callback) {
        var transaction = db.transaction(['MyObjectStore'], 'readonly');
        var objectStore = transaction.objectStore('MyObjectStore');
        // var index = objectStore.index('name');
        var request = objectStore.get(data);
        
        request.onsuccess = function() {
            callback(request.result.value);
        };
    }

    var addItemsToList = function (items, claim) {
        data = {
            "claim": claim,
            "originalItemsList": items,
        }
        // sessionStorage.setItem("postLostItems", JSON.stringify(data));
        addToDatabase({ id: 'postLostItems', value: JSON.stringify(data) });
    };
    var getItemsList = function () {
        return data;
    };
    var removeAll = function () {
        data = {};
        sessionStorage.removeItem("postLostItems");
    };
    var addUpdateItem = function (item, claimNumber) {
        if (item.claimNumber === claimNumber) {
            var index = data.originalItemsList ? data.originalItemsList.findIndex(savedItem => savedItem.id === item.id) : -1;
            if (index <= -1) {
                if (!data.originalItemsList)
                    data.originalItemsList = [];
                data.originalItemsList.push(item);
            }
            else
                data.originalItemsList[index] = angular.copy(item);
        }
        sessionStorage.removeItem("postLostItems");
        // sessionStorage.setItem("postLostItems", JSON.stringify(data));
        addToDatabase({ id: 'postLostItems', value: JSON.stringify(data) });
    };
    var removeItemFromList = function (obj) {
        var index = data.originalItemsList ? data.originalItemsList.findIndex(savedItem => savedItem.id === obj.id) : -1;
        if (index > -1) {
            data.originalItemsList.splice(index, 1)
        }
        sessionStorage.removeItem("postLostItems");
        // sessionStorage.setItem("postLostItems", JSON.stringify(data));
        addToDatabase({ id: 'postLostItems', value: JSON.stringify(data) });
    };
    var countOfItems = function () {
        return data.originalItemsList ? data.originalItemsList.length : 0;
    };
    return {
        addItemsToList: addItemsToList,
        removeItemFromList: removeItemFromList,
        getItemsList: getItemsList,
        removeAll: removeAll,
        addUpdateItem: addUpdateItem,
        countOfItems: countOfItems
    };
});