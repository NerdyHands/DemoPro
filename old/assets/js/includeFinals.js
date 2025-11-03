// Function to load content using AJAX
function loadContent(url, containerId) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Insert the loaded content into the container
                document.getElementById(containerId).innerHTML = xhr.responseText;
            } else {
                console.error('Error loading content: ' + xhr.status);
            }
        }
    };
    xhr.open('GET', url, true);
    xhr.send();
}

// Load content into divs with IDs final_1, final_2, final_3, and final_4
loadContent('final_1.html', 'final_1');
loadContent('final_2.html', 'final_2');
loadContent('final_3.html', 'final_3');
loadContent('final_4.html', 'final_4');
