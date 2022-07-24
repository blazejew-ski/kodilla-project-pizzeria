import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.getElements(element);
    thisCartProduct.cartAmountWidget();
    thisCartProduct.initActions();

    console.log('thisCartProduct', thisCartProduct);
  }
  getElements(element){
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }
  cartAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
      console.log('thisCartProduct.price', thisCartProduct.price);
      console.log('thisCartProduct.priceSingle', thisCartProduct.priceSingle);
      console.log('thisCartProduct.amountWidget', thisCartProduct.amountWidget);
      console.log('thisCartProduct.amountWidget.value', thisCartProduct.amountWidget.value);
      thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
      console.log('thisCartProduct.price2', thisCartProduct.price);
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }
  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct:thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);

  }
  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event) {
      event.preventDefault();
      console.log('thisCart.products', thisCartProduct.products);
      thisCartProduct.remove();
      console.log('remove();');
    });
  }

  getData(){
    const thisProduct = this;
    return {
      id: thisProduct.id,
      name: thisProduct.name,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.price,
      amount: thisProduct.amountWidget.value,
      params: thisProduct.params,
    };

  }


}

export default CartProduct;