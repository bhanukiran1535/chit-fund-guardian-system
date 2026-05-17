import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    'Bank-grade security and compliance',
    'Real-time analytics and reporting',
    'Automated payment processing',
    'Dedicated 24/7 support',
    'Unlimited group management',
    'Mobile-optimized interface',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-4 py-2 bg-white/20 border border-white/30 rounded-full mb-6 backdrop-blur-sm"
            >
              <span className="w-2 h-2 bg-white rounded-full mr-2" />
              <span className="text-sm font-semibold text-white">Start Your Free Trial Today</span>
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your Group Management?
            </h2>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join hundreds of organizations already using Chitfunds to manage their chit groups with unprecedented efficiency and security.
            </p>

            {/* Benefits List */}
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4 mb-10"
            >
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-center text-white"
                >
                  <CheckCircle className="w-5 h-5 mr-3 text-emerald-300 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:shadow-xl transition-all font-bold flex items-center justify-center group"
              >
                Start Free Trial Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const element = document.querySelector('#faq');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-bold"
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Trust Badge */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-blue-100 text-sm mt-6"
            >
              ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
            </motion.p>
          </motion.div>

          {/* Right Content - Animated Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900">Starter Plan</h3>
                  <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900">
                    ₹0<span className="text-xl text-slate-500">/month</span>
                  </span>
                  <p className="text-slate-600 text-sm mt-2">14-day free trial, then choose a plan</p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {[
                    '1 Group Management',
                    'Up to 50 Members',
                    'Real-time Analytics',
                    'Basic Support',
                    'Payment Processing',
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center text-slate-700"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/signup')}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Get Started
                </motion.button>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
