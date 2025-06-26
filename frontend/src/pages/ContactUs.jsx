import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isDarkTheme, setIsDarkTheme] = useState(false);

    useEffect(() => {
        // Check if dark theme is active
        const isDark = document.body.classList.contains('dark');
        setIsDarkTheme(isDark);

        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isDark = document.body.classList.contains('dark');
                    setIsDarkTheme(isDark);
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    const titleColor = isDarkTheme ? 'text-white' : 'text-gray-800';
    const subtitleColor = isDarkTheme ? 'text-white' : 'text-gray-600';
    const bgColor = isDarkTheme ? 'bg-gray-800' : 'bg-white';
    const labelColor = isDarkTheme ? 'text-white' : 'text-gray-700';

    return (
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50 flex flex-col">
            <Header />
            <div className="flex-1 flex w-full items-center justify-center p-4">
                <div className={`${bgColor} rounded-lg shadow-lg p-8 w-full max-w-2xl`}>
                    <div className="text-center mb-8">
                        <h1 className={`font-bold text-4xl ${titleColor} mb-2`}>Contact Us</h1>
                        <p className={subtitleColor}>Get in touch with us. We'd love to hear from you.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className={`block text-sm font-medium ${labelColor} mb-2`}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="email" className={`block text-sm font-medium ${labelColor} mb-2`}>
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your email address"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="subject" className={`block text-sm font-medium ${labelColor} mb-2`}>
                                Subject *
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                                placeholder="Enter the subject of your message"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="message" className={`block text-sm font-medium ${labelColor} mb-2`}>
                                Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="6"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 resize-none"
                                placeholder="Enter your message here..."
                            ></textarea>
                        </div>
                        
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                </div>
                                <h3 className={`font-semibold ${titleColor}`}>Phone</h3>
                                <p className="text-gray-600">+1 (555) 123-4567</p>
                            </div>
                            
                            <div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <h3 className={`font-semibold ${titleColor}`}>Email</h3>
                                <p className="text-gray-600">info@iotwatch.com</p>
                            </div>
                            
                            <div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>
                                <h3 className={`font-semibold ${titleColor}`}>Address</h3>
                                <p className="text-gray-600">123 Tech Street, Digital City</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactUs; 