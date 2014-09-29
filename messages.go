package main

import (
  "encoding/json"
)

type GenericMessage struct {
  Type string          `json:"type"`
  Data json.RawMessage `json:"data"`
}

type ChatMessage struct {
  Type    string `json:"type"`
  Sender  string `json:"sender"`
  Message string `json:"message"`
}

type DescriptionMessage struct {
  Type        string      `json:"type"`
  Description Description `json:"description"`
}

type Description struct {
  Sdp  string `json:"sdp"`
  Type string `json:"type"`
}

type NewOfferMessageData struct {
  Subject    string      `json:"subject"`
  Descrption Description `json:"description"`
}

type NewCallerMessageData struct {
  Subject string `json:"subject"`
}

type Subjects struct {
  Games  int `json:"games"`
  Music  int `json:"music"`
  Cinema int `json:"cinema"`
}

type StatusMessage struct {
  ConnectedOffers  Subjects `json:"connected_offers"`
  ConnectedCallers Subjects `json:"connected_callers"`
}

type IceCandidate struct {
  SdpMLineIndex int    `json:"sdpMLineIndex"`
  SdpMid        string `json:"sdpMid"`
  Candidate     string `json:"candidate"`
}

type IceCandidateMessage struct {
  Type      string       `json:"type"`
  Candidate IceCandidate `json:"candidate"`
}

func serverChatMessage(m string) ChatMessage {
  return ChatMessage{Type: "chat_message", Sender: "server", Message: m}
}
