var app = window.app || {};
var offer, caller; // Gambis

(function($, app) {

  function Bronnection() {}

  fn = Bronnection.prototype;

  fn.onNewOffer = function() {
    this.client = new app.Offer();
  }

  fn.onNewCaller = function() {
    this.client = new app.Caller();
  }

  fn.onChatInput = function(message) {
    this.client.dataChannel.send(message);
  }

  app.Bronnection = Bronnection;
}(jQuery, app));
