import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'What is Chitfunds and how does it work?',
      answer: 'Chitfunds is a modern platform designed to simplify chit group management. It allows you to create groups, manage members, track contributions, process payments, and generate detailed reports - all in one secure place. Our system handles member auctions, payment tracking, and compliance automatically.',
    },
    {
      question: 'Is Chitfunds secure and compliant?',
      answer: 'Absolutely. We use bank-grade encryption (AES-256), two-factor authentication, and comply with international security standards including ISO 27001. All transactions are logged for audit purposes, and we maintain complete compliance with financial regulations.',
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We support all major payment gateways including debit cards, credit cards, UPI, net banking, and digital wallets. Payments are processed instantly and securely with automated settlement to group accounts.',
    },
    {
      question: 'Can I manage multiple groups?',
      answer: 'Yes! Chitfunds is designed for enterprise scale. You can manage unlimited groups, with different member sets, contribution amounts, and schedules. Our admin dashboard gives you a complete overview of all your groups.',
    },
    {
      question: 'What support do you provide?',
      answer: 'We offer 24/7 email and chat support, detailed documentation, and video tutorials. Our dedicated support team is always ready to help with onboarding, technical issues, or any questions about the platform.',
    },
    {
      question: 'What is the pricing model?',
      answer: 'We offer flexible pricing plans starting from a free tier for individual groups, to enterprise plans for organizations. Each plan includes different features and member limits. Contact our sales team for custom enterprise pricing.',
    },
    {
      question: 'Can I migrate from my current system?',
      answer: 'Yes! Our data migration team can help you transfer your existing groups and member data. We provide step-by-step migration guides and ensure zero data loss during the transition.',
    },
    {
      question: 'Do you offer API access?',
      answer: 'Yes, we provide comprehensive REST APIs for enterprise customers. This allows you to integrate Chitfunds with your existing systems and build custom workflows tailored to your needs.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200/50 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-amber-600 rounded-full mr-2" />
            <span className="text-sm font-semibold text-amber-600">Got Questions?</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600">
            Find answers to common questions about Chitfunds
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="overflow-hidden"
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 bg-white border border-slate-200/50 rounded-xl hover:border-blue-200/50 transition-colors group"
                whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}
              >
                <span className="text-left text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-b from-blue-50/50 to-white border-t-0 border border-slate-200/50 rounded-b-xl"
                  >
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="p-6 text-slate-600 leading-relaxed"
                    >
                      {faq.answer}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 p-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200/30 rounded-xl text-center"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Didn't find what you're looking for?</h3>
          <p className="text-slate-600 mb-6">
            Contact our support team for detailed assistance with your specific needs.
          </p>
          <motion.a
            href="mailto:support@chitfunds.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-blue-200 transition-all font-semibold"
          >
            Get in Touch
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
