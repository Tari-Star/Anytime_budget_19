//variable to hold db connection
let db;
//connection to IndexedDB database called 'anytime_budget_19' and set it to version 1
const request = indexedDB.open("anytime_budget_19", 1);

// this event will emit if the database version changes ( nonexistant to version 1, v1 to v2, etc. )
request.onupgradeneeded = function (event) {
  //save a reference to the database
  const db = event.target.result;

  //create an object store (table) called "new_transaction", set it to have an auto incrementing primary key of sorts
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  //when db id successfully created with its object store or simply established a connection,save reference to db in globalvariable
  db = event.target.result;

  //checks if app is online, if yes run uploadTransaction() function to send all local db data to api
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
  // open a new transaction with the database with read and write permission
  const transaction = db.transaction(["new_transaction"], "readwrite");

  //access the object store for "new_transaction"
  const budgetObjectStore = transaction.objectStore("new_transaction");

  //addrecord to the store with add method
  budgetObjectStore.add(record);
}

function uploadTransaction() {
  //open a transaction in db
  const transaction = db.transaction(["new_transaction", "readonly"]);

  //access the object store
  const budgetObjectStore = transaction.objectStore("new_transaction");

  //get all records from store and set to a variable
  const getAll = budgetObjectStore.getAll();

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
          const transaction = db.transaction(["new_transaction"], "readwrite");

          // access the new_transaction object store
          const budgetObjectStore = transaction.objectStore("new_transaction");

          // clear all items in your store
          budgetObjectStore.clear();

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
