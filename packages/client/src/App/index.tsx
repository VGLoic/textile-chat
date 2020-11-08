import React from 'react';
import logo from './logo2.svg';
import './App.css';
import { PrivateKey } from "@textile/hub";
import useIdentity from '../useIdentity';
import HubViewer from '../HubViewer';

function App() {
  const { status, identity } = useIdentity();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="App-body">
        {status === "resolved"
          ? <HubViewer identity={identity as PrivateKey} />
          : <div>Generating identity...</div>
        }
      </div>
    </div>
  );
}

export default App;
