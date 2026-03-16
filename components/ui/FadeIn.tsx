'use client';
// Client component for fade animations

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    id?: string;
}

export const FadeIn = ({ children, delay = 0, className = '', id }: FadeInProps) => {
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: 'easeOut', delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
