/** @file useContactForm.jsx
 * @description: Hook for handling contact form submissions */

import { useState, useCallback } from "react";

const RECIPIENTS = [
    { id: "communication", label: "Communication", email: "communication@armsx2.net" },
    { id: "medievalshell", label: "Medievalshell", email: "medievalshell@armsx2.net" },
    { id: "design", label: "Design", email: "design@armsx2.net" },
    { id: "general", label: "General", email: "armsx2mail@gmail.com" },
];

export const useContactForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [recipient, setRecipient] = useState(RECIPIENTS[0].id);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setLoading(true);
            setStatus(null);
            const target = RECIPIENTS.find((r) => r.id === recipient) || RECIPIENTS[0];
            const subject = `ARMSX2 contact from ${name || "visitor"}`;
            const body = `From: ${name} <${email}>\n\n${message}`;
            const mailtoUrl = `mailto:${target.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoUrl;
            setTimeout(() => {
                setStatus(`Opened your email client for ${target.email}. If nothing happened, send your message directly there.`);
                setLoading(false);
            }, 200);
        },
        [name, email, message, recipient]
    );

    return {
        name,
        email,
        message,
        recipient,
        recipients: RECIPIENTS,
        status,
        loading,
        setName,
        setEmail,
        setMessage,
        setRecipient,
        handleSubmit,
    };
};
