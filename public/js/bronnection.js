var app = window.app || {};
var offer, caller; // Gambis

(function($, app) {

  function Bronnection() {}

  fn = Bronnection.prototype;

  fn.onNewOffer = function() {
    offer = new app.Offer();
  }

  fn.onNewCaller = function() {
    caller = new app.Caller();
  }

  fn.onChatInput = function(message) {
    caller.dataChannel.send(message);
  }

  app.Bronnection = Bronnection;
}(jQuery, app));
