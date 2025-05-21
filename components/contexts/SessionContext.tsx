import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

export interface Session {
    user: {
        name: string;
        email: string;
    };
}

interface SessionContextType {
    session: Session | null;
    setSession: Dispatch<SetStateAction<Session | null>>;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
    children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession(): SessionContextType {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}