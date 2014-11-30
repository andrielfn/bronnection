package main

import (
  "code.google.com/p/go.net/websocket"
)

type Client struct {
  Websocket     *websocket.Conn
  Uuid          string
  Username      string
  Description   Description `json:"description"`
  IceCandidates []*IceCandidate
  State         string
}

func (c *Client) AddIceCandidate(ic *IceCandidate) {
  c.IceCandidates = append(c.IceCandidates, ic)
}
