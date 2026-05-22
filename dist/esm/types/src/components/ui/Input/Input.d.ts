import * as React from 'react';
declare const Input: React.ForwardRefExoticComponent<(Omit<Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "size"> & {
    type?: React.ComponentProps<"input">["type"];
    size?: "sm" | "md" | "lg";
    variant?: "default" | "clean";
}, "ref"> | Omit<Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "type" | "size"> & {
    type: "textarea";
    size?: "sm" | "md" | "lg";
    variant?: "default" | "clean";
}, "ref">) & React.RefAttributes<HTMLInputElement | HTMLTextAreaElement>>;
export { Input };
