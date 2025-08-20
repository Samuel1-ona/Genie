import { ConnectButton } from "arweave-wallet-kit";
import "./App.css";
import GenieGovernance from "./components/GenieGovernance";
import GENIE_PROCESS from "./constants/genie_process";
import aoLogo from "/ao.svg";
import reactLogo from "/react.svg";
import viteLogo from "/vite.svg";

function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://ao.g8way.io" target="_blank" rel="noreferrer">
          <img src={aoLogo} className="logo ao" alt="AO logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Genie Governance System</h1>
      <p className="read-the-docs">
        Genie Process:{" "}
        <a
          href={`https://www.ao.link/#/entity/${GENIE_PROCESS}`}
          target="_blank"
          rel="noreferrer"
        >
          {GENIE_PROCESS}
        </a>
      </p>
      <div className="card">
        <div>
          <ConnectButton profileModal={true} showBalance={true} />
        </div>
        <GenieGovernance />
      </div>
      <p>
        Decentralized Governance Data Management System. Built with ❤️
        by Genie Team
      </p>
    </>
  );
}

export default App;
