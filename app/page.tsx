"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const features = [
  {
    icon: "fas fa-robot",
    title: "AI-Powered Automation",
    description: "Intelligent bots that learn and adapt to your business needs",
  },
  {
    icon: "fas fa-comments",
    title: "Multi-Platform Integration",
    description: "Connect WhatsApp, Facebook, Instagram, and more in one place",
  },
  {
    icon: "fas fa-bolt",
    title: "Lightning Fast",
    description: "Process thousands of messages and tasks in seconds",
  },
  {
    icon: "fas fa-users",
    title: "Team Collaboration",
    description: "Work together seamlessly with advanced team features",
  },
  {
    icon: "fas fa-chart-line",
    title: "Advanced Analytics",
    description: "Deep insights into your automation performance",
  },
  {
    icon: "fas fa-shield-alt",
    title: "Enterprise Security",
    description: "Bank-level security for your sensitive business data",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.05 }}>
            <Image
              src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1752042604/mbg_logo_l7xfr2.png"
              alt="MBG Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-800">MBG</span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                <Link href="/login">Login</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/register">Register</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto">
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Automate Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Business
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your business with AI-powered automation. Connect all your platforms, streamline workflows, and
              scale effortlessly with MBG's cutting-edge solutions.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                >
                  <Link href="/register">
                    Get Started Free
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 bg-transparent"
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Powerful Automation Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to automate, optimize, and scale your business operations
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-white/70 border-gray-200 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl">
                  <CardContent className="p-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/25"
                    >
                      <i className={`${feature.icon} text-white text-lg`}></i>
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-gray-600 mb-8">Join thousands of businesses already automating with MBG</p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                >
                  <Link href="/register">
                    Start Free Trial
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 bg-white/50">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image
              src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1752042604/mbg_logo_l7xfr2.png"
              alt="MBG Logo"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-xl font-bold text-gray-800">MBG</span>
          </div>
          <p className="text-gray-600">MBG 2024 - All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}
