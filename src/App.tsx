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
    const result = await fetch("http://localhost:8080/FoolishFridge")
    //const result = await fetch("https://oyster-app-6w8rt.ondigitalocean.app/FoolishFridge")
    const data = await result.json()

    const dataArray: FoolishFridge[] = data;

    console.log("Det senaste IDt: " + foolishfridgeArray[foolishfridgeArray.length - 1].id);
    console.log("IDT som kom in: " + dataArray[dataArray.length - 1].id);

    if (dataArray && foolishfridgeArray[foolishfridgeArray.length - 1].id !== dataArray[dataArray.length - 1].id) {
      console.log("Det sista IDt är inte samma för foolishFridgeArray och dataArray, och dataArray existerar");

      if (dataArray.find(dataArray => dataArray.warning === 1 || 2)) {
        const lastWarning: FoolishFridge = dataArray.reverse().find(dataArray => dataArray.warning == 1)!;
        console.log("Sista varningiens datum: " + lastWarning.dateTime);
        setFoolishFridgeWithWarning(lastWarning);
      }

      if (dataArray.find(dataArray => dataArray.warning === 0)) {
        const lastNonWarning: FoolishFridge = dataArray.reverse().find(dataArray => dataArray.warning == 0)!;
        console.log("Sista icke-varningiens datum: " + lastNonWarning.dateTime);
        setFoolishFridgeWithoutWarning(lastNonWarning);
      }
      setFoolishFridgeArray(dataArray);

      // if (foolishfridgeArray[1].id.length > 3) {
      //   checkIfFoolishFridgeIsOpenNow()
      // }
    }
  }




  async function checkIfFoolishFridgeIsOpenNow() {
    if (foolishfridgeArray[foolishfridgeArray.length - 1].warning === 1) {
      setActiveWarning(true);
      console.log("Toköppet");

    } else if (foolishfridgeArray[foolishfridgeArray.length - 1].warning === 0 || 2) {
      alert("Kylskåpet är stängt")
      setActiveWarning(false);
      console.log("nope det är stängt");

    } else {
      console.log("Something is wrong");
    }
  }

  async function fetchLastNonWarningMessage(lastNonWarning: FoolishFridge) {
    //const response = await fetch("https://oyster-app-6w8rt.ondigitalocean.app/Fetch/AiMessage",{
    const response = await fetch("http://localhost:8080/Fetch/AiMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        "prompt": lastNonWarning
      })
    });
    const data = await response.text();
    setLastNonWarningMessage(data);
  }

  async function fetchLastWarningMessage(lastWarning: FoolishFridge) {
    //  const response = await fetch("https://oyster-app-6w8rt.ondigitalocean.app/Fetch/AiMessage",{
    const response = await fetch("http://localhost:8080/Fetch/AiMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        "prompt": lastWarning
      })
    })
    const data = await response.text();
    setLastWarningMessage(data)
  }


  useEffect(() => {
    fetchFoolishFridge();
  }, []);


  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchFoolishFridge();
    }, 10000);
    return () => clearInterval(interval);
  }, [])


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
    console.log("Boop");

    if (query.has("success")) {
      setAccess(true)

    }
    if (query.has("fail")) {
      setAccess(false)

    }
  }, []);

  function getAiMessages() {
    if (foolishfridgeArray.find(foolishfridge => foolishfridge.warning === 0)) {
      fetchLastNonWarningMessage(foolishFridgeWithoutWarning!)
      console.log(foolishfridgeArray.find(foolishfridge => foolishfridge.warning === 0));
    }

    if (foolishfridgeArray.find(foolishfridge => foolishfridge.warning === 1)) {
      fetchLastWarningMessage(foolishFridgeWithWarning!)
      console.log(foolishfridgeArray.find(foolishfridge => foolishfridge.warning === 1));
    }
  }


  return (
    <>
      {access ?
        <div> <h1>Foolish Fridge</h1>
          {activeWarning === true ?
            <div>
              <h1>****   Kylen är öppen   ****</h1>
              <button onClick={checkIfFoolishFridgeIsOpenNow}>Är kylen fortfarande öppen?</button>
            </div>
            :
            <div>
              <h2>Senste varningen: </h2>
              <h3> {foolishFridgeWithWarning?.dateTime}</h3>
              <p> {lastWarningMessage}</p>
              <h2>Senaste icke-varningen: </h2>
              <h3>{foolishFridgeWithoutWarning?.dateTime}</h3>
              <p>{lastNonWarningMessage}</p>
              <button onClick={getAiMessages}> AI</button>
              <button onClick={checkIfFoolishFridgeIsOpenNow}>Glömde jag stänga?</button>

              <p>{foolishFridgeWithWarning?.id}</p>

            </div>}

        </div>
        :
        <BuyAccsessButton />}
    </>
  )
}
export default App