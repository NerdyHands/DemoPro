
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

// Load header content
loadContent('portfolio-01.html', 'portfolio-01-container');

// Load footer content
loadContent('product-01.html', 'product-01-container');