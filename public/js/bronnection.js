var app = window.app || {};
// var offer, caller; // Gambis

(function($, app) {

  function Bronnection() {}

  var fn = Bronnection.prototype;

  fn.checkClientType = function() {
    if (document.location.hash === "" || document.location.hash === undefined) {
      this.createOffer();
    } else {
      this.createCaller();
    }
  }

  fn.createOffer = function() {
    this.sessionId = this.generateSessionId();
    this.client = new app.Client("offer", this.sessionId);
    document.location.hash = this.sessionId;
  }

  fn.createCaller = function() {
    this.sessionId = document.location.hash.slice(1);
    this.client = new app.Client("caller", this.sessionId);
  }

  fn.generateSessionId = function() {
    return Date.now()+"-"+Math.round(Math.random()*10000);
  }

  fn.onChatInput = function(message) {
    this.client.dataChannel.send(message);
  }

  fn.setupMedia = function(successCallback) {
    getUserMedia({ "video": true, "audio": true }, successCallback, function(err) { console.log(err); });
  }

  app.Bronnection = Bronnection;
}(jQuery, app));
