var app = window.app || {};

(function($, app) {

  function Trace() {}

  Trace.log = function(text) {
    var log = (performance.now() / 1000).toFixed(3) + ": " + text;
    console.log(log);
    $(document).trigger("interface.log", log);
  };

  app.trace = Trace.log;
}(jQuery, app))
