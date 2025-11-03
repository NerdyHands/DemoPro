  // Function to load content using AJAX
  function loadContent(url, containerId) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Insert the loaded content into the container
            document.getElementById(containerId).innerHTML = xhr.responseText;
        }
    };
    xhr.open('GET', url, true);
    xhr.send();
}

// Load content
loadContent('pricegridForShed.html', 'pricegridForShed');
loadContent('pricegridForDeck.html', 'pricegridForDeck');
loadContent('pricegridForFence.html', 'pricegridForFence');
