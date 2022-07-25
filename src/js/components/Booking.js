import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
    thisBoo.dom.datePicker = thisBoo.dom.element.querySelector(select.widgets.datePicker.wrapper);
    thisBoo.dom.hourPicker = thisBoo.dom.element.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets(){
    const thisBoo = this;
    thisBoo.peopleAmount = new AmountWidget(thisBoo.dom.peopleAmount);
    thisBoo.hoursAmount = new AmountWidget(thisBoo.dom.hoursAmount);
    thisBoo.datePicker = new DatePicker(thisBoo.dom.datePicker);
    thisBoo.hourPicker = new HourPicker(thisBoo.dom.hourPicker);
  }
}

export default Booking;