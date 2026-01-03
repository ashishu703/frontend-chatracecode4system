"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const cardTemplates = [
  {
    id: 1,
    title: "Product Showcase",
    description: "Showcase your products with beautiful cards",
    card: {
      image: "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Product+Card",
      title: "Premium Product",
      price: "₹999",
      description: "Get the best quality product delivered to your doorstep",
      button: "View Details"
    },
    headerGradient: "from-green-500 to-green-600",
  },
  {
    id: 2,
    title: "Service Offer",
    description: "Highlight your services with interactive cards",
    card: {
      image: "https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Service+Card",
      title: "Expert Consultation",
      price: "Starting at ₹499",
      description: "Get expert advice from our professional team",
      button: "Book Now"
    },
    headerGradient: "from-blue-500 to-blue-600",
  },
  {
    id: 3,
    title: "Special Offer",
    description: "Promote offers with engaging card templates",
    card: {
      image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Offer+Card",
      title: "Special Discount",
      price: "50% OFF",
      description: "Limited time offer! Grab your deal now",
      button: "Claim Offer"
    },
    headerGradient: "from-purple-500 to-purple-600",
  },
]

export default function CardTemplateSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [messageState, setMessageState] = useState<'sending' | 'sent' | 'seen'>('sending')
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % cardTemplates.length)
      setMessageState('sending')
      setShowCard(false)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Reset state when slide changes
    setMessageState('sending')
    setShowCard(false)

    // Animation sequence
    const timer1 = setTimeout(() => {
      setShowCard(true)
    }, 1000)

    const timer2 = setTimeout(() => {
      setMessageState('sent')
    }, 2000)

    const timer3 = setTimeout(() => {
      setMessageState('seen')
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [currentSlide])

  const currentTemplate = cardTemplates[currentSlide]

  return (
    <div className="relative flex flex-col items-center">
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

          {/* Chat Header */}
          <div className={`bg-gradient-to-r ${currentTemplate.headerGradient} px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Image
                src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
                alt="code4system Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm font-semibold text-white">code4system</span>
              <i className="fas fa-check-circle text-blue-400 text-xs"></i>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-video text-white text-sm"></i>
              <i className="fas fa-phone text-white text-sm"></i>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 pb-16 space-y-3 bg-gray-50 h-[calc(100%-120px)] overflow-y-auto">
            {/* User Message */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-end items-start gap-2"
            >
              <div className="bg-green-500 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                <p className="text-sm text-white">Show me your products</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-green-100">10:32 AM</span>
                </div>
              </div>
            </motion.div>

            {/* Bot Card Template Message */}
            <AnimatePresence mode="wait">
              {showCard && (
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-start items-start gap-2"
                >
                  <Image
                    src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
                    alt="code4system Logo"
                    width={24}
                    height={24}
                    className="rounded-full flex-shrink-0"
                  />
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-lg max-w-[85%] overflow-hidden border border-gray-200">
                    {/* Card Image */}
                    <div className="relative w-full h-32 bg-gradient-to-r from-purple-400 to-pink-400">
                      <img
                        src={currentTemplate.card.image}
                        alt={currentTemplate.card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Card Content */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{currentTemplate.card.title}</h4>
                          <p className="text-purple-600 font-bold text-sm mt-1">{currentTemplate.card.price}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{currentTemplate.card.description}</p>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">
                        {currentTemplate.card.button}
                      </button>
                    </div>
                    {/* Message Status */}
                    <div className="px-3 pb-2 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">10:33 AM</span>
                      <div className="flex items-center gap-1">
                        {messageState === 'sending' && (
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            <i className="fas fa-clock text-gray-400 text-[10px]"></i>
                          </motion.div>
                        )}
                        {messageState === 'sent' && (
                          <i className="fas fa-check text-blue-500 text-[10px]"></i>
                        )}
                        {messageState === 'seen' && (
                          <>
                            <span className="text-[10px] text-blue-500 mr-1">Seen</span>
                            <i className="fas fa-check-double text-blue-500 text-[10px]"></i>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Message Input */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
            <i className="fas fa-smile text-gray-400"></i>
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
            />
            <i className="fas fa-paper-plane text-green-500"></i>
          </div>
        </div>
      </div>

      {/* Slider Indicators */}
      <div className="flex gap-2 mt-4">
        {cardTemplates.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index)
              setMessageState('sending')
              setShowCard(false)
            }}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index
                ? `bg-gradient-to-r ${currentTemplate.headerGradient} w-8`
                : "bg-gray-300 w-2"
            }`}
          />
        ))}
      </div>

      {/* Template Info */}
      <div className="mt-4 text-center">
        <h4 className="font-semibold text-gray-900">{currentTemplate.title}</h4>
        <p className="text-sm text-gray-600">{currentTemplate.description}</p>
      </div>
    </div>
  )
}

