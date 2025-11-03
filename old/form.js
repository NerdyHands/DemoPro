function createForm() {
    return `
        <form id="snippet-form" class="snippet-form-align-left plugin-form"
              method="post" autocomplete="off" name="google-sheet" action=""
              style="
                  background-color: #ffffff !important;
                  font-family: sans-serif !important;
                  padding: 16px 10px 10px !important;
                  margin: 0 auto !important;
                  width: 320px !important;
                  height: auto;
                  overflow-y: auto;
                  border: 3px solid #dddddd;
                  border-radius: 18px;
              "
        >

            <!-- Header -->
            <p id="snippet-title"
               style="display: block; color: #555555 !important; font-weight: 600 !important;
                      letter-spacing: 0.1px !important; font-size: 18px !important; font-family: sans-serif !important;
                      border-bottom: 1px solid black; padding-bottom: 5px; margin-bottom: 16px;
                  "
            >Get an instant online estimate</p>

            <!-- client -->
            <div class="snippet-group" style="display: block;">
                <p style="display: block; font-size: 18px; font-family: sans-serif;
                          color: #555555; font-weight: 600; letter-spacing: 0.1px;
                  "
                  id="personal-details-id">
                    Personal Details: <small id="personal-details-asteric-id" style="display: none;">
                        <sup style="color: red;">*</sup>
                    </small>
                </p>

                <div class="snippet-row" style="display: flex;">
                    <label for="snippet-full-name" style="display: block;">
                        <input type="text" id="snippet-full-name" name="name" placeholder="Full Name"
                               autocomplete="on"
                               required
                               style="background-color: #ffffff !important; outline: none !important;
                                      border: 1px solid #999999 !important; border-radius: unset !important;
                                      padding: 10px 8px !important; color: #555555 !important; width: 100% !important;
                                      font-size: 18px; color: #555555;
                               " />
                        <small id="form-name-error-text-id" class="snippet-error" style="color: red; display: none;">
                            Required
                        </small>
                    </label>

                    <label for="snippet-email" style="display: block;">
                        <input type="text" id="snippet-email" name="email" placeholder="Email"
                               autocomplete="on"
                               required
                               style="background-color: #ffffff !important; outline: none !important;
                                      border: 1px solid #999999 !important; border-radius: unset !important;
                                      padding: 10px 8px !important; color: #555555 !important; width: 100% !important;
                                      font-size: 18px; color: #555555;
                               " />

                    </label>
                </div>
            </div>

            <p style="display: block; color: #555555; font-weight: 600; letter-spacing: 0.1px;
                      font-size: 18px; font-family: sans-serif;" id="address-details-id">Address Details: <small>
                    <sup style="color: red;">*</sup>
                </small></p>
            <input id="snippet-address" type="text" name="address" placeholder="Address" autocomplete="off"
                   required
                   style="background-color: #ffffff; outline: none; border: 1px solid #999999; border-radius: unset;
                          padding: 10px 8px; font-family: sans-serif; font-size: 18px; color: #555555; width: 100% !important;
                          border-radius: 2px; box-sizing: border-box;"
            />
            <small id="form-address-error-text-id" class="snippet-error" style="color: red; display: none;">
                Required
            </small>

            <p style="display: block; color: #555555; font-weight: 600; letter-spacing: 0.1px;
                      font-size: 18px; font-family: sans-serif;" id="address-details-id">Phone Number: <small>
                    <sup style="color: red;">*</sup>
                </small></p>
            <input id="snippet-phone" type="text" name="address" placeholder="Phone Number" required autocomplete="off"
                   style="background-color: #ffffff; outline: none; border: 1px solid #999999; border-radius: unset;
                          padding: 10px 8px; font-family: sans-serif; font-size: 18px; color: #555555; width: 100% !important;
                          border-radius: 2px; box-sizing: border-box;"
            />
            <small id="form-phone-error-text-id" class="snippet-error" style="color: red; display: none;">
                Required
            </small>

            <button id="snippet-button" type="submit" style="outline: none; color: #ffffff; background-color: #009e0f;
                      border: 1px solid #999; padding: 10px 10px; border-radius: 10px; font-size: 16px; font-weight: 600;
                      font-family: sans-serif; display: unset; width: 100%;
                  ">Send Quote</button>

        </form>
    `;
}


document.addEventListener('DOMContentLoaded', function() {
    // Check if the form has already been rendered
    if (!document.getElementById('snippet-form')) {
        // Log a message to verify if the form rendering is being triggered
        console.log('Form rendering on page load!');
        // Execute code to render the form only if it hasn't been rendered yet
        var formHtml = createForm();
        // Create a temporary container element
        var tempContainer = document.createElement('div');
        // Set the innerHTML of the container to the form HTML
        tempContainer.innerHTML = formHtml;
        // Get the form element from the container
        var form = tempContainer.querySelector('form');
        // Get the form container element
        var formContainer = document.getElementById('formContainer');
        // Append the form to the container
        formContainer.appendChild(form);
    } else {
        console.log('Form already rendered on page load, not rendering again.');
    }
});


/*
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxcM56KKnohVgsVeCGY5FB6ECnT-wuEPtTXkEpvkRpPdJfZfiK2R4Z1HKfx6yDPVe60Fw/exec";
const form = document.forms["google-sheet"];
form.addEventListener("submit", (e) => {
  e.preventDefault();
  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => {
      console.log(response);
      alert("Thank you! your form is submitted successfully.");
      return response; // Remember to return the response for the next `then` block
    })
    .then(() => {
      window.location.reload();
    })
    .catch((error) => console.error("Error!", error.message));
});
*/