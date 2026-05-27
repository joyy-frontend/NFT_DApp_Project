import React, { FC, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from "./routes/main";
import Layout from "./components/Layout";
import MyAnimal from "./routes/my-animal";
import SaleAnimal from "./routes/sale-animal";

const App: FC = () => {
  const [account, setAccount] = useState<string>("");
  const [accountLabel, setAccountLabel] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");

  const getAccountLabel = (address: string) => {
    if(!address) return "";

    const storageKey = "joyAnimalsAccountLabels";
    const normalizedAddress = address.toLowerCase();
    const storedLabels = JSON.parse(localStorage.getItem(storageKey) || "{}");

    if(storedLabels[normalizedAddress]) {
      return storedLabels[normalizedAddress];
    }

    const nextLabel = `Account ${Object.keys(storedLabels).length + 1}`;
    storedLabels[normalizedAddress] = nextLabel;
    localStorage.setItem(storageKey, JSON.stringify(storedLabels));

    return nextLabel;
  };

  const setActiveAccount = (address: string) => {
    setAccount(address || "");
    setAccountLabel(address ? getAccountLabel(address) : "");
  };

  const getChainName = (value: string) => {
    if(value === "0xaa36a7") return "Sepolia";
    if(value === "0x1") return "Ethereum";
    if(value === "0x89") return "Polygon";
    return value ? `Chain ${value}` : "Network unknown";
  };

  const checkChain = async() => {
    try {
      if(window.ethereum) {
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setChainId(currentChainId || "");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const checkAccount = async() => {
    try {
      if(window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        const selectedAccount = window.ethereum.selectedAddress || accounts[0];
        setActiveAccount(selectedAccount || "");
      }
    } catch (error) {
      console.error(error);
    }
  }

  // 메타마스크를 통해서 계정을 가져오는 함수
  const getAccount = async(): Promise<string | undefined> => {
    if(!window.ethereum) {
      alert("Install Metamask!");
      return;
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const selectedAccount = window.ethereum.selectedAddress || accounts[0];
    setActiveAccount(selectedAccount || "");
    return selectedAccount;
  }

  const switchAccount = async() => {
    if(!window.ethereum) {
      alert("Install Metamask!");
      return;
    }

    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    await getAccount();
  }

	  useEffect(() => {
    checkAccount();
    checkChain();

    if(window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        const selectedAccount = window.ethereum.selectedAddress || accounts[0];
        setActiveAccount(selectedAccount || "");
        setTimeout(checkAccount, 300);
      };
      const handleChainChanged = (currentChainId: string) => {
        setChainId(currentChainId || "");
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      window.addEventListener("focus", checkAccount);
      document.addEventListener("visibilitychange", checkAccount);
      const accountCheckInterval = setInterval(checkAccount, 1500);

      return () => {
        window.removeEventListener("focus", checkAccount);
        document.removeEventListener("visibilitychange", checkAccount);
        clearInterval(accountCheckInterval);

        if(window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  },[]);

  return (
    <BrowserRouter>
      <Layout
        account={account}
        accountLabel={accountLabel}
        chainName={getChainName(chainId)}
        connectAccount={getAccount}
        switchAccount={switchAccount}
      >
        <Routes>
           <Route path="/" element={<Main account={account} getAccount={getAccount}/>} />
           <Route path="/my-animal" element={<MyAnimal account={account} getAccount={getAccount}/>} />
           <Route path="/sale-animal" element={<SaleAnimal account={account} getAccount={getAccount}/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
  ;
};

export default App;
