'use client';

import React from 'react';
import Link from 'next/link';
import { useSettings } from '../../context/SettingsContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    href?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'white';
    icon?: string; // FontAwesome icon class
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
    // Overriding some props to handle both anchor and button cases safely
    target?: string;
    rel?: string;
}

export const Button: React.FC<ButtonProps> = (props) => {
    const {
        children,
        href,
        onClick,
        className = '',
        variant = 'primary',
        icon = 'fa-arrow-right',
        showIcon = true,
        size = 'md',
        type = 'button',
        disabled = false,
        target,
        rel,
        ...passThroughProps
    } = props;

    const { settings } = useSettings();
    // Base styles
    const baseStyles = "inline-flex items-center justify-center gap-4 rounded-full font-bold uppercase tracking-widest transition-all duration-300 group shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed no-underline !no-underline font-body";

    const sizeStyles = {
        sm: "py-2.5 px-6 text-[10px]",
        md: "py-4 px-10 text-sm",
        lg: "py-5 px-12 text-base"
    };

    // Dynamic styles based on variant using CSS variables
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return "bg-terracotta text-white hover:bg-forest";
            case 'secondary':
                return "bg-forest text-white hover:bg-terracotta";
            case 'outline':
                return "bg-transparent text-forest border border-forest/20 hover:bg-forest hover:text-white";
            case 'white':
                return "bg-white text-forest hover:bg-forest hover:text-white";
            default:
                return "bg-terracotta text-white hover:bg-forest";
        }
    };

    const variantClasses = getVariantClasses();

    // Icon container styles
    const iconContainerBase = "rounded-full flex items-center justify-center transition-colors duration-300 flex-shrink-0";

    const iconContainerSize = {
        sm: "w-7 h-7 text-[10px]",
        md: "w-10 h-10 text-xs",
        lg: "w-12 h-12 text-sm"
    };

    const iconContainerVariants = {
        primary: "bg-white/20 group-hover:bg-white/30",
        secondary: "bg-white/10 group-hover:bg-white/20",
        outline: "bg-forest/10 group-hover:bg-white/20",
        white: "bg-forest/10 group-hover:bg-white/10"
    };

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantClasses} ${className}`;

    // Inner Content
    const content = (
        <>
            {showIcon && (
                <div className={`${iconContainerBase} ${iconContainerSize[size]} ${iconContainerVariants[variant]}`}>
                    <i className={`fas ${icon} -rotate-45 group-hover:rotate-0 transition-transform duration-300`}></i>
                </div>
            )}
            <span className="font-bold tracking-wide">{children}</span>
        </>
    );

    const commonProps = {
        className: combinedClassName,
    };

    if (href) {
        if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) {
            return (
                <a
                    href={href}
                    target={target}
                    rel={rel}
                    onClick={onClick as any}
                    {...commonProps}
                    {...(passThroughProps as any)}
                >
                    {content}
                </a>
            );
        }

        return (
            <Link
                href={href}
                target={target}
                rel={rel}
                onClick={onClick as any}
                {...commonProps}
                {...(passThroughProps as any)}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            {...commonProps}
            {...passThroughProps}
        >
            {content}
        </button>
    );
};
