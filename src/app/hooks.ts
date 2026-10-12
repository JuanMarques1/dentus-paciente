import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "./SessionProvider";
import type { PatientApi } from "../services/PatientApi";
import { errorMessage } from "../services/ApiError";
export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}
export function useResource<T>(
  load: (api: PatientApi) => Promise<T>,
  key = "",
) {
  const { run } = useSession();
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  const loader = useRef(load);
  loader.current = load;
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    setLoading(true);
    run((api) => loader.current(api))
      .then((value) => {
        if (active) setData(value);
      })
      .catch((error) => {
        if (active) setError(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [run, key, revision]);
  return {
    data,
    setData,
    error,
    loading,
    retry: () => setRevision((value) => value + 1),
  };
}
export function useAction() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const locked = useRef(false),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const execute = useCallback(
    async (operation: () => Promise<void>, message = "") => {
      if (locked.current) return false;
      locked.current = true;
      setBusy(true);
      setError("");
      setSuccess("");
      try {
        await operation();
        if (alive.current) setSuccess(message);
        return true;
      } catch (error) {
        if (alive.current) setError(errorMessage(error));
        return false;
      } finally {
        locked.current = false;
        if (alive.current) setBusy(false);
      }
    },
    [],
  );
  return { busy, error, success, execute, setError, setSuccess };
}
