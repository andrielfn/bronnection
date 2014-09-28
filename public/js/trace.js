var app = window.app || {};

(function($, app) {

  function Trace() {}

  Trace.log = function(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
  };

  app.trace = Trace.log;
}(jQuery, app))
