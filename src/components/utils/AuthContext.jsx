"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user", error);
            }
        }
        setLoading(false);
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            setUser: (nextUser) => {
                setUser(nextUser);
                if (nextUser) {
                    sessionStorage.setItem("user", JSON.stringify(nextUser));
                } else {
                    sessionStorage.removeItem("user");
                }
            },
            clearUser: () => {
                setUser(null);
                sessionStorage.removeItem("user");
            },
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
