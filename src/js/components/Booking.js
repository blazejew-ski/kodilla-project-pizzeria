import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){
    const thisBoo = this;
    thisBoo.render();
    thisBoo.getElements(element);
    thisBoo.initWidgets();
  }
  render(){
    const thisBoo = this;
    const generatedHTML = templates.bookingWidget();
    thisBoo.element = utils.createDOMFromHTML(generatedHTML);
    const bookingContainer = document.querySelector(select.containerOf.booking);
    bookingContainer.appendChild(thisBoo.element);
  }
  getElements(element){
    const thisBoo = this;
    thisBoo.dom = {};
    thisBoo.dom.element = element;
    thisBoo.dom.bookingContainer = thisBoo.dom.element.querySelector(select.containerOf.booking);
    thisBoo.dom.peopleAmount = thisBoo.dom.element.querySelector(select.booking.peopleAmount);
    thisBoo.dom.hoursAmount = thisBoo.dom.element.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBoo = this;
    thisBoo.peopleAmount = new AmountWidget(thisBoo.dom.peopleAmount);
    thisBoo.hoursAmount = new AmountWidget(thisBoo.dom.hoursAmount);
  }
}

export default Booking;