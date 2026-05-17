import React from 'react';
import { motion } from 'framer-motion';
import { Users, Lock, BarChart3, Zap, Shield, AlertCircle } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: 'Group Management',
      description: 'Create, manage, and scale chit groups with powerful administrative tools designed for enterprises.',
      color: 'from-blue-600 to-blue-700',
      delay: 0,
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track group performance, member contributions, and financial flows with comprehensive dashboards.',
      color: 'from-emerald-600 to-emerald-700',
      delay: 0.1,
    },
    {
      icon: Lock,
      title: 'Bank-grade Security',
      description: 'Military-grade encryption, two-factor authentication, and compliance with international security standards.',
      color: 'from-purple-600 to-purple-700',
      delay: 0.2,
    },
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Process payments instantly with integrated payment gateways and automated settlement systems.',
      color: 'from-orange-600 to-orange-700',
      delay: 0.3,
    },
    {
      icon: Shield,
      title: 'Audit & Compliance',
      description: 'Complete audit trail, compliance reporting, and regulatory adherence for enterprise peace of mind.',
      color: 'from-pink-600 to-pink-700',
      delay: 0.4,
    },
    {
      icon: AlertCircle,
      title: 'Smart Notifications',
      description: 'Real-time alerts for payments, approvals, and group milestones via email, SMS, and push.',
      color: 'from-indigo-600 to-indigo-700',
      delay: 0.5,
    },
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="features" className="py-20 lg:py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl" />
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
            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200/50 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
            <span className="text-sm font-semibold text-blue-600">Powerful Features</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to Manage Groups at Scale
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Built with enterprise requirements in mind. From real-time analytics to bank-grade security, Chitfunds handles every aspect of group management.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-slate-200/50 hover:border-blue-200/50 transition-all shadow-sm hover:shadow-lg"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-6 shadow-lg`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                {/* Accent line */}
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.4 }}
                  className={`mt-6 h-1 bg-gradient-to-r ${feature.color} rounded-full`}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-slate-600 mb-4">Want to see how it works?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-blue-200 transition-all font-semibold"
          >
            Watch Demo
            <span className="ml-2">→</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
