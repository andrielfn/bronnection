var app = window.app || {};

(function($, app){

  function Interface(bro) {
    this.bro = bro;
    this.offerButton = $('[data-offer-button]');
    this.callerButton = $('[data-caller-button]');
    this.chatInput = $('[data-chat-input]');
    this.chatMessages = $('[data-chat-messages]');
    this.startBox = $(['data-start-box']);

    this.bindEvents();
  }

  fn = Interface.prototype;

  fn.bindEvents = function() {
    this.offerButton.on('click', this.bro.onNewOffer.bind(bro));
    this.callerButton.on('click', this.bro.onNewCaller.bind(bro));
    this.chatInput.on('keypress', this.onHitEnterKey.bind(this));

    // Check if this is the best way to trigger events from another classes.
    $(document).bind("chat.newMessage", this.onNewChatMessage.bind(this));
    $(document).bind("connection.established", this.onConenctionEstablished.bind(this));
  }

  fn.onHitEnterKey = function(e) {
    if (e.charCode == 13) {
      var message = this.chatInput.val();
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
