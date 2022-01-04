//variable to hold db connection
let db;
//connection to IndexedDB database called 'anytime_budget_19' and set it to version 1
const request = indexedDB.open("anytime_budget_19", 1);

// this event will emit if the database version changes ( nonexistant to version 1, v1 to v2, etc. )
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_deposit", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.online) {
    uploadDeposit();
  }
};
request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
  };

  // This function will be executed if there's attempt to submit a new transaction without internet connection
function saveRecord(record) {
    const transaction = db.transaction(["new_deposit"], "readwrite");
    const depositObjectStore = transaction.objectStore("new_deposit");
    depositObjectStore.add(record);
  }
  
  function uploadDeposit() {
    const transaction = db.transaction(["new_deposit", "readwrite"]);
    const depositObjectStore = transaction.objectStore("new_deposit");
    const getAll = depositObjectStore.getAll();
    getAll.onsuccess = function () {
         // if there was data in indexedDb's store, send it to the api server
        if (getAll.result.length > 0) {
            fetch("/api/deposit", {
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
      const transaction = db.transaction(["new_deposit"], "readwrite");
      // access the new_pizza object store
      const depositObjectStore = transaction.objectStore("new_deposit");
      // clear all items in your store
      depositObjectStore.clear();

      alert("All saved transactions has been submitted!");
    })
    .catch((err) => {
      console.log(err);
    });
}
};
};

// listen for app coming back online
window.addEventListener('online', uploadDeposit);