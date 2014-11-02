var app = window.app || {};

(function($, app){

  function Interface(bro) {
    this.bro = bro;
    this.offerButton = $('[data-offer-button]');
    this.callerButton = $('[data-caller-button]');
    this.chatInput = $('[data-chat-input]');
    this.chatMessages = $('[data-chat-messages]');
    this.startBox = $('[data-link-box]');
    this.localVideo = $(document).find('[data-local-video]');
    this.remoteVideo = $(document).find('[data-remote-video]');
    this.logButton = $(document).find('[data-log-button]');
    this.chatButton = $(document).find('[data-chat-button]');
    this.logPanel = $(document).find('[data-log-panel]');
    this.chatPanel = $(document).find('[data-chat-panel]');

    this.bindEvents();
  }

  var fn = Interface.prototype;

  fn.bindEvents = function() {
    this.chatInput.on('keypress', this.onHitEnterKey.bind(this));

    // Check if this is the best way to trigger events from another classes.
    $(this.logButton).on("click", this.displayLogPanel.bind(this));
    $(this.chatButton).on("click", this.displayChatPanel.bind(this));
    $(document).bind("interface.log", this.logging.bind(this));


    $(document).bind("chat.newMessage", this.onNewChatMessage.bind(this));
    $(document).bind("connection.established", this.onConenctionEstablished.bind(this));
    $(document).bind("media.setLocal", this.onSetLocalVideo.bind(this));
    $(document).bind("media.setRemote", this.onSetRemoteVideo.bind(this));

    $(document).ready(this.bro.checkClientType.bind(this.bro));
  }

  fn.displayLogPanel = function(e) {
    e.preventDefault();
    this.logPanel.show();
    this.chatPanel.hide();
  }

  fn.displayChatPanel = function(e) {
    e.preventDefault();
    this.chatPanel.show();
    this.logPanel.hide();
  }

  fn.logging = function(e, message) {
    this.logPanel.append("<p>" + message + "</p>");
  }

  fn.onSetLocalVideo = function(e, stream) {
    this.localVideo.attr('src', URL.createObjectURL(stream));
  }

  fn.onSetRemoteVideo = function(e, stream) {
    this.remoteVideo.attr('src', URL.createObjectURL(stream));
  }

  fn.onHitEnterKey = function(e) {
    var message = this.chatInput.val();

    if (e.charCode == 13 && message !== "") {
      this.bro.onChatInput(message);
      this.onNewChatMessage(null, "my", message);
      this.chatInput.val('');
    }
  }

  fn.onConenctionEstablished = function() {
    this.chatInput.prop('disabled', false);
    this.onNewChatMessage(null, "server", "Connection established! :)");
  }

  fn.onNewChatMessage = function(e, sender, message) {
    this.chatMessages.append('<p class="message ' + sender + '-message">' + message + '</p>');
    this.chatMessages.animate({ scrollTop: this.chatMessages[0].scrollHeight });
  }

  app.Interface = Interface;
}(jQuery, app))
