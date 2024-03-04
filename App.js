const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".navLinks");
const productsDOM =document.querySelector(".products");
const cartItems = document.querySelector(".cart-item-product");
const carttItem = document.querySelector(".cart-item");
const cartBody= document.querySelector(".cart-body");
const productTotal = document.querySelector(".products-total");
const specificTotal = document.querySelector(".my-item-total");
const clearCart= document.querySelector(".clear-cart");
const itemAmount = document.querySelector(".itemAmount");


const cartToggle = document.querySelector(".cart-toggle");
const cartLink = document.querySelector(".cart-cover");


navToggle.addEventListener("click", function () {
  navLinks.classList.toggle("show-links");
});
cartToggle.addEventListener("click",function(){
    cartLink.classList.toggle("show-cart");
})

let cart=[];
let buttonsDOM = [];
class Products{
    async getProducts(){
        try {    
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(product=>{
                const {id} = product.sys;
                const {title,price} = product.fields;
                const image = product.fields.image.fields.file.url;
                return {id,image,title,price}
            });
            return products;
        } catch (error) {
            console.log(error)
        }
    }
}
class UI{
    displayProducts(products){
        // console.log(products)
        let result = "";
        products.forEach(product=>{
            result +=`
                <div class="product">
                    <div class="figure">
                        <img src=${product.image} alt="">
                    </div>
                    <h2>${product.title}</h2>
                    <div class="product-icons">
                        <div class="product-icon">
                            <div><a href="#" class="fa fa-star"></a></div> <p>5.0</p>
                        </div>
                        <div class="product-icon">
                            <div><a href="#" class="fa fa-heart"></a></div> <p>29</p>
                        </div>
                    </div>
                    <div class="price">
                        <h4>Price:</h4>
                        <p>$${product.price}</p>
                    </div>
                    <div class="btn">
                        <button class="bag-btn" data-id=${product.id}>Add To Cart</button>
                        <button class="btn4">View</button>
                    </div>
                </div>
            `
        });
        productsDOM.innerHTML=result;
    }
    getBagButtons(){
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button=>{
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerHTML = "In Cart";
                button.disabled = true;
            }
            else{
                button.addEventListener("click",event =>{
                    event.target.innerHTML = "In Cart";
                    event.target.disabled = true;
                    // get product from products
                    let cartItem = {...Storage.getProduct(id),amount:1};
                    // add product to cart
                    cart = [...cart,cartItem];
                    // save item to cart
                    Storage.saveCart(cart);
                    // set cartValues
                    this.setCartValues(cart);
                    // display cart item
                    this.addCartItem(cartItem);
                });
            }
        })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        let speTotal = 0;
        cart.map(item=>{
            tempTotal += item.price * item.amount;
            speTotal = item.price * item.amount;
            itemsTotal += item.amount;
        });
        // cart.forEach(item=>{
        //     speTotal = item.price * item.amount;
        // })
        console.log(tempTotal);
        console.log(speTotal);

        productTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        // specificTotal.innerHTML = speTotal;
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src=${item.image} alt="">
            
            <p>Price:$${item.price}</p>
            <div class="btn">
                <i class="fa fa-sort-asc" data-id=${item.id}></i>
                <p class="itemAmount">${item.amount}</p>
                <i class="fa fa-sort-desc" data-id=${item.id}></i>
            </div>
            <h4 class="my-item-total">${item.price * item.amount}</h4>
            <i class="fa fa-trash" data-id=${item.id}></i>
        `;
        cartBody.appendChild(div);
    }
    saveAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
    }
    populateCart(cart){
        cart.forEach(item=>this.addCartItem(item));
    }
    cartLogic(){
        clearCart.addEventListener("click",()=>{
            this.clearSingleItem();
        });
        cartBody.addEventListener("click",event=>{
            if(event.target.classList.contains('fa-trash')){
                let removeItem = event.target;
                cartBody.removeChild(removeItem.parentElement)
                let id = removeItem.dataset.id;
                this.removeItem(id);
            }
            else if(event.target.classList.contains('fa-sort-asc')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;


                //specificTotal.innerText = tempItem.amount * tempItem.price;


                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains('fa-sort-desc')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else{
                    cartBody.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }    
            }
        })
    }
    clearSingleItem(){
        let cartItemms = cart.map(item => item.id)
        cartItemms.forEach(id => this.removeItem(id));
        while(cartBody.children.length){
            cartBody.removeChild(cartBody.children[0]);
        }
    }
    removeItem(id){
        cart = cart.filter(item => item.id !==  id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `Add To Cart`;
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));

    }
    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}
document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI();
    const products = new Products();
    ui.saveAPP();
    products.getProducts().then(data => {ui.displayProducts(data)
    Storage.saveProducts(data);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
});