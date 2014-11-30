package main

import (
  "encoding/json"
)

type GenericMessage struct {
  Type string          `json:"type"`
  Data json.RawMessage `json:"data"`
}

type ChatMessage struct {
  Type     string `json:"type"`
  Username string `json:"username"`
  Message  string `json:"message"`
}

type DescriptionMessage struct {
  Type        string      `json:"type"`
  Description Description `json:"description"`
}

type Description struct {
  Sdp  string `json:"sdp"`
  Type string `json:"type"`
}

type NewRoomMessageData struct {
  RoomId      string      `json:"room_id"`
  Username    string      `json:"username"`
  Description Description `json:"description"`
}

type NewCallerMessageData struct {
  Subject string `json:"subject"`
}

type StatusMessage struct {
  Rooms []StatusRoom `json:"rooms"`
}

type StatusRoom struct {
  RoomId           string `json:"room_id"`
  ConnectedClients int    `json:"connected_clients"`
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
  return ChatMessage{Type: "chat_message", Username: "server", Message: m}
}
