import {select, templates} from '../settings.js';
import utils from '../utils.js';


class Home {
  constructor(element){
    const thisHome = this;
    thisHome.opinions = [];
    thisHome.gallery = [];
    thisHome.render();
    thisHome.getElements(element);

  }
  render(){
    const thisHome = this;
    const generatedHTML = templates.homeWrapper();
    thisHome.element = utils.createDOMFromHTML(generatedHTML);
    const homeContainer = document.querySelector(select.containerOf.home);
    homeContainer.appendChild(thisHome.element);
  }
  getElements(element){
    const thisHome = this;
    thisHome.dom = {};
    thisHome.dom.element = element;
    thisHome.dom.carouselContainer = thisHome.dom.element.querySelector(select.containerOf.carousel);
    thisHome.dom.topWrapper = thisHome.dom.element.querySelectorAll(select.containerOf.topDiv);
    thisHome.pages = document.querySelector(select.containerOf.pages).children;
  }
}

export default Home;