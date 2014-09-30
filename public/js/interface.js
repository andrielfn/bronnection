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

    this.bindEvents();
  }

  fn = Interface.prototype;

  fn.bindEvents = function() {
    this.chatInput.on('keypress', this.onHitEnterKey.bind(this));

    // Check if this is the best way to trigger events from another classes.
    $(document).bind("chat.newMessage", this.onNewChatMessage.bind(this));
    $(document).bind("connection.established", this.onConenctionEstablished.bind(this));
    $(document).bind("media.setLocal", this.onSetLocalVideo.bind(this));
    $(document).bind("media.setRemote", this.onSetRemoteVideo.bind(this));
    $(document).bind("interface.displayLink", this.displayLink.bind(this));

    $(document).ready(this.bro.checkClientType.bind(this.bro));
  }

  fn.displayLink = function(e, hash) {
    var link = window.location.href;
    this.startBox.show().find('a').html(link);
  }

  fn.onSetLocalVideo = function(e, stream) {
    this.localVideo.attr('src', URL.createObjectURL(stream));
  }

  fn.onSetRemoteVideo = function(e, stream) {
    this.remoteVideo.attr('src', URL.createObjectURL(stream));
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
