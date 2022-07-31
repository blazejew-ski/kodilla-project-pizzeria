import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    thisBooking.render();
    thisBooking.getElements(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

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
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked',thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }


  }

  render(){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    const bookingContainer = document.querySelector(select.containerOf.booking);
    bookingContainer.appendChild(thisBooking.element);
  }
  getElements(element){
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.dom.element = element;
    thisBooking.dom.bookingContainer = thisBooking.dom.element.querySelector(select.containerOf.booking);
    thisBooking.dom.peopleAmount = thisBooking.dom.element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.element.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.element.querySelector(select.containerOf.floorPlan);
    thisBooking.dom.bookingForm = thisBooking.dom.element.querySelector(select.containerOf.bookingForm);
    thisBooking.dom.address = thisBooking.dom.element.querySelector(select.booking.address);
    thisBooking.dom.phone = thisBooking.dom.element.querySelector(select.booking.phone);
    thisBooking.selectedTable = null;
    thisBooking.starters = [];
    console.log('thisBooking.dom.address', thisBooking.dom.address);
    console.log('thisBooking.dom.phone', thisBooking.dom.phone);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.element.addEventListener('updated', function(event){
      thisBooking.updateDOM();
      thisBooking.initTables(event);
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });

    thisBooking.dom.bookingForm.addEventListener('submit', function(event) {
      event.preventDefault();
      if(!thisBooking.selectedTable) {
        alert('Please select a table first');
        return;
      } if(!thisBooking.dom.address.value) {
        alert('Please type your address');
        return;
      } if(!thisBooking.dom.phone.value) {
        alert('Please type your phone number');
        return;
      } else {
        thisBooking.sendBooking();
      }
    });

    document.querySelector(select.containerOf.bookingForm).addEventListener('click', function(event) {
      if(event.target.tagName == 'INPUT' && event.target.name == 'starter' && event.target.type == 'checkbox'){
        if (!event.target.checked){
          thisBooking.starters = thisBooking.starters.filter(function(e) {
            return e !== event.target.value;
          });
        }
        else {
          thisBooking.starters.push(event.target.value);
        }
      }
      console.log('thisBooking.starters', thisBooking.starters);
    });
  }

  initTables(event){
    const thisBooking = this;
    for(let table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableSelected);
      thisBooking.selectedTable = null;
    }
    if(event.target.classList.contains('booked')) {
      alert('table is reserved for someone else :(');
      thisBooking.selectedTable = null;
    }
    else if(event.target.classList.contains('table')) {
      event.target.classList.add(classNames.booking.tableSelected);
      thisBooking.selectedTable = parseInt(event.target.getAttribute(settings.booking.tableIdAttribute));
    }
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;
    const payload = {
      date: thisBooking.datePicker.correctValue,
      hour: thisBooking.hourPicker.correctValue,
      table: thisBooking.selectedTable,
      repeat: false,
      duration: thisBooking.hoursAmount.correctValue,
      ppl: thisBooking.peopleAmount.correctValue,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
      starters: []
    };

    for(let starter of thisBooking.starters) {
      payload.starters.push(starter);
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

    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
    thisBooking.updateDOM();
  }
}

export default Booking;