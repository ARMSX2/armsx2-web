/** @file useContactForm.jsx
 * @description: Hook for handling contact form submissions */

import { useState, useCallback } from "react";

export const useContactForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setLoading(true);
            setStatus(null);
            const formData = { name, email, message };
            try {
                const response = await fetch("/api/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    setStatus("Request sent successfully! We will contact you soon.");
                    setName("");
                    setEmail("");
                    setMessage("");
                } else {
                    const errorData = await response.json();
                    setStatus(
                        `Error: ${errorData.message || "An error occurred while sending."}`
                    );
                }
            } catch (error) {
                console.error("Network error:", error);
                setStatus("Connection error. Please check your network.");
            } finally {
                setLoading(false);
            }
        },
        [name, email, message]
    );
    return {
        name,
        email,
        message,
        status,
        loading,
        setName,
        setEmail,
        setMessage,
        handleSubmit,
    };
};