var app = window.app || {};

(function($, app) {
  function Bronnection() {}

  var fn = Bronnection.prototype;

  fn.init = function(username, sessionId, type) {
    this.username = username;

    app.trace("Started. Username: " + username +". Session ID: "+ sessionId);

    this.client = new app.Client(username, sessionId, type);
  }

  fn.onChatInput = function(message) {
    this.client.dataChannel.send(
      JSON.stringify({ username: this.username, message: message })
    );
  }

  app.Bronnection = Bronnection;
}(jQuery, app));
