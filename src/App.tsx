import { useEffect, useState } from 'react'

import './App.css'



interface FoolishFridge {
  id: String;
  warning: number;
  time: number;
  dateTime: string;
}


function App() {
  const [foolishFridgeWithWarning, setFoolishFridgeWithWarning] = useState<FoolishFridge>();
  const [foolishFridgeWithoutWarning, setFoolishFridgeWithoutWarning] = useState<FoolishFridge>();
  const [foolishfridgeArray, setFoolishFridgeArray] = useState<FoolishFridge[]>([{ id: "123", warning: 9, time: 0, dateTime: "2000-02-20" }]);
  const [access, setAccess] = useState<Boolean>(false);
  const [activeWarning, setActiveWarning] = useState<boolean>(false);
  const [lastWarningMessage, setLastWarningMessage] = useState<string>("");
  const [lastNonWarningMessage, setLastNonWarningMessage] = useState<string>("");


  async function fetchFoolishFridge() {
    // const result = await fetch("http://localhost:8080/FoolishFridge")
    const result = await fetch("https://oyster-app-6w8rt.ondigitalocean.app/FoolishFridge");
    const data: FoolishFridge[] = await result.json();

    if (data && foolishfridgeArray[foolishfridgeArray.length - 1].id !== data[data.length - 1].id) {
      data.reverse();

      if (data.find(data => data.warning === 1 || 2)) {
        const lastWarning: FoolishFridge = data.find(data => data.warning == 1)!;
        setFoolishFridgeWithWarning(lastWarning);
      }
      if (data.find(data => data.warning === 0)) {
        const lastNonWarning: FoolishFridge = data.find(data => data.warning == 0)!;
        setFoolishFridgeWithoutWarning(lastNonWarning);
      }
      setFoolishFridgeArray(data.reverse());
    }
    checkIfFoolishFridgeIsOpenNow();
  }



  async function checkIfFoolishFridgeIsOpenNow() {
    if (foolishfridgeArray[foolishfridgeArray.length - 1].warning === 1) {
      setActiveWarning(true);

    } else if (foolishfridgeArray[foolishfridgeArray.length - 1].warning === 0 || 2) {
      setActiveWarning(false);
    }
  }

  async function fetchLastNonWarningMessage(lastNonWarning: FoolishFridge) {
    const response = await fetch("https://oyster-app-6w8rt.ondigitalocean.app/Fetch/AiMessage", {
      //const response: Response = await fetch("http://localhost:8080/Fetch/AiMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        "prompt": lastNonWarning
      })
    });
    const data: string = await response.text();
    setLastNonWarningMessage(data);
  }

  async function fetchLastWarningMessage(lastWarning: FoolishFridge) {
    const response = await fetch("https://oyster-app-6w8rt.ondigitalocean.app/Fetch/AiMessage", {
      // const response: Response = await fetch("http://localhost:8080/Fetch/AiMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        "prompt": lastWarning
      })
    })
    const data: string = await response.text();
    setLastWarningMessage(data);
  }

  useEffect(() => {
    fetchFoolishFridge();
  }, []);

  useEffect(() => {
    getAiMessages()
  }, [foolishfridgeArray]);

  useEffect(() => {
    const interval: number = setInterval(async () => {
      await fetchFoolishFridge();
    }, 300000);  // Calling the server every 5th minute to save money on server costs. Re-write from an interval to some sort of websocket solution to make it much faster and cheaper.
    return () => clearInterval(interval);
  }, [foolishfridgeArray]);

  const BuyAccsessButton = () => {
    const handleClick = async () => {
      const response: Response = await fetch("http://localhost:8080/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });

      const responseBody: any = await response.json();
      window.location.replace(responseBody.paymentUrl)
    };
    return <button onClick={handleClick}>Buy accsess for 10kr</button>
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.has("success")) {
      setAccess(true);
    }
    if (query.has("fail")) {
      setAccess(false);
    }
  }, []);

  function getAiMessages() {
    if (foolishfridgeArray.find(foolishfridge => foolishfridge.warning === 0)) {
      fetchLastNonWarningMessage(foolishFridgeWithoutWarning!);
    }

    if (foolishfridgeArray.find(foolishfridge => foolishfridge.warning === 1)) {
      fetchLastWarningMessage(foolishFridgeWithWarning!);
    }
  }

  return (
    <>
      {access ?
        <div> <h1>Foolish Fridge</h1>
          {activeWarning === true ?
            <div>
              <h1>****   Kylen är öppen   ****</h1>
            </div>
            :
            <div>
              <h1>****   Kylen är stängd   ****</h1>
              <h2>Senste öppning med varning: </h2>
              <h3> {foolishFridgeWithWarning?.dateTime}</h3>
              <p> {lastWarningMessage}</p>
              <h2>Senaste öppning utan varning: </h2>
              <h3>{foolishFridgeWithoutWarning?.dateTime}</h3>
              <p>{lastNonWarningMessage}</p>
            </div>}
        </div>
        :
        <div>
          <h1>Foolish Fridge</h1>
          <BuyAccsessButton />
        </div>

      }
    </>
  )
}
export default App