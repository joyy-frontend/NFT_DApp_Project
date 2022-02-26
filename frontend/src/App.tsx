import React, { FC, useEffect, useState } from "react";
import { Button } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from "./routes/main";

const App: FC = () => {
  const [account, setAccount] = useState<string>("");

  // 메타마스크를 통해서 계정을 가져오는 함수
  const getAccount = async() => {
    try {
      if(window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
      } else {
        alert("Install Metamask!");
      }
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    getAccount();
  },[account]);

  useEffect(() => {
    console.log(account);
  },[account]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main account={account}/>} />
      </Routes>
    </BrowserRouter>
  )
  ;
};

export default App;
