//WOW Scroll Spy
var wow = new WOW({
  //disabled for mobile
  mobile: false,
});
wow.init();

// Get the modal
var modal = document.getElementById("myPopUp");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];



// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
