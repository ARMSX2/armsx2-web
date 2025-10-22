import React, { forwardRef } from 'react';
import { MessageSquare, User, Mail, MessageCircle, Phone, MapPin, Send, Instagram, Github, Linkedin } from 'lucide-react';


const ContactUs = forwardRef(({ 
    handleSubmit, 
    name, 
    setName, 
    email, 
    setEmail, 
    message, 
    setMessage, 
    status,
    loading,
    onNavigate
}, ref) => {
    const MAIN_BG = "bg-[#0d0e14]";
    const CARD_BG = "bg-[#1c1c25]";
    const INPUT_BG = "bg-[#3b414d]";
    const PRIMARY_COLOR = "text-[#8b85fc]";
    const BUTTON_BG = "bg-[#6a5acd]";
    return (
        <section ref={ref} id="contact" className={`py-20 ${MAIN_BG} transition-colors duration-500 min-h-screen flex items-center`}>
            <img
              src="/icon.png"
              alt="ARMSX2 Logo"
              style={{
                opacity: window.innerWidth <= 550 ? 0.64582 : 0.8,
                transform: window.innerWidth <= 550 ? "scale(0.8)" : "scale(1)",
                filter: "drop-shadow(0 4px 10px rgba(193, 176, 255, 0.4))",
              }}
              className="fixed max-[336px]:top-5 max-[336px]:left-5 top-8 left-8 w-12 h-12 z-50 cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => onNavigate && onNavigate("home")}
            />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
                        Contact Us
                    </h2>
                    <p className="mt-4 text-xl text-gray-400">
                        We Are Here To Help You. Send Us A Message.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`${CARD_BG} p-8 rounded-xl shadow-2xl transition-shadow duration-500`}>
                        <h3 className="text-2xl font-semibold mb-8 text-white flex items-center">
                            <MessageSquare className={`w-6 h-6 mr-3 ${PRIMARY_COLOR}`} /> Send a Message
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                    Name
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`py-3 px-4 block w-full rounded-lg border-transparent ${INPUT_BG} text-white placeholder-gray-400 focus:ring-0 focus:border-transparent transition-colors`}
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`py-3 px-4 block w-full rounded-lg border-transparent ${INPUT_BG} text-white placeholder-gray-400 focus:ring-0 focus:border-transparent transition-colors`}
                                        placeholder="example@domain.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                    Message
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="4"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className={`py-3 px-4 block w-full rounded-lg border-transparent ${INPUT_BG} text-white placeholder-gray-400 focus:ring-0 focus:border-transparent transition-colors resize-none`}
                                        placeholder="What we can do for you?"
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            {status && (
                                <p className={`text-sm font-medium ${status.includes('successo') ? 'text-green-400' : 'text-red-400'}`}>
                                    {status}
                                </p>
                            )}
                            <div>
                                <button
                                    type="submit"
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white ${BUTTON_BG} hover:bg-[#7a6ce5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b85fc] focus:ring-offset-[#1c1c25] transition-colors duration-300 disabled:opacity-50`}
                                    disabled={!name || !email || !message || loading}
                                >
                                    <Send className="w-5 h-5 mr-2" />
                                    {loading ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="space-y-8">
                        <div className={`${CARD_BG} p-8 rounded-xl shadow-2xl transition-shadow duration-500`}>
                            <h3 className="text-2xl font-semibold mb-6 text-white">
                                Useful Details
                            </h3>
                            <ul className="space-y-4 text-gray-400">
                                <li className="flex items-center">
                                    <Mail className={`w-5 h-5 mr-4 ${PRIMARY_COLOR} flex-shrink-0`} />
                                    <span className="font-medium text-white mr-2">Email:</span>
                                    armsx2mail@gmail.com
                                </li>
                                <li className="flex items-center">
                                    <Phone className={`w-5 h-5 mr-4 ${PRIMARY_COLOR} flex-shrink-0`} />
                                    <span className="font-medium text-white mr-2">Telephone:</span>
                                    +66 04032000
                                </li>
                                <li className="flex items-start">
                                    <MapPin className={`w-5 h-5 mr-4 ${PRIMARY_COLOR} flex-shrink-0 mt-1`} />
                                    <div>
                                        <span className="font-medium text-white block">Address:</span>
                                        Hacker Road, 1
                                        <br />
                                        Silicon Valley, Cupertino
                                    </div>
                                </li>
                            </ul>
                        </div>
                        
                        {/* Social Media */}
                        <div className={`${CARD_BG} p-8 rounded-xl shadow-2xl transition-shadow duration-500`}>
                            <h3 className="text-2xl font-semibold mb-6 text-white">
                                Follow Us
                            </h3>
                            <div className="flex space-x-6">
                                <a href="#" aria-label="Instagram" className={`${PRIMARY_COLOR} hover:text-[#a09afa] transition-colors`}>
                                    <Instagram className="w-8 h-8" />
                                </a>
                                <a href="https://github.com/ARMSX2" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={`${PRIMARY_COLOR} hover:text-[#a09afa] transition-colors`}>
                                    <Github className="w-8 h-8" />
                                </a>
                                <a href="#" aria-label="LinkedIn" className={`${PRIMARY_COLOR} hover:text-[#a09afa] transition-colors`}>
                                    <Linkedin className="w-8 h-8" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

export default ContactUs;