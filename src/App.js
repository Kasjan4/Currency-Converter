import React from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/normalize.css'
import './styles/main.scss'

import Home from './components/Home'

const App = () => {

  return (
    <HashRouter>
      <Switch location={location}>
        <Route exact path="/" component={Home} />
      </Switch>
    </HashRouter>
  )
}

export default App