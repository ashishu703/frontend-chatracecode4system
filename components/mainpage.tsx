"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import CardTemplateSlider from "./CardTemplateSlider"

export default function MainPage() {
  const router = useRouter()
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Lead form submitted:", leadForm)
  }

  const handleLoginClick = () => {
    router.push("/login")
  }

  const handleGetStartedClick = () => {
    router.push("/register")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
              alt="Code4System Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <span className="text-gray-800 font-bold text-xl">code4system</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://code4system.anocabapp.com/privacy-policy"
              className="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium text-sm hidden md:inline-block"
            >
              Privacy Policy
            </a>
            <a
              href="https://code4system.anocabapp.com/terms-and-condition"
              className="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium text-sm hidden md:inline-block"
            >
              Terms
            </a>
            <Button variant="outline" className="border-gray-300" onClick={handleLoginClick}>
              Login
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleGetStartedClick}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium mb-4">
              SaaS Automation Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Automate Your Business{" "}
              <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                Communication
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Transform customer interactions with AI-powered automation for WhatsApp, Facebook, Instagram, and Ads. Connect, engage, and convert effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg" onClick={handleGetStartedClick}>
                Start Free Trial →
              </Button>
              <Button variant="outline" className="border-gray-300 px-8 py-6 text-lg">
                See How It Works
              </Button>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Messages/Day</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">99%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg mx-auto">
              <Image
                src="/hero-illustration-communication.png"
                alt="Hero Illustration - Communication and Automation"
                width={800}
                height={800}
                className="object-contain w-full h-auto"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Automation Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24 bg-white">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fab fa-whatsapp text-white text-2xl"></i>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">WhatsApp Automation</h2>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Automate customer conversations, send bulk messages, and manage your WhatsApp Business account efficiently.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <i className="fas fa-robot text-green-500 text-xl mt-1"></i>
                <span className="text-gray-700">Auto-reply to customer messages instantly</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-bullhorn text-green-500 text-xl mt-1"></i>
                <span className="text-gray-700">Send bulk broadcasts to 1000+ users</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-clock text-green-500 text-xl mt-1"></i>
                <span className="text-gray-700">Schedule messages for optimal delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-chart-bar text-green-500 text-xl mt-1"></i>
                <span className="text-gray-700">Track delivery and read receipts</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-users text-green-500 text-xl mt-1"></i>
                <span className="text-gray-700">Manage multiple conversations efficiently</span>
              </li>
            </ul>
            <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg" onClick={handleGetStartedClick}>
              Get Started →
            </Button>
          </motion.div>

          {/* Right Card Template Slider */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            <CardTemplateSlider />
          </motion.div>
        </div>
      </section>

      {/* Instagram Automation Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <i className="fab fa-instagram text-white text-2xl"></i>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Instagram Automation</h2>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Automate comment replies, manage DMs, and engage with your Instagram audience automatically.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <i className="fas fa-comment text-pink-500 text-xl mt-1"></i>
                <span className="text-gray-700">Auto-reply to post comments instantly</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-paper-plane text-pink-500 text-xl mt-1"></i>
                <span className="text-gray-700">Send automatic DM messages to commenters</span>
              </li>
            </ul>
            <Button className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-8 py-6 text-lg" onClick={handleGetStartedClick}>
              Get Started →
            </Button>
          </motion.div>

          {/* Right Instagram Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-xl">
              <CardContent className="p-6 space-y-4">
                {/* Instagram Post */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {/* MY LOGO */}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">my company name</div>
                      <div className="text-xs text-gray-500">3 hours ago</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-400 to-yellow-300 rounded-lg p-8 text-center">
                    <div className="text-2xl font-bold text-white mb-2">Grow your BUSINESS Faster</div>
                    <div className="text-xl text-white">with WhatsApp</div>
                  </div>
                </div>
                {/* Account Status */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Image
                    src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
                    alt="code4system Logo"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">code4system</div>
                    <span className="text-xs text-green-600">• Active</span>
                  </div>
                </div>
                {/* DM Chat */}
                <div className="space-y-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 mb-1">Hi! Thanks for your comment ❤️ I&apos;ve sent you a message with more details about our services. Check your DMs!</p>
                    <span className="text-xs text-gray-400">2 min ago</span>
                  </div>
                  <div className="bg-pink-100 rounded-lg p-3 ml-auto max-w-[80%]">
                    <p className="text-sm text-gray-700">Tell me about Instagram automation.</p>
                    <span className="text-xs text-gray-400">1 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Facebook Automation Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24 bg-white">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <i className="fab fa-facebook text-white text-2xl"></i>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Facebook Automation</h2>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Automate Facebook Messenger conversations, manage comments, and engage with your Facebook audience seamlessly.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <i className="fas fa-comments text-blue-600 text-xl mt-1"></i>
                <span className="text-gray-700">Auto-reply to Facebook Messenger messages</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-comment-dots text-blue-600 text-xl mt-1"></i>
                <span className="text-gray-700">Manage Facebook page comments automatically</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-bolt text-blue-600 text-xl mt-1"></i>
                <span className="text-gray-700">Quick reply templates for common queries</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-chart-line text-blue-600 text-xl mt-1"></i>
                <span className="text-gray-700">Track engagement and response metrics</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-users text-blue-600 text-xl mt-1"></i>
                <span className="text-gray-700">Manage multiple Facebook pages from one dashboard</span>
              </li>
            </ul>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg" onClick={handleGetStartedClick}>
              Get Started →
            </Button>
          </motion.div>

          {/* Right Facebook Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-xl">
              <CardContent className="p-6 space-y-4">
                {/* Facebook Page Post */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
                      alt="code4system Logo"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">code4system</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-center text-white">
                    <div className="text-xl font-bold mb-2">Transform Your Business</div>
                    <div className="text-sm">with Facebook Automation</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                      <i className="fas fa-thumbs-up"></i>
                      <span className="text-sm">Like</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                      <i className="fas fa-comment"></i>
                      <span className="text-sm">Comment</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                      <i className="fas fa-share"></i>
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
                {/* Messenger Chat */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-700 mb-1">Hi! I saw your post. Can you tell me more about your services?</p>
                    <span className="text-xs text-gray-400">1 min ago</span>
                  </div>
                  <div className="bg-blue-600 rounded-lg p-3 ml-auto max-w-[80%]">
                    <p className="text-sm text-white">Thanks for your interest! Let me send you more details...</p>
                    <span className="text-xs text-blue-100">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Ads Automation Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Ad Card & Lead Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Sponsored Ad Card */}
            <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-gray-400/30 px-3 py-1 rounded-full text-xs">Sponsored</span>
                  <i className="fab fa-facebook text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold mb-2">Transform Your Business Today!</h3>
                <p className="text-purple-100 mb-4">Automate WhatsApp, Facebook & Instagram</p>
                <div className="bg-white/10 rounded-lg p-4 mb-4 relative">
                  <div className="bg-gradient-to-r from-green-400 to-black rounded-lg p-6 text-center">
                    <div className="text-white font-bold text-lg mb-2">Grow your BUSINESS Faster</div>
                    <div className="text-white mb-2">with WhatsApp Business API</div>
                    <div className="flex items-center justify-center gap-2 text-green-300">
                      <i className="fab fa-whatsapp"></i>
                      <span>GREEN TICK</span>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    {/* Company logo and name */}
                    <div className="absolute top-2 right-2">
                      <Image
                        src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
                        alt="code4system Logo"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                    <div className="absolute bottom-2 right-2 text-white text-xs">code4system</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-purple-500/20 border-purple-300 text-white hover:bg-purple-500/30">
                    <i className="fas fa-info-circle mr-2"></i>Learn More
                  </Button>
                  <Button className="flex-1 bg-purple-700 hover:bg-purple-800 text-white" onClick={handleGetStartedClick}>
                    <i className="fas fa-briefcase mr-2"></i>Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lead Form */}
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Lead Form</h3>
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="bg-gray-50 border-gray-300"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="bg-gray-50 border-gray-300"
                  />
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="bg-gray-50 border-gray-300"
                  />
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Ads Automation Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <i className="fas fa-star text-purple-600 text-3xl"></i>
              <h2 className="text-4xl font-bold text-gray-900">Ads Automation</h2>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Convert ad clicks into conversations. Automatically send WhatsApp messages when users interact with your ads.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <i className="fas fa-star text-purple-600 text-xl mt-1"></i>
                <span className="text-gray-700">Track ad clicks and form submissions</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-paper-plane text-purple-600 text-xl mt-1"></i>
                <span className="text-gray-700">Auto-send WhatsApp messages to leads</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-chart-bar text-purple-600 text-xl mt-1"></i>
                <span className="text-gray-700">Track ad source in inbox view</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-chart-line text-purple-600 text-xl mt-1"></i>
                <span className="text-gray-700">Measure conversion rates</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-users text-purple-600 text-xl mt-1"></i>
                <span className="text-gray-700">Manage leads from multiple ad campaigns</span>
              </li>
            </ul>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg" onClick={handleGetStartedClick}>
              Get Started →
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the ideal plan for your business. All plans include our core automation features with flexible options.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Trial Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-xl h-full">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Trial Plan</h3>
                <p className="text-gray-500 mb-6">Free Trial</p>
                <div className="mb-6">
                  <div className="text-5xl font-bold text-purple-600 mb-2">₹0</div>
                  <p className="text-gray-500">for 7 Days</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">Contact Tags</span>
                  </li>
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">Contact Notes</span>
                  </li>
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">Chatbot Automation</span>
                  </li>
                  <li className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <i className="fas fa-times text-gray-400"></i>
                    <span className="text-gray-500">API Access</span>
                  </li>
                  <li className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                    <i className="fas fa-users text-blue-600"></i>
                    <span className="text-gray-700">10 Contacts</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-gray-300" onClick={handleGetStartedClick}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Basic/Standard Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="shadow-xl h-full border-2 border-purple-200">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Basic Plan</h3>
                <p className="text-gray-500 mb-6">Standard Features</p>
                <div className="mb-6">
                  <div className="text-5xl font-bold text-purple-600 mb-2">₹9,000</div>
                  <p className="text-gray-500">for 3 Months</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">Contact Tags</span>
                  </li>
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">Contact Notes</span>
                  </li>
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">Chatbot Automation</span>
                  </li>
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">API Access</span>
                  </li>
                  <li className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                    <i className="fas fa-users text-blue-600"></i>
                    <span className="text-gray-700">100 Contacts</span>
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleGetStartedClick}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full flex items-center gap-2 z-10">
              <i className="fas fa-star text-yellow-300"></i>
              <span className="text-sm font-semibold">Most Popular</span>
            </div>
            <Card className="shadow-xl h-full border-2 border-purple-300 bg-gradient-to-b from-purple-50 to-white">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                <p className="text-gray-500 mb-6">All Features</p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <div className="text-5xl font-bold text-purple-600">₹36,000</div>
                    <div className="text-2xl text-gray-400 line-through">₹42,480</div>
                  </div>
                  <p className="text-gray-500 mb-2">for 1 Year</p>
                  <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Save ₹6,480
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">Contact Tags</span>
                  </li>
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">Contact Notes</span>
                  </li>
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">Chatbot Automation</span>
                  </li>
                  <li className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                    <i className="fas fa-check text-green-600"></i>
                    <span className="text-gray-700">API Access</span>
                  </li>
                  <li className="flex items-center gap-2 bg-blue-100 p-3 rounded-lg">
                    <i className="fas fa-users text-blue-600"></i>
                    <span className="text-gray-700 font-semibold">Unlimited Contacts</span>
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleGetStartedClick}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <i className="fas fa-question text-white text-xl"></i>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <p className="text-gray-600 mb-8">
            Find answers to common questions about code4system automation platform
          </p>
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-500">No FAQs available at the moment.</p>
          </div>
        </motion.div>
      </section>

      {/* Call to Action Footer */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already automating with code4system
          </p>
          <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold border-2 border-blue-300" onClick={handleGetStartedClick}>
            Start Free Trial →
          </Button>
        </motion.div>
      </section>
    </div>
  )
}
