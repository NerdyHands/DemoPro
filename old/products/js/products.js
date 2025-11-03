
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
loadContent('product.html', 'product-container');

// Load footer content
loadContent('portfolio.html', 'portfolio-container');

// Load header content
loadContent('product-lawn.html', 'product_lawn-container');

// Load footer content
loadContent('portfolio-all.html', 'portfolio_all-container');