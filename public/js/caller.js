var app = window.app || {};

(function($, app){
  function Caller() {
    app.trace("New caller created.")

    this.peerConnection = this.createPeerConnection();
    this.dataChannel = this.createDataChannel();
    this.signalingServer = new app.SignalingServer(
      this.onSignalingOpen.bind(this),
      this.onSignalingMessage.bind(this)
    );

    this.setHandlers();
  }

  fn = Caller.prototype;

  fn.onSignalingOpen = function() {
    this.signalingServer.push({
      type: "new_caller",
      data: { subject: "games" } // TODO: fix the room fetch.
    });

    app.trace("Sinaling server connected.")
  }

  fn.onSignalingMessage = function(message) {
    var data = JSON.parse(message.data);

    // console.log(data);

    if (data.type == "chat_message") {
      $(document).trigger("chat.newMessage", ["server", data.message]);
    } else if (data.type == "offer_description") {
      this.setRemoteDescription(data.description);
    } else if (data.type == "offer_ice_candidate") {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  fn.setRemoteDescription = function(description) {
    this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(description),
      this.createAnswer.bind(this),
      function(err){ console.log(err); }
    )
  }

  fn.createAnswer = function() {
    this.peerConnection.createAnswer(
      this.setLocalDescription.bind(this),
      function(err) { app.trace(err); }
    );
  }

  fn.setLocalDescription = function(description) {
    this.peerConnection.setLocalDescription(
      description,
      this.sendLocalDescription.bind(this, description),
      function(err) { app.trace(err) }
    )
  }

  fn.sendLocalDescription = function(description) {
    this.signalingServer.push({
      type: "caller_description",
      data: description
    });
  }

  // fn.createOffer = function() {
  //   this.peerConnection.createOffer(this.getCallerDescription.bind(this));
  // }

  // fn.getCallerDescription = function(description) {
  //   app.trace("Caller create an offer.")
  //   this.peerConnection.setLocalDescription(description);
  //   offer.peerConnection.setRemoteDescription(description);
  //   offer.peerConnection.createAnswer(this.getOfferDescription);
  // }

  // // The place of this is not here!!!!!
  // fn.getOfferDescription = function(description) {
  //   app.trace("Offer create an answer.")
  //   offer.peerConnection.setLocalDescription(description);
  //   caller.peerConnection.setRemoteDescription(description);
  // }

  // ============================================
  // All below here is duplicated with Offer.
  // ============================================
  fn.createPeerConnection = function() {
    app.trace("Caller PeerConnection created.")
    return new RTCPeerConnection(
      null,
      { optional: [{ RtpDataChannels: true }] }
    )
  }

  fn.createDataChannel = function() {
    app.trace("Caller DataChannel created.")
    return this.peerConnection.createDataChannel("sendDataChannel", { reliable: false });
  }

  fn.setHandlers = function() {
    this.peerConnection.onicecandidate = this.onIceCandidate.bind(this);
    this.peerConnection.onaddstream = this.onAddStream;
    this.dataChannel.onopen = this.onDataChanelStateChanged.bind(this);
    this.dataChannel.onclose = this.onDataChanelStateChanged.bind(this);
    this.dataChannel.onmessage = this.onDataChannelMessage;
  }

  fn.onAddStream = function(stream) {
    $(document).trigger("media.setRemote", stream)
  }

  fn.onIceCandidate = function(event) {
    if (event.candidate) {
      this.signalingServer.push({
        type: "caller_ice_candidate",
        data: event.candidate
      });
    }
  }

  fn.onDataChanelStateChanged = function() {
    var state = this.dataChannel.readyState;

    if (state == "open") {
      $(document).trigger("connection.established");
    }

    trace("Caller channel state is: " + state);
  }

  fn.onDataChannelMessage = function(e) {
    $(document).trigger("chat.newMessage", ["his", e.data]);

    trace("Offer received new message: " + e.data);
  }

  app.Caller = Caller;
}(jQuery, app))
