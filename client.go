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

func (ao *AvailableOffers) Find(s string) (c *Client) {
  if len((*ao)[s]) > 0 {
    return (*ao)[s][0] // TODO: Improve this logic to return the available offers.
  } else {
    return nil
  }
}

func (ao *AvailableOffers) Add(c *Client) {
  (*ao)[c.Subject] = append((*ao)[c.Subject], c)
}

func (ao *AvailableOffers) Remove(s string, uuid string) {
  var i int = 0

  for _, v := range (*ao)[s] {
    if v.Uuid == uuid {
      (*ao)[s] = append((*ao)[s][:i], (*ao)[s][i+1:]...)
    }
    i++
  }
}
