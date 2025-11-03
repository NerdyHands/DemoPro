let products = {
  data: [
    {
      productName: "0 to 0.25 acres",
      category: "Commercial",
      price: "30",
      image: "",
    },
    {
      productName: "0 to 0.25 acres",
      category: "Residential",
      price: "49",
      image: "",
    },
    {
      productName: "0.26 to 0.5 acres",
      category: "Commercial",
      price: "99",
      image: "",
    },
    {
      productName: "0.26 to 0.5 acres",
      category: "Residential",
      price: "29",
      image: "",
    },
    {
      productName: "0.5 to 1 acres",
      category: "Commercial",
      price: "129",
      image: "",
    },
    {
      productName: "0.5 to 1 acres",
      category: "Residential",
      price: "89",
      image: "",
    },
    {
      productName: "1+ acres",
      category: "Commercial",
      price: "189",
      image: "",
    },
    {
      productName: "1+ acres",
      category: "Residential",
      price: "49",
      image: "",
    },
  ],
};

for (let i of products.data) {
  //Create Card
  let card = document.createElement("div");
  //Card should have category and should stay hidden initially
  card.classList.add("card", i.category, "hide");

  /*
  //image div
  let imgContainer = document.createElement("div");
  imgContainer.classList.add("image-container");
  //img tag
  let image = document.createElement("img");
  image.setAttribute("src", i.image);
  imgContainer.appendChild(image);
  card.appendChild(imgContainer);
  //container
  let container = document.createElement("div");
  container.classList.add("container");
  */



  // Text node for the product
  let productName = document.createElement("h5");
  productName.classList.add("product-name");
  productName.innerText = i.productName.toUpperCase();
  card.appendChild(productName);

  // Text node for the price
  let price = document.createElement("h6");
  price.innerText = "$" + i.price;
  card.appendChild(price);

  // Adding the card to the products container
  document.getElementById("products").appendChild(card);
}


//parameter passed from button (Parameter same as category)
function filterProduct(value) {
  //Button class code
  let buttons = document.querySelectorAll(".button-value");
  buttons.forEach((button) => {
    //check if value equals innerText
    if (value.toUpperCase() == button.innerText.toUpperCase()) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  //select all cards
  let elements = document.querySelectorAll(".card");
  //loop through all cards
  elements.forEach((element) => {
    //display all cards on 'all' button click
    if (value == "All") {
      element.classList.remove("hide");
    } else {
      //Check if element contains category class
      if (element.classList.contains(value)) {
        //display element based on category
        element.classList.remove("hide");
      } else {
        //hide other elements
        element.classList.add("hide");
      }
    }
  });
}

//Search button click
// document.getElementById("search").addEventListener("click", () => {
//initializations
let searchInput = document.getElementById("search-input").value;
let elements = document.querySelectorAll(".product-name");
let cards = document.querySelectorAll(".card");

//loop through all elements
elements.forEach((element, index) => {
  //check if text includes the search value
  if (element.innerText.includes(searchInput.toUpperCase())) {
    //display matching card
    cards[index].classList.remove("hide");
  } else {
    //hide others
    cards[index].classList.add("hide");
  }
});
// });

//Initially display all products
window.onload = () => {
  filterProduct("All");
};