var app = window.app || {};

(function($, app){

  function Interface(bro) {
    this.bro = bro;
    this.offerButton = $('[data-offer-button]');
    this.callerButton = $('[data-caller-button]');
    this.chatInput = $('[data-chat-input]');
    this.chatMessages = $('[data-chat-messages]');

    this.bindEvents();
  }

  fn = Interface.prototype;

  fn.bindEvents = function() {
    this.offerButton.on('click', this.bro.onNewOffer);
    this.callerButton.on('click', this.bro.onNewCaller);
    this.chatInput.on('keypress', this.onHitEnterKey.bind(this));

    // Check if this is the best way to trigger events from another classes.
    $(document).bind("chat.newMessage", this.onNewChatMessage.bind(this));

    // TODO: do this only if the connection was established between the two peers.
    this.callerButton.on('click', $.proxy(function() {
      this.chatInput.prop('disabled', false);
    }, this));
  }

  fn.onHitEnterKey = function(e) {
    if (e.charCode == 13) {
      this.bro.onChatInput(this.chatInput.val());
      this.chatInput.val('');
    }
  }

  fn.onNewChatMessage = function(e, message) {
    this.chatMessages.append('<p class="message my-message">' + message + '</p>');
    this.chatMessages.animate({ scrollTop: this.chatMessages[0].scrollHeight });
  }

  app.Interface = Interface;
}(jQuery, app))
