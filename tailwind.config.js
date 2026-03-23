export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                forest: 'var(--color-forest)',
                cream: 'var(--color-cream)',
                terracotta: 'var(--color-terracotta)',
                charcoal: 'var(--color-charcoal)',
                whatsapp: '#25D366',
                'whatsapp-dark': '#128C7E',
            },
            backgroundImage: {
                'forest-gradient': 'linear-gradient(to right, #0F2027, #203A43, #2C5364)', // Example dark forest gradient
                'terracotta-gradient': 'linear-gradient(to right, #e52d27, #b31217)', // Example rich terracotta gradient
            },
            fontFamily: {
                heading: ['var(--font-heading)'],
                body: ['var(--font-body)'],
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
