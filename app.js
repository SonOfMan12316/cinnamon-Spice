const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCart = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay= document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');


let cart = [];
let buttonsDOM = [];

class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json')
            let data = await result.json()
            // console.log(data)
            let products = data.items
            // console.log(products)
            products = products.map(item => {
                const {title, price} = item.fields
                const {id} = item.sys
                const image = item.fields.image.fields.file.url
                return {title, price, id, image}
            })
            return products
        }  catch(err) {
            console.log(err)
        }
       
    }
}

class UI{
    displayProducts(products) {
        // console.log(products)
        let result = ""
        products.forEach(product => {
            result += `<article class="product">
                    <div class="img-container">
                        <img src="${product.image}" alt="product" class="product-img"/>
                        <button class="bag-btn"  data-id=${product.id}> 
                            <i class="fas fa-shopping-cart">Add to cart</i>
                        </button>
                        <div>
                            <h3 class="">${product.title}</h3>
                            <h4 class=""># ${product.price}</h4>
                        </div>
                    </div>
                </article>`
        })
        productsDOM.innerHTML = result
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = buttons
        buttons.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
                button.addEventListener("click", event => {
                    // console.log(event)
                    event.target.innerText = "In Cart"
                    event.target.disabled = true;

                    // let cartItem = Storage.getProduct(id)
                    let cartItem = {...Storage.getProduct(id), amount: 1}
                    // console.log(cartItem)

                    cart = [...cart, cartItem]

                    Storage.saveCart(cart)

                    this.setValuesCart(cart)
                    this.addCartItem(cartItem)
                    this.showCart()
                })
         }) 
    }
    setValuesCart(cart) {
        let sumTotal = 0
        let itemsTotal = 0
        cart.map(item => {
            sumTotal += item.price * item.amount
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(sumTotal.toFixed(2));
        cartItems.innerText = itemsTotal
    }
    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = 
            `<img src="${item.image}" class="w-20"/>
                <div>
                    <h4>${item.title}</h4>
                    <h5>#${item.price}</h5>
                    <span class="remove-item" data-id="${item.id}">remove</span>
                </div>
                <div>
                    <i class="fas fa-chevron-up" data-id="${item.id}"></i>
                    <p class="item-amount">${item.amount}</p>
                    <i class="fas fa-chevron-down" data-id="${item.id}"></i>
                </div>`
            cartContent.appendChild(div)
            // console.log(cartContent)
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart')
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setValuesCart(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    populateCart(cart) {
        cart.forEach(item => {
            this.addCartItem(item)
        })
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('showCart')
    }
    cartLogic() {
        clearCart.addEventListener("click", () => {
            this.clearCart()
        })
        cartContent.addEventListener("click", event => {
            if(event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id)

            } else if(event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id
                let summedAmount = cart.find(item => item.id === id);
                summedAmount.amount = summedAmount.amount + 1
                Storage.saveCart(cart)
                this.setValuesCart(cart);
                addAmount.nextElementSibling.innerText = summedAmount.amount
            
            } else if(event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                // console.log(reduceAmount)
                let id = lowerAmount.dataset.id;
                let subtractedAmount = cart.find(item => item.id === id);
                // console.log(subtractedAmount)
                subtractedAmount.amount = subtractedAmount.amount - 1
            
                if(subtractedAmount.amount > 0) {
                    Storage.saveCart(cart);
                    this.setValuesCart(cart)
                    lowerAmount.previousElementSibling.innerText = subtractedAmount.amount
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
            }
        })
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setValuesCart(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart></i>add to cart`
        // console.log(setValuesCart(cart))
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    }
}

class Storage{
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem("cart")) : []
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    ui.setupAPP()

    products
    .getProducts()
    .then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    })
})