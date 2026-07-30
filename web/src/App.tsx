import { useEffect, useState } from "react";
import { api, type AppState } from "./api";

export default function App() {
  const [state, setState] = useState<AppState>({
    counter: 0,
    lastAction: "none",
  });
  const [error, setError] = useState<string | null>(null);

  const run = async (name: string, fn: () => Promise<AppState>) => {
    try {
      setError(null);
      const prevCounter = state.counter;
      const newState = await fn();
      setState(newState);

      const metadata: Record<string, unknown> =
        name === "reset"
          ? {
              previousCounterValue: prevCounter,
              counterValue: newState.counter,
              lastAction: newState.lastAction,
            }
          : name === "refresh"
            ? { counterValue: newState.counter }
            : {
                counterValue: newState.counter,
                lastAction: newState.lastAction,
              };

      window.pendo?.track?.(`demo-${name}`, metadata);
    } catch (e) {
      const errorMessage = (e as Error).message;
      setError(errorMessage);
      window.pendo?.track?.("counter_action_failed", {
        action: name,
        errorMessage,
      });
    }
  };

  useEffect(() => {
    run("load", api.getState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 480,
        margin: "4rem auto",
        textAlign: "center",
      }}
    >
      <h1>QAWolf Demo</h1>

      <p
        data-testid="counter-value"
        style={{ fontSize: "3rem", margin: "1rem 0" }}
      >
        {state.counter}
      </p>
      <p data-testid="last-action" style={{ color: "#666" }}>
        Last action: {state.lastAction}
      </p>

      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          data-testid="btn-increment"
          onClick={() => run("increment", api.increment)}
        >
          Increment
        </button>
        <button
          data-testid="btn-decrement"
          onClick={() => run("decrement", api.decrement)}
        >
          Decrement
        </button>
        <button data-testid="btn-reset" onClick={() => run("reset", api.reset)}>
          Reset
        </button>
        <button
          data-testid="btn-refresh"
          onClick={() => run("refresh", api.getState)}
        >
          Refresh
        </button>
      </div>

      {error && (
        <p data-testid="error" style={{ color: "crimson", marginTop: 16 }}>
          {error}
        </p>
      )}
    </main>
  );
}
