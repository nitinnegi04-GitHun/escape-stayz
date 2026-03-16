'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

/**
 * A wrapper for motion.div that simplifies client-side animations.
 * Helps prevent hydration mismatch errors when using framer-motion with Next.js.
 */
export const MotionDiv = (props: HTMLMotionProps<"div">) => {
    return <motion.div {...props}>{props.children}</motion.div>;
};
