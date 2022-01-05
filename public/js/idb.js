//variable to hold db connection
let db;
//connection to IndexedDB database called 'anytime_budget_19' and set it to version 1
const request = indexedDB.open("anytime_budget_19", 1);

// this event will emit if the database version changes ( nonexistant to version 1, v1 to v2, etc. )
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.online) {
    uploadTransaction();
  }
};
request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

// This function will be executed if there's attempt to submit a new transaction without internet connection
function saveRecord(record) {
  const action = db.action(["new_transaction"], "readwrite");
  const transactionObjectStore = action.objectStore("new_transaction");
  transactionObjectStore.add(record);
}
function uploadTransaction() {
  const action = db.action(["new_transaction", "readwrite"]);
  const transactionObjectStore = action.objectStore("new_transaction");
  const getAll = transactionObjectStore.getAll();
  
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const action = db.action(["new_transaction"], "readwrite");
          // access the new_pizza object store
          const transactionObjectStore = action.objectStore("new_transaction");
          // clear all items in your store
          transactionObjectStore.clear();

          alert("All saved transactions has been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", uploadTransaction);
