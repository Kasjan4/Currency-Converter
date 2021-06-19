import React, { useState, useEffect } from 'react'
import Fade from 'react-reveal/Fade'
import axios from 'axios'
import { Form, Button, InputGroup, Spinner } from 'react-bootstrap'

// Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'

const Home = () => {

  const swapSVG = <FontAwesomeIcon icon={faRetweet} size="2x" />
  const API_USERNAME: string = process.env.REACT_APP_API_USERNAME
  const API_PASSWORD: string = process.env.REACT_APP_API_PASSWORD

  // List of currencies and their ISO, fetched from XE API
  const [currencies, setCurrencies] = useState<Currency[] | undefined>([])
  // Amount to be converted stored in state
  const [amount, setAmount] = useState<string | undefined>('')
  // The pair to be converted at any given moment, stored as two objects in state
  const [pair, setPair] = useState<Pair>()
  // Loader to be displayed before axios realises the fetch from the API's
  const [loaded, setLoaded] = useState<boolean>(false)
  // The output from the conversion stored in state
  const [output, setOutput] = useState<Output>()

  interface Pair {
    from: {
      currency_name: string
      flag: string
      is_obsolete: boolean
      iso: string
    }
    to: {
      currency_name: string
      flag: string
      is_obsolete: boolean
      iso: string
    }
  }

  interface Currency {
    currency_name: string
    is_obsolete: boolean
    iso: string
    flag: string
  }

  interface Output {
    amount: string
    from: string
    result: string
    to: string
  }


  // Fetch the initial list of currencies that are available to convert. Only on initial render.
  useEffect(() => {
    axios.get('https://xecdapi.xe.com/v1/currencies', {
      auth: {
        username: API_USERNAME,
        password: API_PASSWORD
      }
    })
      .then((resp) => {
        let currencies: [] = resp.data.currencies

        // Fetch flags for each country from REST countries API (not all flags are available)
        axios.get('https://restcountries.eu/rest/v2/all')
          .then((resp) => {
            console.log(resp.data)
            const countries: [] = resp.data

            // Map over the currencies, and match their respective ISO code to the country ISO in the REST Countries API,
            // then return the currency object along with the flag image url. No flag means a placeholder is added.
            let currenciesWithFlags: any = currencies.map((obj: Currency) => {

              let flagFound: any = countries.find((country: any) => country.currencies[0].code === obj.iso)

              if (obj.currency_name === 'US Dollar') return { ...obj, flag: 'https://restcountries.eu/data/usa.svg' }
              else if (!flagFound) return { ...obj, flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blue_question_mark_icon.svg/1200px-Blue_question_mark_icon.svg.png' }
              else if (flagFound) return { ...obj, flag: flagFound.flag }
            })

            // Set the initial pair of currencies, I've chosen USD and PLN
            setPair({ from: { ...currenciesWithFlags[149] }, to: { ...currenciesWithFlags[115] } })
            // Set the currency list for the user to chose from
            setCurrencies(currenciesWithFlags)
            setLoaded(true)
          })
          .catch((err) => {
            console.log(err)
          })

      })
      .catch((err) => {
        console.log(err)
      })

  }, [])

  // Axios request to make the conversion, based on data from the pair state
  function convert(event: any): void {
    event.preventDefault()

    if (amount) {

      axios.get(`https://xecdapi.xe.com/v1/convert_from.json/?from=${pair!.from.iso}&to=${pair!.to.iso}&amount=${amount}&decimal_places=2`, {
        auth: {
          username: API_USERNAME,
          password: API_PASSWORD
        }
      })
        .then((resp) => {
          setOutput({ from: pair!.from.currency_name, to: pair!.to.currency_name, amount: numberWithCommas(amount), result: numberWithCommas(resp.data.to[0].mid) })
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  // Add commas to output digits
  function numberWithCommas(x: string) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  // When currrency is changed, update the pair state. First find all the needed information using .find.
  //  The pair state information on each currency is needed for the select and the output.
  function handlePair(iso: string, fromTo: string): void {
    const currency: any = currencies!.find(curr => curr.iso === iso)

    if (fromTo === 'from') setPair({ ...pair!, from: { ...currency } })
    if (fromTo === 'to') setPair({ ...pair!, to: { ...currency } })
  }
  // Check if object is empty by looking at its properties, needed to only display output when necessary.
  function isEmpty(obj: any) {
    if (!output) return true

    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false
      }
    }
    return JSON.stringify(obj) === JSON.stringify({})
  }

  console.log(currencies)
  console.log(pair)


  return (
    <main>
      {loaded && <div className="cc-container">
        <Fade>
          <Form>

            <Form.Group controlId="formBasicNumber">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" value={amount} size="lg" min='0' onChange={(e) => setAmount(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="select-custom1">
              <Form.Label>From</Form.Label>

              <InputGroup className="mb-2">

                <InputGroup.Prepend>
                  <InputGroup.Text><img style={{ width: '30px' }} aria-label="Flag" src={pair!.from.flag} /></InputGroup.Text>
                </InputGroup.Prepend>

                <Form.Control
                  as="select"
                  value={pair!.from.iso}
                  size="lg"
                  custom
                  onChange={(e) => handlePair(e.target.value, 'from')} >

                  {currencies!.map((currency, index) => {
                    return <option key={index} value={currency.iso} label={currency.currency_name}>{currency.currency_name}</option>
                  })}
                </Form.Control>

              </InputGroup>

            </Form.Group>

            <Button id="btn-swap" aria-label="Swap" onClick={() => setPair({ from: pair!.to, to: pair!.from })}>{swapSVG}</Button>

            <Form.Group controlId="select-custom2">
              <Form.Label>To</Form.Label>

              <InputGroup className="mb-2">

                <InputGroup.Prepend>
                  <InputGroup.Text>
                    <img style={{ width: '30px' }} alt="Flag" src={pair!.to.flag} />
                  </InputGroup.Text>
                </InputGroup.Prepend>

                <Form.Control
                  as="select"
                  value={pair!.to.iso}
                  size="lg"
                  custom
                  onChange={(e) => handlePair(e.target.value, 'to')} >

                  {currencies!.map((currency, index) => {
                    return <option key={index} value={currency.iso} label={currency.currency_name}>{currency.currency_name}</option>
                  })}
                </Form.Control>

              </InputGroup>
            </Form.Group>

            {!isEmpty(output) && <Form.Text className="text-muted">{output!.amount} {output!.from} =<br /><span>{output!.result} {output!.to}</span></Form.Text>}

            <Button onClick={convert} disabled={!amount ? true : false} style={{ width: '100%' }} variant="primary" type="submit">Convert</Button>

          </Form>
        </Fade>

      </div>}

      {!loaded && <Spinner id="custom-spinner" animation="grow" />}
    </main>
  )
}

export default Home