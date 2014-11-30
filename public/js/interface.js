var app = window.app || {};

(function($, app){
  function Interface(bro) {
    this.bro = bro;
    this.username = $('[data-username]');
    this.chatInput = $('[data-chat-input]');
    this.chatMessages = $('[data-chat-messages]');
    this.usernameBox = $('[data-username-box]');
    this.mediaBox = $('[data-media-box]');
    this.usernameInput = $('[data-username-input]');
    this.getInButton = $('[data-get-in-button]');
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

    $(this.logButton).on("click", this.displayLogPanel.bind(this));
    $(this.chatButton).on("click", this.displayChatPanel.bind(this));
    $(this.getInButton).on("click", this.onGetInButtonClicked.bind(this));
    $(document).bind("interface.log", this.logging.bind(this));


    $(document).bind("chat.newMessage", this.onNewChatMessage.bind(this));
    $(document).bind("connection.established", this.onConenctionEstablished.bind(this));
    $(document).bind("media.setLocal", this.onSetLocalVideo.bind(this));
    $(document).bind("media.setRemote", this.onSetRemoteVideo.bind(this));
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

  fn.onGetInButtonClicked = function() {
    var sessionId = this.getSessionId(),
        username = this.usernameInput.val();

    if (username !== "") {
      this.bro.init(username, sessionId, this.sessionType);
      this.usernameBox.hide();
      this.mediaBox.show();
      this.username.html("(" + username + ")");
    }
  }

  fn.getSessionId = function() {
    if (document.location.hash === "" || document.location.hash === undefined) {
      this.sessionType = "offer";
      var sessionId = Date.now()+"-"+Math.round(Math.random()*10000);
      document.location.hash = sessionId;
      return sessionId;

    } else {
      this.sessionType = "caller";
      return document.location.hash.slice(1);
    }
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
      this.onNewChatMessage(null, { username: this.bro.username, message: message });
      this.chatInput.val('');
    }
  }

  fn.onConenctionEstablished = function() {
    this.chatInput.prop('disabled', false);
    this.onNewChatMessage(null, { username: "server", message: "Connection established! :)" });
  }

  fn.onNewChatMessage = function(e, data) {
    this.chatMessages.append('<p class="message"><strong>'+data.username+'</strong><span>'+data.message+'</span></p>');
    this.chatMessages.animate({ scrollTop: this.chatMessages[0].scrollHeight });
  }

  app.Interface = Interface;
}(jQuery, app))
