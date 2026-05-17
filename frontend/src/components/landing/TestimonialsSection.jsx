import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: 'Rajesh Patel',
      role: 'CEO, Mumbai Finance Group',
      company: 'Mumbai Finance Group',
      image: '👨‍💼',
      rating: 5,
      text: 'Chitfunds transformed how we manage our 50+ chit groups. The transparency and automation have reduced disputes by 90%. Highly recommended for any organization!',
      metrics: '50+ Groups | 2000+ Members'
    },
    {
      name: 'Priya Sharma',
      role: 'Finance Director, Delhi Savings Collective',
      company: 'Delhi Savings Collective',
      image: '👩‍💼',
      rating: 5,
      text: 'The security features and audit trails give us complete peace of mind. Our audits are now 10x faster. The platform is truly enterprise-grade.',
      metrics: '35+ Groups | 1500+ Members'
    },
    {
      name: 'Amit Kumar',
      role: 'Operations Manager, Bangalore Investment Club',
      company: 'Bangalore Investment Club',
      image: '👨‍💻',
      rating: 5,
      text: 'The real-time analytics helped us identify inefficiencies we never knew existed. Payment processing is now instant. Worth every rupee!',
      metrics: '25+ Groups | 800+ Members'
    },
    {
      name: 'Sneha Desai',
      role: 'Founder, Pune Women Savings Network',
      company: 'Pune Women Savings Network',
      image: '👩‍🔬',
      rating: 5,
      text: 'Intuitive interface, powerful backend, and stellar support. Chitfunds made scaling our groups effortless. Couldn\'t ask for better!',
      metrics: '18+ Groups | 600+ Members'
    },
    {
      name: 'Vikram Singh',
      role: 'Group Administrator, National Chit Federation',
      company: 'National Chit Federation',
      image: '👨‍💻',
      rating: 5,
      text: 'We switched from spreadsheets and regret nothing. The compliance features alone save us hours every month. Chitfunds is a game-changer.',
      metrics: '100+ Groups | 5000+ Members'
    },
  ];

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 lg:py-32 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-200/50 rounded-full mb-6"
          >
            <Star className="w-4 h-4 text-purple-600 mr-2 fill-purple-600" />
            <span className="text-sm font-semibold text-purple-600">Loved by 500+ Groups</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have transformed their group management experience.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {testimonials.map(
              (testimonial, index) =>
                index === activeIndex && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                  >
                    <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200/30 rounded-2xl p-8 lg:p-12 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        {/* Left - Avatar and Info */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="text-center lg:text-left"
                        >
                          <div className="flex justify-center lg:justify-start">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl shadow-lg">
                              {testimonial.image}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mt-4">
                            {testimonial.name}
                          </h3>
                          <p className="text-slate-600 text-sm mt-1">{testimonial.role}</p>
                          <p className="text-slate-500 text-xs mt-2 font-medium">
                            {testimonial.company}
                          </p>

                          {/* Metrics */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="mt-4 p-3 bg-blue-100/40 rounded-lg border border-blue-200/50"
                          >
                            <p className="text-xs font-semibold text-blue-700">
                              {testimonial.metrics}
                            </p>
                          </motion.div>
                        </motion.div>

                        {/* Right - Testimonial Text */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          className="lg:col-span-2"
                        >
                          {/* Stars */}
                          <div className="flex justify-center lg:justify-start gap-2 mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.1 }}
                              >
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              </motion.div>
                            ))}
                          </div>

                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-lg text-slate-700 leading-relaxed italic mb-6"
                          >
                            "{testimonial.text}"
                          </motion.p>

                          {/* Highlight */}
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full origin-left"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex justify-center items-center gap-4 mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Indicators */}
            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? 'bg-blue-600 w-8'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </motion.div>

          {/* Testimonial Count */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-slate-500 mt-8 text-sm"
          >
            {activeIndex + 1} / {testimonials.length}
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-slate-200"
        >
          {[
            { number: '4.9/5', label: 'Average Rating' },
            { number: '500+', label: 'Active Groups' },
            { number: '10K+', label: 'Happy Members' },
            { number: '99.99%', label: 'Uptime' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.number}
              </p>
              <p className="text-slate-600 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
