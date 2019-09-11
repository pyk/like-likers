console.log("index.js");

let targets = document.getElementById("targets");
console.log(targets);

// open the database
const requestOpenDB = window.indexedDB.open("likeLikers", 1);

requestOpenDB.onerror = function(event) {
  console.error("Like Likers failed to open database");
  console.error(event);
};

requestOpenDB.onsuccess = function(event) {
  const db = event.target.result;

  // Insert the new target
  var targetsObjectStore = db
    .transaction("targets", "readonly")
    .objectStore("targets");

  const isLikedIndex = targetsObjectStore.index("is_liked_index");
  const onlyNotLiked = IDBKeyRange.only(0);
  const cursorRequest = isLikedIndex.openCursor(onlyNotLiked);
  cursorRequest.onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      var listItem = document.createElement("li");
      listItem.innerHTML =
        '<a href="https://www.instagram.com/' +
        cursor.value.username +
        '" target="_blank">' +
        cursor.value.username +
        '</a> (<a href="#" class="markButton" data=\'' +
        JSON.stringify(cursor.value) +
        "'>mark as liked</a>)";
      targets.appendChild(listItem);

      cursor.continue();
    } else {
      console.log("Exhausted all documents");
    }
  };

  // Add "mark as liked" button
  document.arrive(".markButton", function(element) {
    let target = JSON.parse(element.getAttribute("data"));

    element.addEventListener("click", function() {
      // Update the target
      let currentTimestamp = Date.now();
      target.is_liked = 1;
      target.liked_at = currentTimestamp;
      target.updated_at = currentTimestamp;

      // Insert the new target
      let targetsObjectStore = db
        .transaction("targets", "readwrite")
        .objectStore("targets");

      let requestPutTarget = targetsObjectStore.put(target);
      requestPutTarget.onsuccess = function(event) {};
      requestPutTarget.onerror = function(event) {
        console.error("Cannot update the target");
      };
    });
  });
};
