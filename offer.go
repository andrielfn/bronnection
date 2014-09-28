package main

type AvailableOffers map[string][]*Offer

type Offer struct {
  Uuid string
}

func (ao *AvailableOffers) Add(s string, o *Offer) {
  (*ao)[s] = append((*ao)[s], o)
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
