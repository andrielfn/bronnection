var app = window.app || {};

(function($, app){
  function SignalingServer(onOpenCallback, onMessageCallback) {
    this.websocket = new WebSocket("ws://localhost:4000/ws");

    this.setHandlers(onOpenCallback, onMessageCallback);

    app.trace("SignalingServer instance created.")
  }

  fn = SignalingServer.prototype;

  fn.setHandlers = function(onOpenCallback, onMessageCallback) {
    this.websocket.onopen = onOpenCallback;
    this.websocket.onmessage = onMessageCallback;
  }

  fn.push = function(data) {
    var message = JSON.stringify(data);
    this.websocket.send(message);
    app.trace("Sent to signaling server: " + message);
  }

  app.SignalingServer = SignalingServer;
}(jQuery, app))