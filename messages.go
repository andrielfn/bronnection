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

type NewOfferMessageData struct {
  Subject string `json:"subject"`
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

func serverChatMessage(m string) ChatMessage {
  return ChatMessage{Type: "chat_message", Sender: "server", Message: m}
}
