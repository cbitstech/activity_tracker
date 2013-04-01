//Calendar
//Depends on fullcalendar.js

jQuery.fn.openForm = function() {
  var container = $(this);
  var body = container.find(".accordion-body");
  if (body.length === 1) { body.show() };
  if ( chevronArrowIsRight(container) ) {
    toggleChevronArrow(container);  
  }
  return $(this);
};

chevronArrowIsRight = function($header) {
  return ($header.find('i.icon-caret-right').length !== 0)
};

window.Calendar = (function() {

  function Calendar(container, eventsFn) {
    this.currentlyRendered = false;
    this.container = container;
    this.filteredEventsFn = eventsFn;
  };

  Calendar.prototype.load = function() {
    var self = this;
    $(this.container).prepend('<div id="calendar"></div>');
    this.$el = $(this.container).find('div#calendar');

    this.$el.fullCalendar({
      height:490,
      header: {
        left: 'agendaDay,agendaWeek,month',
        center: 'title',
        right: 'prev,next today'
      },
      // 
      selectable: true,
      editable: true,
      events: function(start, end, callback) {

        var eventsInPeriod, eventObjs;

        var filtered_events = self.filteredEventsFn();

        eventsInPeriod = filtered_events.filter(function(event) { 
          return (
            ( event.get_field_value('start') >= start && event.get_field_value('start') <= end ) || 
            ( event.get_field_value('end') >= start && event.get_field_value('end') <= end )
          );
        });

        eventObjs = eventsInPeriod.map(function(event) { 
          return _.extend({id: event.cid}, event.get_fields_as_object()) 
        });

        callback(eventObjs);
      },
      
      eventClick: function(calEvent, jsEvent, view) {
        var acEvent = ActivityCalEvents.get(calEvent.id);
        editEventView.updateModel( acEvent );
        //editEventView should have an updated start time and an updated 'currentState'
        $('div#edit-event-container').openForm().effect("highlight", {}, 1000);
      },

      dayClick: function(timeClicked, allDay, jsEvent, view) {
        var y = timeClicked.getFullYear(),
            m = timeClicked.getMonth(),
            d = timeClicked.getDate(),
            h = timeClicked.getHours(),
            min = timeClicked.getMinutes();

        if (allDay) {
          h = 12;
          min = 0;
        };

        var newModel = new ActivityCalEvent(),
            s = new Date(y, m, d, h, min),
            e = new Date(y, m, d, h+1, min);
        newModel.set_field('start', 'datetime', s);
        newModel.set_field('end', 'datetime', e);
        //m should have the correct start time.
        editEventView.updateModel(newModel);
        //editEventView should have an updated start time
        //and an updated 'currentState'
        $('div#edit-event-container').openForm().effect("highlight", {}, 1000);
      }    
    });

  };

  Calendar.prototype.reload = function() {
    this.$el.fullCalendar( 'refetchEvents' );
  };

  Calendar.prototype.remove = function() {
    this.currentlyRendered = false;
    this.$el.remove();
  };   

  Calendar.prototype.render = function() {

    if (!this.currentlyRendered) {
      this.load();
      this.currentlyRendered = true;
    } else {
      this.reload();
    }

  };

  return Calendar;

}) ();