var app = window.app || {};

(function($, app){
  function Offer() {
    app.trace("New offer created.")

    this.peerConnection = this.createPeerConnection();
    this.dataChannel = this.createDataChannel();

    this.signalingServer = new app.SignalingServer(
      this.onSignalingOpen.bind(this),
      this.onSignalingMessage.bind(this)
    );

    this.setHandlers();
  }

  fn = Offer.prototype;

  fn.onSignalingOpen = function() {
    this.createOffer();

    app.trace("Sinaling server connected.")
  }

  fn.onSignalingMessage = function(message) {
    var data = JSON.parse(message.data);

    console.log(data);

    if (data.type == "chat_message") {
      $(document).trigger("chat.newMessage", ["server", data.message]);
    } else if (data.type == "caller_description") {
      this.setRemoteDescription(data.description);
    } else if (data.type == "caller_ice_candidate") {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  fn.setRemoteDescription = function(description) {
    this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(description),
      function(){},
      function(err){ app.trace(err); }
    );
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
    this.signalingServer.push({
      type: "new_offer",
      data: {
        subject: "games", // TODO: fix the room fetch.
        description: this.peerConnection.localDescription
      }
    });
  }

  // ============================================
  // All below here is duplicated with Caller.
  // ============================================
  fn.createPeerConnection = function() {
    app.trace("Offer PeerConnection created.")
    return new RTCPeerConnection(
      null,
      { optional: [{ RtpDataChannels: true }] }
    )
  }

  fn.createDataChannel = function() {
    app.trace("Offer DataChannel created.")
    return this.peerConnection.createDataChannel("sendDataChannel", { reliable: false });
  }

  fn.setHandlers = function() {
    this.peerConnection.onicecandidate = this.onIceDandidate.bind(this);
    this.dataChannel.onopen = this.onDataChanelStateChanged.bind(this);
    this.dataChannel.onclose = this.onDataChanelStateChanged.bind(this);
    this.dataChannel.onmessage = this.onDataChannelMessage;
  }

  fn.onIceDandidate = function(event) {
    if (event.candidate) {
      this.signalingServer.push({
        type: "ice_candidate",
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
    $(document).trigger("chat.newMessage", ["his", e.data]);

    trace("Offer received new message: " + e.data);
  }

  app.Offer = Offer;
}(jQuery, app))
