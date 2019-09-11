console.log("Like Likers is Installed");

let savedSign =
  '<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/198/white-heavy-check-mark_2705.png" srcset="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/198/white-heavy-check-mark_2705.png 2x" alt="White Heavy Check Mark on Apple iOS 12.2" width="16" height="16" title="username is saved" style="margin-right:12px;">';

// Run if any likers show up
document.arrive("._7UhW9.xLCgt.MMzan.KV-D4.fDxYl", function(element) {
  // Get the targets data
  let parentRowElement = element.parentNode.parentNode.parentNode;
  let username = element.getElementsByTagName("a")[0].title;
  let postID = window.location.pathname.split("/")[2];
  // Full page mode
  let postCreatorElement = document.querySelector(
    "#react-root > section > main > div > div > article > header > div.o-MQd.z8cbW > div.RqtMr > div > h2 > a"
  );
  if (postCreatorElement == null) {
    // Try if the user open a popup mode
    postCreatorElement = document.querySelector(
      "body > div._2dDPU.vCf6V > div.zZYga > div > article > header > div.o-MQd.z8cbW > div.PQo_0.RqtMr > div.e1e1d > h2 > a"
    );
    if (postCreatorElement == null) {
      console.error(
        "[likeLikers] postCreatorElement is not exists; update the selector"
      );
    }
  }
  let postCreator = postCreatorElement.title;

  let currentTimestamp = Date.now();
  let target = {
    username: username,
    activity: "like_post",
    post_id: postID,
    post_creator: postCreator,
    created_at: currentTimestamp,
    updated_at: currentTimestamp,
    is_liked: 0,
    liked_at: null
  };

  // Send target to background script
  var portTarget = chrome.runtime.connect({ name: "channel_targets" });
  portTarget.postMessage(target);
  // Check wether target is saved by background script or not
  portTarget.onMessage.addListener(function(response) {
    if (response.errorName == null) {
      parentRowElement.insertAdjacentHTML("afterbegin", savedSign);
    } else {
      // Username already exists
      if (response.errorName == "ConstraintError") {
        parentRowElement.insertAdjacentHTML("afterbegin", savedSign);
        parentRowElement.insertAdjacentHTML("afterbegin", savedSign);
      } else {
        console.error(response.errorName);
      }
    }
  });
});
