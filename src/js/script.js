/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.initAcordion();
      console.log('new Product:', thisProduct);
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
    initAcordion(){
      const thisProduct = this;
      console.log('thisProduct:', thisProduct);

      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTriggers = document.querySelectorAll(select.menuProduct.clickable);
      const thisProductClickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      const thisProductElement = thisProduct.element;
      console.log('clickableTriggers:', clickableTriggers);
      console.log('thisProductClickableTrigger:', thisProductClickableTrigger);
      console.log('thisProductElement:', thisProductElement);

      /* START: add event listener to clickable trigger on event click */
      thisProductClickableTrigger.addEventListener('click', function(event) {          
        const products = document.querySelectorAll(select.all.menuProducts);
        
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        for (let product of products) {
          console.log('product:', product);
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
  }

  const app = {
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
