import React from 'react';
import logo from './logo2.svg';
import './App.css';
import HubViewer from '../HubViewer';
import { useMetamask } from '../MetamaskContext';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="App-body">
        <AppRouter />
      </div>
    </div>
  );
}

function AppRouter() {
  const { status: metamaskStatus, enable } = useMetamask();

  if (metamaskStatus === "unavailable") {
    return <div>You will need MetaMask in order to use this app</div>
  }

 if (metamaskStatus === "loading") {
   return <div>Enabling MetaMask...</div>
 }

 if (["available", "unlocked"].includes(metamaskStatus)) {
  return (
    <button onClick={enable}>Enable MetaMask</button>
  )
 }

 if (metamaskStatus === "enabled") {
   return <HubViewer />
 };

 throw new Error("Unreachable");
}

export default App;
