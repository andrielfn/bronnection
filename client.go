package main

import (
  "code.google.com/p/go.net/websocket"
)

type AvailableOffers map[string][]*Client

type Client struct {
  Websocket     *websocket.Conn
  Uuid          string
  Subject       string
  Type          string
  Description   Description `json:"description"`
  IceCandidates []*IceCandidate
}

func (c *Client) AddIceCandidate(ic *IceCandidate) {
  c.IceCandidates = append(c.IceCandidates, ic)
}
