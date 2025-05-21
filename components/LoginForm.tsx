// LoginWithCredentials.tsx
import { useSession } from "@/components/contexts/SessionContext";
import { Colors } from "@/constants/Colors";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";

export default function LoginWithCredentials() {
    const [email, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setSession } = useSession();

    const login = async () => {
        try {
            const csrfRes = await fetch(
                "https://www.prospectorminerals.com/api/auth/csrf",
                { credentials: "include" }
            );
            const { csrfToken } = await csrfRes.json();

            const res = await fetch(
                "https://www.prospectorminerals.com/api/auth/callback/credentials",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        email,
                        password,
                        csrfToken: csrfToken,
                    }).toString(),
                    credentials: "include",
                }
            );

            console.log("Login response:", res);

            const sessionRes = await fetch(
                "https://www.prospectorminerals.com/api/auth/session",
                { credentials: "include" }
            );
            const session = await sessionRes.json();
            console.log("Logged in session:", session);
            setSession(session);
            Alert.alert("Login Success", `Hello ${session.user.name}`);
        } catch (err) {
            console.error("Login error", err);
        }
    };

    const colorScheme = useColorScheme();

    return (
        <View style={styles.inputContainer}>
            <TextInput
                placeholder="Username"
                onChangeText={setUsername}
                value={email}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={colorScheme === 'light' ? Colors.light.inputPlaceholder : Colors.dark.inputPlaceholder}
                style={[styles.searchBar, colorScheme === "light" ? styles.searchBarLight : styles.searchBarDark]}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
                style={[styles.searchBar, colorScheme === "light" ? styles.searchBarLight : styles.searchBarDark]}
            />
            <Pressable
                style={[
                    styles.loginButton,
                    colorScheme === "light" ? styles.loginButtonLight : styles.loginButtonDark,
                ]}
                onPress={login}
            >
                <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 8        
    },
    searchBar: {
        height: 48,
        borderColor: '#e0e0e0',
        borderRadius: 24,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: 'WorkSans_400Regular',
    },
    searchBarInputLight: {
        color: Colors.light.inputText,
    },
    searchBarInputDark: {
        color: Colors.dark.inputText,
    },
    searchBarLight: {
        backgroundColor: Colors.light.inputBackground,
        color: Colors.light.inputText,
    },
    searchBarDark: {
        backgroundColor: Colors.dark.inputBackground,
        color: Colors.dark.inputText,
    },
    loginButton: {
        marginTop: 8,
        borderRadius: 8,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonLight: {
        backgroundColor: Colors.light.primary,
    },  
    loginButtonDark: {
        backgroundColor: Colors.dark.primary,
    },
    loginButtonText: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
    },
    loginButtonTextLight: {
        color: Colors.light.inputText,
    },
    loginButtonTextDark: {  
        color: Colors.dark.inputText,
    },
});
