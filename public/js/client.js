var app = window.app || {};

(function($, app) {
  function Client(username, sessionId, type) {
    app.trace("New " + type + " created.");

    this.username = username;
    this.sessionId = sessionId;
    this.type = type;
    this.peerConnection = this.createPeerConnection();
    this.dataChannel = this.createDataChannel();

    this.getUserMedia();
    this.setHandlers();
  }

  var fn = Client.prototype;

  fn.setHandlers = function() {
    this.peerConnection.onicecandidate = this.onIceDandidate.bind(this);
    this.peerConnection.onaddstream = this.onAddStream;
    this.dataChannel.onopen = this.onDataChanelStateChanged.bind(this);
    this.dataChannel.onclose = this.onDataChanelStateChanged.bind(this);
    this.dataChannel.onmessage = this.onDataChannelMessage;
  }

  fn.onAddStream = function(e) {
    $('[data-remote-video]').attr('src', URL.createObjectURL(e.stream));
  }

  fn.getUserMedia = function() {
    getUserMedia(
      { audio: true, video: true },
      this.setMediasSource.bind(this),
      function(err) { app.trace(err); }
    );
  }

  fn.setMediasSource = function(stream) {
    $('[data-local-video]').attr('src', URL.createObjectURL(stream));

    this.peerConnection.addStream(stream);

    this.signalingServer = new app.SignalingServer(
      this.onSignalingOpen.bind(this),
      this.onSignalingMessage.bind(this)
    );
  }

  fn.onIceDandidate = function(event) {
    if (event.candidate) {
      this.signalingServer.push({
        type: this.type+"_ice_candidate",
        data: event.candidate
      });
    }
  }

  fn.onDataChanelStateChanged = function() {
    var state = this.dataChannel.readyState;

    if (state == "open") {
      $(document).trigger("connection.established");
    }

    trace("Offer channel state is: " + state);
  }

  fn.onDataChannelMessage = function(e) {
    $(document).trigger("chat.newMessage", JSON.parse(e.data));

    trace("Offer received new message: " + e.data);
  }

  fn.createPeerConnection = function() {
    app.trace("PeerConnection created.")
    return new RTCPeerConnection(
      app.config.iceServers,
      { optional: [{ RtpDataChannels: true }] }
    )
  }

  fn.createDataChannel = function() {
    app.trace("DataChannel created.")
    return this.peerConnection.createDataChannel("sendDataChannel", { reliable: true });
  }

  fn.onSignalingOpen = function() {
    if (this.type == "offer") {
      this.signalingServer.push({
        type: "new_room",
        data: {
          room_id: this.sessionId,
          username: this.username
        }
      });
    } else if (this.type == "caller") {
      this.createOffer();
    }

    app.trace("Sinaling server connected.")
  }

  fn.onSignalingMessage = function(message) {
    var data = JSON.parse(message.data);

    app.trace("Received " + message.data)

    if (data.type == "chat_message") {
      $(document).trigger("chat.newMessage", data);
    } else if (data.type == "caller_description") {
      this.setRemoteDescription(data.description);
    } else if (data.type == "offer_description") {
      this.setRemoteDescription(data.description);
    } else if (data.type == "caller_ice_candidate") {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else if (data.type == "offer_ice_candidate") {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  fn.setRemoteDescription = function(description) {
    this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(description),
      this.createAnswer.bind(this),
      function(err){ app.trace(err); }
    );
  }

  fn.createAnswer = function() {
    if (this.type == "offer") {
      this.peerConnection.createAnswer(
        this.setLocalDescription.bind(this),
        function(err) { app.trace(err); }
      );
    }
  }

  fn.createOffer = function() {
    this.peerConnection.createOffer(
      this.setLocalDescription.bind(this),
      function(err) { app.trace(err); }
    );
  }

  fn.setLocalDescription = function(description) {
    this.peerConnection.setLocalDescription(
      description,
      this.sendLocalDescription.bind(this),
      function(err) { app.trace(err) }
    )
  }

  fn.sendLocalDescription = function() {
    var type;

    if (this.type == "caller") {
      type = "join_room";
    } else if (this.type == "offer") {
      type = "offer_description";
    }

    this.signalingServer.push({
      type: type,
      data: {
        room_id: this.sessionId,
        description: this.peerConnection.localDescription
      }
    });
  }

  app.Client = Client;
}(jQuery, app))
