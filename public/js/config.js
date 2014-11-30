var app = window.app || {};

(function($, app){
  function Config() {
    this.iceServers = {"iceServers": [{ "url": "stun:stun1.l.google.com:19302" }]};
  }

  app.config = new Config;
}(jQuery, app))
