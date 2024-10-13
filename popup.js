// popup.js

// Function to display duplicate tabs with "Close Older Tab" buttons.
function displayDuplicates(duplicates) {
  const list = document.getElementById("duplicates-list");
  list.innerHTML = ""; // Clear previous list

  if (!duplicates || duplicates.length === 0) {
    list.innerHTML = "<li>No duplicate tabs found.</li>";
  } else {
    duplicates.forEach(({ url, tabs }) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Duplicate: ${url} (${tabs.length} tabs) `;

      const closeButton = document.createElement("button");
      closeButton.textContent = "Close Older Tab";
      closeButton.onclick = () => closeOlderTab(tabs);
      
      listItem.appendChild(closeButton);
      list.appendChild(listItem);
    });
  }
}

// Function to send a message to the background script to close the older tab.
function closeOlderTab(tabs) {
  // Send the tab IDs to the background script, so it can close the oldest one.
  const tabIds = tabs.map(tab => tab.id);
  chrome.runtime.sendMessage({ action: "closeOlderTab", tabIds }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error closing tab:", chrome.runtime.lastError);
      alert("Error: Could not close the older tab.");
    } else {
      alert("Older tab closed successfully.");
      // Refresh the duplicates list after closing.
      checkDuplicates();
    }
  });
}

// Function to fetch and display duplicate tabs.
function checkDuplicates() {
  chrome.runtime.sendMessage({ action: "checkDuplicates" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error handling response:", chrome.runtime.lastError);
      alert("Error: Could not retrieve duplicate tabs.");
      return;
    }

    if (response && response.duplicates) {
      displayDuplicates(response.duplicates);
    } else {
      console.error("Unexpected response:", response);
      alert("Error: Received unexpected response.");
    }
  });
}

// Add event listener to the "Check for Duplicates" button.
document.getElementById("check-duplicates").addEventListener("click", checkDuplicates);