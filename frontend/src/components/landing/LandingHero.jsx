import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

const LandingHero = () => {
  const navigate = useNavigate();

  // Canvas animation for growth graph
  useEffect(() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationFrameId;
    let progress = 0;

    const drawGrowthChart = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.03)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.05)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 6; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Generate smooth curve data points
      const points = [];
      const pointCount = 12;
      const baseY = height * 0.7;
      
      for (let i = 0; i < pointCount; i++) {
        const x = (width / (pointCount - 1)) * i;
        // Create upward trending curve with some variation
        const trend = (i / pointCount) * (height * 0.5);
        const variation = Math.sin(i * 0.5) * (height * 0.08);
        const y = baseY - trend - variation;
        points.push({ x, y });
      }

      // Animate to current progress
      const currentPointCount = Math.ceil(pointCount * progress);
      
      if (currentPointCount > 0) {
        // Draw filled area under curve
        const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
        areaGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        areaGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.fillStyle = areaGradient;
        ctx.beginPath();
        ctx.moveTo(points[0].x, height);
        
        for (let i = 0; i < currentPointCount; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.lineTo(points[currentPointCount - 1].x, height);
        ctx.fill();

        // Draw line
        ctx.strokeStyle = 'rgba(59, 130, 246, 1)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        for (let i = 0; i < currentPointCount; i++) {
          if (i === 0) {
            ctx.moveTo(points[i].x, points[i].y);
          } else {
            // Smooth curve using quadratic bezier
            const xc = (points[i].x + points[i - 1].x) / 2;
            const yc = (points[i].y + points[i - 1].y) / 2;
            ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
          }
        }
        
        ctx.stroke();

        // Draw points with glow
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        for (let i = 0; i < currentPointCount; i++) {
          ctx.beginPath();
          ctx.arc(points[i].x, points[i].y, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(59, 130, 246, 1)';
        for (let i = 0; i < currentPointCount; i++) {
          ctx.beginPath();
          ctx.arc(points[i].x, points[i].y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      progress += 0.01;
      if (progress <= 1) {
        animationFrameId = requestAnimationFrame(drawGrowthChart);
      }
    };

    drawGrowthChart();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-200/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200/50 rounded-full mb-6"
            >
              <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-600">Intelligent Group Savings Management</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Manage Chit Groups with <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Enterprise Precision</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-600 mb-8 leading-relaxed"
            >
              Chitfunds is the modern platform for managing chit groups at scale. Secure, transparent, and designed for enterprises that demand excellence in group savings management.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-blue-200 transition-all font-semibold flex items-center justify-center group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const element = document.querySelector('#features');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                Learn More
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center mt-8 pt-8 border-t border-slate-200"
            >
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="ml-4 text-slate-600 text-sm">
                <span className="font-semibold text-slate-900">500+</span> groups trust Chitfunds for secure management
              </p>
            </motion.div>
          </motion.div>

          {/* Right Content - Animated Chart */}
          <motion.div
            variants={itemVariants}
            className="relative h-96 lg:h-full min-h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-200/30 shadow-xl"
          >
            <canvas
              id="hero-canvas"
              className="w-full h-full absolute inset-0"
            />
            
            {/* Decorative elements */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-6 right-6 bg-white/80 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-slate-900">+2.4% Growth</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, 20, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-slate-900">125 Active Groups</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Managed securely</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
