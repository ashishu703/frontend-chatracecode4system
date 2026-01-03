"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const sliderConfigs = [
  {
    id: 1,
    gradient: "from-blue-500 to-purple-500",
    headerGradient: "from-blue-500 to-purple-500",
    messages: [
      { text: "Interested in your services", type: "user", delay: 0.5 },
      { text: "Great! Let me connect you with our team.", type: "bot", delay: 1.5 },
      { text: "When can I get a quote?", type: "user", delay: 2.5 },
      { text: "Our team will reach out within 24 hours!", type: "bot", delay: 3.5 },
    ]
  },
  {
    id: 2,
    gradient: "from-pink-500 to-orange-500",
    headerGradient: "from-pink-500 to-orange-500",
    messages: [
      { text: "Love your products! ❤️", type: "user", delay: 0.5 },
      { text: "Thank you! Check out our latest collection.", type: "bot", delay: 1.5 },
      { text: "Do you have discounts?", type: "user", delay: 2.5 },
      { text: "Yes! Use code INSTA20 for 20% off!", type: "bot", delay: 3.5 },
    ]
  },
  {
    id: 3,
    gradient: "from-green-500 to-teal-500",
    headerGradient: "from-green-500 to-teal-500",
    messages: [
      { text: "Hello! I need help with my order", type: "user", delay: 0.5 },
      { text: "Hi! I'd be happy to help. Can you share your order number?", type: "bot", delay: 1.5 },
      { text: "Sure, it's #12345", type: "user", delay: 2.5 },
      { text: "Thank you! Your order is being processed and will be delivered tomorrow.", type: "bot", delay: 3.5 },
    ]
  }
]

export default function PhoneMockup() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [messageStates, setMessageStates] = useState<{ [key: number]: { visible: boolean; seen: boolean; sent: boolean } }>({})

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderConfigs.length)
      setMessageStates({})
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const currentConfig = sliderConfigs[currentSlide]
    currentConfig.messages.forEach((msg, index) => {
      setTimeout(() => {
        setMessageStates((prev) => ({
          ...prev,
          [index]: { visible: true, seen: false, sent: false }
        }))
      }, msg.delay * 1000)

      setTimeout(() => {
        setMessageStates((prev) => ({
          ...prev,
          [index]: { ...prev[index], seen: true }
        }))
      }, msg.delay * 1000 + 800)

      setTimeout(() => {
        setMessageStates((prev) => ({
          ...prev,
          [index]: { ...prev[index], sent: true }
        }))
      }, msg.delay * 1000 + 1200)
    })
  }, [currentSlide])

  const currentConfig = sliderConfigs[currentSlide]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative flex flex-col items-center justify-center pb-20"
    >
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-black rounded-[40px] p-2 shadow-2xl">
        {/* Phone Screen */}
        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
          {/* Status Bar */}
          <div className="bg-white px-4 pt-2 pb-1 flex items-center justify-between text-xs font-medium">
            <span className="text-black">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-black rounded-sm">
                <div className="w-3 h-1.5 bg-black rounded-sm m-0.5"></div>
              </div>
              <div className="w-4 h-3 border border-black rounded-sm relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Header with Gradient */}
          <div className={`bg-gradient-to-r ${currentConfig.headerGradient} px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Image
                src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
                alt="Code4U Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm font-semibold text-white">Code4U Card</span>
              <i className="fas fa-check-circle text-blue-400 text-xs"></i>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-chevron-down text-white text-xs"></i>
              <i className="fas fa-video text-white text-sm"></i>
              <i className="fab fa-instagram text-white text-sm"></i>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 pb-16 space-y-3 bg-gray-50 h-[calc(100%-120px)] overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentConfig.messages.map((msg, index) => {
                const state = messageStates[index] || { visible: false, seen: false, sent: false }
                
                if (!state.visible) return null

                return (
                  <motion.div
                    key={`${currentSlide}-${index}`}
                    initial={{ opacity: 0, x: msg.type === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
                  >
                    {msg.type === "bot" && (
                      <Image
                        src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
                        alt="Code4U Logo"
                        width={24}
                        height={24}
                        className="rounded-full flex-shrink-0"
                      />
                    )}
                    <div className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                      msg.type === "user" 
                        ? "bg-gray-200 rounded-tr-sm" 
                        : `bg-gradient-to-r ${currentConfig.gradient} rounded-tl-sm`
                    }`}>
                      <p className={`text-sm ${msg.type === "user" ? "text-gray-800" : "text-white"}`}>
                        {msg.text}
                      </p>
                      {msg.type === "user" && state.seen && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-500">Seen</span>
                          <i className="fas fa-check-double text-blue-500 text-[10px]"></i>
                        </div>
                      )}
                      {msg.type === "bot" && state.sent && (
                        <div className="flex items-center gap-1 mt-1">
                          <i className="fas fa-check text-white/70 text-[10px]"></i>
                        </div>
                      )}
                    </div>
                    {msg.type === "user" && (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 text-xs font-semibold">U</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Slider Indicators */}
      <div className="flex gap-2 mt-4">
        {sliderConfigs.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index)
              setMessageStates({})
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index 
                ? `bg-gradient-to-r ${currentConfig.gradient} w-6` 
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Social Media Icons Below Mobile */}
      <div className="flex items-center gap-6 mt-6">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="flex items-center justify-center"
        >
          <i className="fab fa-whatsapp text-green-500 text-3xl"></i>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="flex items-center justify-center"
        >
          <i className="fab fa-facebook text-blue-600 text-3xl"></i>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="flex items-center justify-center"
        >
          <i className="fab fa-instagram text-pink-500 text-3xl"></i>
        </motion.div>
      </div>
    </motion.div>
  )
}
