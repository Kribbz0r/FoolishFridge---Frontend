import { useEffect, useState } from 'react'
import './App.css'


interface FoolishFridge {
  id: String;
  warning: number;
  time: number;
  dateTime: String;
}

function App() {
  const [lastTime, setLastTime] = useState<number>(0);

  function fetchFoolishFridge(): void {

    console.log("Vi är i funktionen");
    fetch("https://oyster-app-6w8rt.ondigitalocean.app/FoolishFridge")
      .then(res => res.json())
      .then((data: FoolishFridge[]) => {
        setLastTime(data[data.length - 1].time);
      })
  }

  useEffect(() => {
    console.log("Vi är i effekten");
    fetchFoolishFridge();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFoolishFridge();
    }, 10000);
    return () => clearInterval(interval);
  }, [])



  useEffect(() => {
    console.log("Detta är lastTime: " + lastTime);

  }, [lastTime])




  return (
    <>
      <h1>Last time in MS</h1>
      <h2>{lastTime}</h2>
    </>
  )
}

export default App
