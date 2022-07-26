import {select, templates, settings, classNames} from '../settings.js';
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
    thisBoo.getData();
  }

  getData(){
    const thisBoo = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBoo.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBoo.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      bookings:       settings.db.url + '/' + settings.db.bookings
                                      + '?' + params.bookings.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.events
                                      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.events
                                      + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log('bookings',bookings);
        //console.log('eventsCurrent',eventsCurrent);
        //console.log('eventsRepeat',eventsRepeat);
        thisBoo.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBoo = this;

    thisBoo.booked = {};

    for(let item of bookings){
      thisBoo.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBoo.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBoo.datePicker.minDate;
    const maxDate = thisBoo.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBoo.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBoo.booked',thisBoo.booked);

    thisBoo.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBoo = this;

    if(typeof thisBoo.booked[date] == 'undefined'){
      thisBoo.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBoo.booked[date][hourBlock] == 'undefined'){
        thisBoo.booked[date][hourBlock] = [];
      }

      thisBoo.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBoo = this;

    thisBoo.date = thisBoo.datePicker.value;
    thisBoo.hour = utils.hourToNumber(thisBoo.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBoo.booked[thisBoo.date] == 'undefined'
      ||
      typeof thisBoo.booked[thisBoo.date][thisBoo.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBoo.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBoo.booked[thisBoo.date][thisBoo.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }


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
    thisBoo.dom.tables = thisBoo.dom.element.querySelectorAll(select.booking.tables);
  }

  initWidgets(){
    const thisBoo = this;
    thisBoo.peopleAmount = new AmountWidget(thisBoo.dom.peopleAmount);
    thisBoo.hoursAmount = new AmountWidget(thisBoo.dom.hoursAmount);

    thisBoo.datePicker = new DatePicker(thisBoo.dom.datePicker);
    thisBoo.hourPicker = new HourPicker(thisBoo.dom.hourPicker);

    thisBoo.dom.element.addEventListener('updated', function(){
      thisBoo.updateDOM();
    });
  }
}

export default Booking;