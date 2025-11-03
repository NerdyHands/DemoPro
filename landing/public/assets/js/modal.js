$(document).ready(function () {
    $("#ModalScrollable").on("hidden.bs.modal", function (e) {
      // Reset the modal content here
      $("#initialContent").removeClass("hidden");
      $("#contentToToggle").addClass("hidden");
      $("#contentToToggle2").addClass("hidden");
      $("#backButton").hide();
      $("#nextButton").show();
      $("#nextButton2").show();
    });
  });

  const modelClose = document.getElementById("modelClose");
  const modelPopUP = document.getElementById("modelTemplate");

  $(document).ready(function () {
    setTimeout(function () {
      $("#modelTemplate").css("display", "block");
      $("#modelClose").click(function () {
        $("#modelTemplate").css("display", "none");
      });
      $(".closePopUP").click(function () {
        $("#modelTemplate").css("display", "none");
      });
    }, 3000);
  });