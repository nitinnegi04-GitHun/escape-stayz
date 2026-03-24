'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

interface ReservationSidebarProps {
    hotelName: string;
    location: string;
}

export const ReservationSidebar: React.FC<ReservationSidebarProps> = ({ hotelName, location }) => {
    const { settings } = useSettings();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    // Calendar Helper Functions
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 = Sunday
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

        if (!checkInDate || (checkInDate && checkOutDate)) {
            setCheckInDate(clickedDate);
            setCheckOutDate(null);
        } else if (clickedDate < checkInDate) {
            setCheckInDate(clickedDate);
        } else if (clickedDate > checkInDate) {
            setCheckOutDate(clickedDate);
        }
    };

    // Construct Calendar Grid
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const isCheckIn = checkInDate && isSameDay(date, checkInDate);
        const isCheckOut = checkOutDate && isSameDay(date, checkOutDate);
        const isInRange = checkInDate && checkOutDate && date > checkInDate && date < checkOutDate;
        const isToday = isSameDay(date, new Date());

        days.push(
            <button
                key={i}
                onClick={() => handleDateClick(i)}
                className={`h-8 w-8 rounded-full text-xs font-medium flex items-center justify-center transition-all duration-200 relative active:scale-90
                    ${(isCheckIn || isCheckOut) ? 'bg-terracotta-gradient text-white shadow-md scale-110 z-10' : ''}
                    ${isInRange ? 'bg-terracotta/10 text-terracotta rounded-none' : ''}
                    ${!isCheckIn && !isCheckOut && !isInRange ? 'hover:bg-forest/5 text-charcoal' : ''}
                    ${isToday && !isCheckIn && !isCheckOut && !isInRange ? 'text-forest font-bold ring-1 ring-forest/20' : ''}
                `}
            >
                {i}
            </button>
        );
    }

    // WhatsApp Integration
    const handleBookNow = () => {
        const formatDate = (d: Date | null) => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Select Date';
        const phone = settings.contact.phone.replace(/[^0-9]/g, ''); // Sanitize phone number (remove all non-numeric characters)

        const message = `Hi Team ! I would like to book a stay at *${hotelName}* in ${location}.%0A%0A🗓 *Dates*: ${formatDate(checkInDate)} - ${formatDate(checkOutDate)}%0A👥 *Guests*: ${adults} Adults, ${children} Children%0A%0APlease confirm availability.`;

        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white p-6 lg:p-8 rounded-3xl shadow-2xl shadow-forest/10 border border-forest/5 text-center max-h-[calc(100vh-150px)] overflow-y-auto flex flex-col custom-scrollbar"
        >
            <div className="flex flex-col items-center mb-8">
                <span className="text-[15px] font-bold  tracking-[0.3em] text-terracotta mb-2 text-center block w-full">Reservation Desk</span>
            </div>

            {/* Calendar Section */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-4 px-2">
                    <button onClick={handlePrevMonth} className="text-charcoal/40 hover:text-forest transition-colors">
                        <i className="fas fa-chevron-left text-xs"></i>
                    </button>
                    <span className="font-heading font-bold text-charcoal uppercase text-sm tracking-wider">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth} className="text-charcoal/40 hover:text-forest transition-colors">
                        <i className="fas fa-chevron-right text-xs"></i>
                    </button>
                </div>

                {/* Weekdays Header */}
                <div className="grid grid-cols-7 mb-2 text-[10px] font-bold text-charcoal/30 uppercase tracking-widest text-center">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                    {days}
                </div>
            </div>

            {/* Guest Selection */}
            <div className="flex flex-col gap-2 mb-2">
                {/* Adults */}
                <div className="bg-cream/50 px-4 py-2 rounded-2xl border border-forest/5 flex items-center justify-between">
                    <div className="text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 block mb-0.5">Adults</span>
                        <span className="font-heading font-bold text-sm">Over 12 Years</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-xl px-2 py-1 shadow-sm border border-forest/5">
                        <button
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-6 h-6 flex items-center justify-center text-charcoal/40 hover:text-terracotta transition-colors active:scale-75"
                        >
                            <i className="fas fa-minus text-[10px]"></i>
                        </button>
                        <span className="font-bold text-charcoal w-4 text-center">{adults}</span>
                        <button
                            onClick={() => setAdults(adults + 1)}
                            className="w-6 h-6 flex items-center justify-center text-charcoal/40 hover:text-forest transition-colors active:scale-75"
                        >
                            <i className="fas fa-plus text-[10px]"></i>
                        </button>
                    </div>
                </div>

                {/* Children */}
                <div className="bg-cream/50 px-4 py-2 rounded-2xl border border-forest/5 flex items-center justify-between">
                    <div className="text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 block mb-0.5">Children</span>
                        <span className="font-heading font-bold text-sm">Over 9 Years</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-xl px-2 py-1 shadow-sm border border-forest/5">
                        <button
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="w-6 h-6 flex items-center justify-center text-charcoal/40 hover:text-terracotta transition-colors active:scale-75"
                        >
                            <i className="fas fa-minus text-[10px]"></i>
                        </button>
                        <span className="font-bold text-charcoal w-4 text-center">{children}</span>
                        <button
                            onClick={() => setChildren(children + 1)}
                            className="w-6 h-6 flex items-center justify-center text-charcoal/40 hover:text-forest transition-colors active:scale-75"
                        >
                            <i className="fas fa-plus text-[10px]"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Book Now Button */}
            <button
                onClick={handleBookNow}
                className="w-full shrink-0 group/btn flex items-center justify-center gap-2 bg-whatsapp text-white px-5 py-3.5 rounded-full hover:bg-whatsapp-dark transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
                <i className="fab fa-whatsapp text-lg"></i>
                <span className="font-bold text-sm uppercase tracking-widest">Send Query on WhatsApp</span>
            </button>
            <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30 italic mt-2 pb-0 shrink-0">Direct booking priority ensured</p>
        </motion.div>
    );
};
