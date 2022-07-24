import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAcordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }
  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.paramsWrapper = thisProduct.element.querySelector(select.menuProduct.paramsWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAcordion(){
    const thisProduct = this;

    const thisProductElement = thisProduct.element;

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      const products = document.querySelectorAll(select.all.menuProducts);

      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      for (let product of products) {
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (thisProductElement != product){
          product.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        else {
          thisProductElement.classList.toggle(classNames.menuProduct.wrapperActive);
        }
      }
    });
  }
  initOrderForm(){
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          // check if the option is not default
          if(option['default'] != true) {
            price = price + option['price'];
          }
        } else {
          // check if the option is default
          if(option['default'] == true) {
            price = price - option['price'];
          }
        }

        // define variables for image toggling and form input checking
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        const optionForm = thisProduct.paramsWrapper.querySelector('input[value="' + optionId + '"]');

        // check if input with optionId value is checked in the form - if yes add active class, if not - remove it.
        if(optionImage && optionForm.checked) {
          optionImage.classList.add(classNames.menuProduct.imageVisible);
        }
        if(optionImage && !optionForm.checked) {
          optionImage.classList.remove(classNames.menuProduct.imageVisible);
        }
      }
    }
    // add single product price to new variable
    thisProduct.priceSingle = price;
    // multiply price by amount
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.price = price;
    thisProduct.priceElem.innerHTML = price;
  }
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};

    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.price;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.params = thisProduct.prepareCartProductParams();

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);

    const params = {};

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      // create object params[paramId] with label and options object
      params[paramId] = {
        label: param.label,
        options: {
        },
      };

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        // create key and values for options, e.g. (optionId = 'olives', option.label: 'Olives')
        const optionParams = {
          [optionId] : option.label
        };

        // add created key and value to params[paramId].options object
        if(optionSelected) {
          Object.assign(params[paramId].options, optionParams);
        }
      }
    }

    return params;

  }

}

export default Product;