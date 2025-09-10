'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Home, Mail } from 'lucide-react';

export default function NotFound404() {
    const [glitchActive, setGlitchActive] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const glitchInterval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 200);
        }, 3000);

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            clearInterval(glitchInterval);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleBackClick = () => {
        window.history.back();
    };

    const handleHomeClick = () => {
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
            {/* Dynamic background gradient following mouse */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none transition-all duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, white, transparent 40%)`
                }}
            />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">

                {/* Logo area */}
                <div className="mb-12 text-center">
                    <div className="text-2xl font-bold tracking-wider mb-2 opacity-80">
                        Traliq.<span className='font-bold'>ai</span>
                    </div>
                    <div className="h-0.5 w-16 bg-white mx-auto opacity-60" />
                </div>

                {/* 404 Display */}
                <div className="text-center mb-12">
                    <div className={`text-8xl md:text-9xl font-bold leading-none mb-4 transition-all duration-200 ${
                        glitchActive ? 'animate-pulse text-red-500 scale-105' : ''
                    }`}>
                        404
                    </div>
                    <div className="text-xl md:text-2xl tracking-widest opacity-80 mb-2">
                        PAGE NOT FOUND
                    </div>
                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-white to-transparent mx-auto opacity-40" />
                </div>

                {/* Error message */}
                <div className="text-center mb-12 max-w-md">
                    <p className="text-gray-300 leading-relaxed">
                        The page you&apos;re looking for seems to have vanished into the digital void.
                        But don&apos;t worry – even AI makes mistakes sometimes.
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <button
                        onClick={handleBackClick}
                        className="group flex-1 flex items-center justify-center gap-3 px-6 py-3 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/5 backdrop-blur-sm"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        GO BACK
                    </button>

                    <button
                        onClick={handleHomeClick}
                        className="group flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-white text-black hover:bg-gray-200 transition-all duration-300 font-semibold"
                    >
                        <Home size={18} className="group-hover:scale-110 transition-transform" />
                        HOME
                    </button>
                </div>

                {/* Quick links */}
                <div className="mt-16 flex gap-8 opacity-60">
                    <button className="group flex flex-col items-center gap-2 hover:opacity-100 transition-opacity">
                        <div className="p-3 border border-white/20 group-hover:border-white/40 transition-colors">
                            <Search size={20} />
                        </div>
                        <span className="text-xs tracking-wide">SEARCH</span>
                    </button>

                    <button className="group flex flex-col items-center gap-2 hover:opacity-100 transition-opacity">
                        <div className="p-3 border border-white/20 group-hover:border-white/40 transition-colors">
                            <Mail size={20} />
                        </div>
                        <span className="text-xs tracking-wide">CONTACT</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-xs opacity-40 tracking-widest">
                        ERROR_CODE: 404 | SYSTEM_STATUS: OPERATIONAL
                    </div>
                </div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white opacity-20 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-pulse"
                     style={{ top: '40%', animationDuration: '3s' }} />
            </div>
        </div>
    );
}