// Open new tab if extension icon is clicked
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({ url: chrome.extension.getURL("index.html") }, function(
    tab
  ) {});
});

// Initialize or get existing database
var requestOpenDB = indexedDB.open("likeLikers", 1);

requestOpenDB.onerror = function(event) {
  console.error("Like Likers failed to open database");
  console.error(event);
};

requestOpenDB.onupgradeneeded = function(event) {
  var db = event.target.result;

  var targetsObjectStore = db.createObjectStore("targets", {
    keyPath: "username"
  });

  // Create an index to search targets by activity, post or influencer.
  // We may have duplicates so we can't use a unique index.
  targetsObjectStore.createIndex("post_creator_index", "post_creator", {
    unique: false
  });
  targetsObjectStore.createIndex("post_id_index", "post_id", { unique: false });
  targetsObjectStore.createIndex("activity_index", "activity", {
    unique: false
  });
  targetsObjectStore.createIndex("is_liked_index", "is_liked", {
    unique: false
  });

  // Use transaction oncomplete to make sure the targetsObjectStore creation is
  // finished before adding data into it.
  targetsObjectStore.transaction.oncomplete = function(event) {
    console.log("Object store 'targets' is created");
  };
};

requestOpenDB.onsuccess = function(event) {
  console.log("[likelikers] Connected to the database");
  let db = event.target.result;

  // Receive new target from content_script
  chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "channel_targets");
    port.onMessage.addListener(function(target) {
      // Insert the new target
      var targetsObjectStore = db
        .transaction("targets", "readwrite")
        .objectStore("targets");
      var requestAddTarget = targetsObjectStore.add(target);
      requestAddTarget.onsuccess = function(event) {
        port.postMessage({ errorName: null });
      };
      requestAddTarget.onerror = function(event) {
        port.postMessage({ errorName: event.target.error.name });
      };
    });
  });
};
