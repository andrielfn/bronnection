package main

type AvailableOffers map[string][]*Offer

type Offer struct {
  Uuid    string
  Subject string
}

func (ao *AvailableOffers) Find(s string) (offer *Offer) {
  if len((*ao)[s]) > 0 {
    return nil
  } else {
    return nil
  }
}

func (ao *AvailableOffers) Add(o *Offer) {
  (*ao)[o.Subject] = append((*ao)[o.Subject], o)
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
