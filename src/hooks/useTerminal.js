import { useState, useCallback } from 'react';

const MAX_LOGS = 500;

export function useTerminal() {
    const [terminalLogs, setTerminalLogs] = useState([
        { msg: "Split IDE terminal ready.", type: "success" }
    ]);

    const logTerm = useCallback((msg, type = "normal") => {
        setTerminalLogs(prev => {
            const next = [...prev, { msg, type }];
            return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
        });
    }, []);

    const clearTerminal = useCallback(() => {
        setTerminalLogs([]);
    }, []);

    return { terminalLogs, logTerm, clearTerminal };
}
