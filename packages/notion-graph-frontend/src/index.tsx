import React from "react";
// @ts-ignore
import { createRoot } from "react-dom/client";
import { App } from "src/app";
import "normalize.css";

const container = document.getElementById(`root`);
const root = createRoot(container!);
root.render(<App />);
