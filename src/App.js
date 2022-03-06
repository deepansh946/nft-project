import React from "react";
import "./styles/App.css";
import { ethers } from "ethers";
import myEpicNFT from "./utils/myEpicNFT.json";
import twitterLogo from "./assets/twitter-logo.svg";
import { Spinner, Toast, ToastContainer } from "react-bootstrap";

// Constants
const TWITTER_HANDLE = "deepansh946";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0xBd321614566D766eE4a2A9c8cfe8e4EF8Cf6c928";

const App = () => {
  const [account, setAccount] = React.useState();
  const [show, setShow] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState();
  const [tokenId, setTokenID] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [txnHash, setTxnHash] = React.useState(undefined);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setShow(true);
        setToastMsg("Please Install Metamask");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      setShow(true);
      setToastMsg("Please Install Metamask");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      setAccount(accounts[0]);
    }
  };

  const mintNFT = async () => {
    setLoading(true);

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          setTokenID(tokenId.toNumber());
        });

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        setTxnHash(nftTxn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    checkIfWalletConnected();
  }, []);

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  return (
    <>
      <div className="App">
        <div className="container">
          <div className="header-container">
            <p className="header gradient-text">My NFT Collection</p>
            <p className="sub-text">
              Each unique. Each beautiful. Discover your NFT today.
            </p>
            <div className="d-flex align-items-center flex-column mt-5">
              {account ? (
                <>
                  <button
                    onClick={mintNFT}
                    className="cta-button connect-wallet-button"
                  >
                    {loading ? "Minting NFT..." : "Mint NFT"}
                  </button>
                  {loading && (
                    <Spinner
                      className="mt-4"
                      animation="grow"
                      variant="light"
                    />
                  )}
                </>
              ) : (
                renderNotConnectedContainer()
              )}
            </div>
          </div>
          {txnHash && (
            <div className="sub-text">
              Congrats 🚀, your NFT is minted! Visit{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`}
              >
                here
              </a>{" "}
              to check it.
            </div>
          )}
          <div className="footer-container">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>

      <ToastContainer position="top-end">
        <Toast onClose={() => setShow(false)} show={show}>
          <Toast.Header
            closeButton
            style={{
              justifyContent: "space-between",
            }}
          >
            <div>{toastMsg}</div>
          </Toast.Header>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default App;
