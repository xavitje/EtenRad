import { useEffect, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

function App() {
  const [items, setItems] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [chosen, setChosen] = useState("");
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function loadItems() {
      const { data, error } = await supabase
        .from("items")
        .select("label")
        .order("id", { ascending: true });
      if (!error && data) {
        setItems(data.map((row) => row.label));
      }
    }
    loadItems();
  }, []);

  function getRandomColor() {
    return `hsl(${Math.random() * 360}, 80%, 55%)`;
  }

  function drawWheel() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 450;
    const radius = size / 2;

    if (!items.length) {
      ctx.clearRect(0, 0, size, size);
      return;
    }

    const arc = (Math.PI * 2) / items.length;
    ctx.clearRect(0, 0, size, size);

    items.forEach((item, i) => {
      const angle = i * arc;

      ctx.beginPath();
      ctx.fillStyle = getRandomColor();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, angle, angle + arc);
      ctx.fill();

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#f9fafb";
      ctx.font = "18px system-ui, sans-serif";
      ctx.fillText(item, radius - 25, 6);
      ctx.restore();
    });
  }

  useEffect(() => {
    drawWheel();
  }, [items]);

  function spinWheel() {
    if (!items.length || isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setChosen("");

    const canvas = canvasRef.current;
    if (!canvas) return;

    const arcDeg = 360 / items.length;
    const rotations = Math.floor(Math.random() * 3) + 5;
    const finalRotation = Math.random() * 360;
    const totalDegrees = rotations * 360 + finalRotation;

    const pointerAngle = (finalRotation + 90) % 360;
    let selectedIndex =
      Math.floor((items.length - pointerAngle / arcDeg) % items.length);
    if (selectedIndex < 0) selectedIndex += items.length;

    canvas.style.transform = `rotate(${totalDegrees}deg)`;
    const duration = 4500;

    setTimeout(() => {
      setChosen(items[selectedIndex]);
      setShowResult(true);
      setIsSpinning(false);
    }, duration + 100);
  }

  function addItem() {
    const value = window.prompt("Voer een nieuw item in:");
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, trimmed]);
  }

  return (
    <div id="app">
      <h1>Wat gaan we eten?</h1>

      <div id="wheel-card">
        <div id="wheel-wrapper">
          <canvas id="wheel" ref={canvasRef} width={450} height={450} />
          <div id="pointer" />
        </div>

        <div id="controls">
          <button id="spinBtn" onClick={spinWheel}>
            Spin the wheel
          </button>
        </div>

        <div id="result" className={showResult ? "" : "hidden"}>
          <p>Jouw keuze:</p>
          <div id="chosen" className={showResult ? "glow" : ""}>
            {chosen}
          </div>
        </div>
      </div>

      <button id="addItemBtn" onClick={addItem}>
        +
      </button>
    </div>
  );
}

export default App;


