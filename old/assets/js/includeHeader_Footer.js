// Function to load content using AJAX
function loadContent(url, containerId) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Insert the loaded content into the container
            document.getElementById(containerId).innerHTML = xhr.responseText;
        }
    };

    // Check if the URL is for the mowing.html file
    var folderPath = '';
    if (url === 'portfolio-all.html') {
        folderPath = 'products/';
    }

    // Modify the URL to include the folder path with a forward slash
    var fullUrl = folderPath + url;

    xhr.open('GET', fullUrl, true);
    xhr.send();
}

// Load header content
loadContent('header.html', 'header-container');

// Load footer content
loadContent('footer.html', 'footer-container');


