import {settings, select, classNames,templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.add();
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;

    if (menuProduct !== undefined){
      const generatedHTML = templates.cartProduct(menuProduct);
      thisCart.element = utils.createDOMFromHTML(generatedHTML);
      const generatedDOM = thisCart.element;
      const cartContainer = document.querySelector(select.cart.productList);
      cartContainer.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    }
    thisCart.update();
  }

  update(){
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for (const product of thisCart.products) {
      totalNumber++;
      console.log('totalNumber',totalNumber);
      subtotalPrice = subtotalPrice + product['price'];
      console.log('subtotalPrice',subtotalPrice);
    }
    if (subtotalPrice >= 1) {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }
    else {
      thisCart.totalPrice = 0;
    }

    console.log('thisCart.totalPrice',thisCart.totalPrice);

    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
    thisCart.dom.totalPrice.forEach((element) => {
      element.innerHTML = thisCart.totalPrice;
    });
  }
  remove(){
    const thisCart = this;
    thisCart.element.remove();
    console.log('thisCart after remove', thisCart);
    console.log('thisCart.products', thisCart.products);
    thisCart.indexOfThisCart = thisCart.products.indexOf(thisCart.id);
    console.log('thisCart.indexOfThisCart', thisCart.indexOfThisCart);
    thisCart.removedFromThisCart = thisCart.products.splice(thisCart.indexOfThisCart);
    console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.dom.totalPrice.innerHTML,
      subtotalPrice: thisCart.dom.subtotalPrice.innerHTML,
      totalNumber: thisCart.dom.totalNumber.innerHTML,
      deliveryFee: thisCart.dom.deliveryFee.innerHTML,
      products: []
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    console.log('payload', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

  }

}

export default Cart;