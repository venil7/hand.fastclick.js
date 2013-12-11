/*
 * FastClick for hand.js (https://handjs.codeplex.com/)
 * by Art Deineka of blinkbox.
 *       
 * Licensed under MIT.
*/
!(function(HANDJS, $){

    // event mapings:
    // pointerdown   --> touchstart
    // pointermove   --> touchmove
    // pointerup     --> touchend
    // pointercancel --> touchcancel
    // pointerenter  --> touchenter
    // pointerleave  --> touchleave
    // pointerout    --> ***
    // pointerover   --> ***

    /*var debugg = function() {
      this.start = this.start || new Date().getTime();
      this.curr = this.start - (new Date().getTime());

      console.log(Math.abs(this.curr), arguments);
    };*/
  
  if (!!!HANDJS) throw new Error("this script requires hand.js");

  HANDJS.FastClick = function(element, handler) {
    this.element = element;
    this.handler = handler;

    element.addEventListener('pointerdown'/*'touchstart'*/, this, false);
    element.addEventListener('click', this, false);
  };

  HANDJS.FastClick.prototype.handleEvent = function(event) {
    var evt = event.pointerType + ':' + event.type;
    //debugg("HANDJS.FastClick.prototype.handleEvent", evt);
    switch (evt) {
      case 'touch:pointerdown'/*'touchstart'*/: this.onTouchStart(event); break;
      case 'touch:pointermove'/*'touchmove'*/: this.onTouchMove(event); break;
      case 'touch:pointerup'/*'touchend'*/: this.onClick(event); break;
      //case 'mouse:pointerdown' /*'click'*/: this.onClick(event); break; // browser click
      default:
        if (/:click$/.test(evt)) { 
          this.onClick(event);
        }
        break;
    }
  };

  HANDJS.FastClick.prototype.onTouchStart = function(event) {
    //debugg('HANDJS.FastClick.prototype.onTouchStart:', event.type, event.pointerType);
    event.stopPropagation();

    this.element.addEventListener('pointerup'/*'touchend'*/, this, false);
    document.body.addEventListener('pointermove'/*'touchmove'*/, this, false);

    this.startX = event/*.touches[0]*/.clientX;
    this.startY = event/*.touches[0]*/.clientY;
  };

  HANDJS.FastClick.prototype.onTouchMove = function(event) {
    //debugg('HANDJS.FastClick.prototype.onTouchMove:', event.type, event.pointerType);
    if (Math.abs(event/*.touches[0]*/.clientX - this.startX) > 10 ||
        Math.abs(event/*.touches[0]*/.clientY - this.startY) > 10) {
      this.reset();
    }
  };

  HANDJS.FastClick.prototype.onClick = function(event) {
    //debugg('HANDJS.FastClick.prototype.onClick:', event.type, event.pointerType);
    event.stopPropagation();
    this.reset();
    this.handler(event);

    if (event.type == 'pointerup'/*'touchend'*/ && event.pointerType == 'touch') {
      HANDJS.clickbuster.preventGhostClick(this.startX, this.startY);
    }
  };

  HANDJS.FastClick.prototype.reset = function() {
    this.element.removeEventListener('pointerup'/*'touchend'*/, this, false);
    document.body.removeEventListener('pointermove'/*'touchmove'*/, this, false);
  };

  HANDJS.clickbuster = function() {};
  HANDJS.clickbuster.preventGhostClick = function(x, y) {
    //debugg('HANDJS.clickbuster.preventGhostClick:', event.type, event.pointerType);
    HANDJS.clickbuster.coordinates.push(x, y);
    window.setTimeout(HANDJS.clickbuster.pop, 2500);
  };

  HANDJS.clickbuster.pop = function() {
    HANDJS.clickbuster.coordinates.splice(0, 2);
  };


  HANDJS.clickbuster.onClick = function(event) {
    //debugg('global click handler', event);
    for (var i = 0; i < HANDJS.clickbuster.coordinates.length; i += 2) {
      var x = HANDJS.clickbuster.coordinates[i];
      var y = HANDJS.clickbuster.coordinates[i + 1];
      if (Math.abs(event.clientX - x) < 10 && Math.abs(event.clientY - y) < 10) {
        //debugg('Found', event);
        event.stopPropagation();
        event.preventDefault();
      }
    }
  };

  if (document.addEventListener) {
    document.addEventListener('click', HANDJS.clickbuster.onClick, true);
  } else if (document.attachEvent) {
    document.attachEvent('onclick', HANDJS.clickbuster.onClick);
  }
  
  HANDJS.clickbuster.coordinates = [];

  // jquery wrapper
  $.fn.fastclick = function(cb) {
    return $(this).each(function(){
      new HANDJS.FastClick($(this)[0], cb);
    });
  };

}(HANDJS, jQuery));