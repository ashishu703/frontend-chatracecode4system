"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhonebookView from "./PhonebookView";
import ContactTags from "./ContactTags";
import CustomFields from "./CustomFields";

export default function ContactsManagement() {
  const [activeTab, setActiveTab] = useState<"contacts" | "tags" | "custom-fields">("contacts");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-6 py-4 font-medium text-sm transition-colors relative ${
              activeTab === "contacts"
                ? "text-green-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Contacts
            {activeTab === "contacts" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`px-6 py-4 font-medium text-sm transition-colors relative ${
              activeTab === "tags"
                ? "text-green-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tags
            {activeTab === "tags" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("custom-fields")}
            className={`px-6 py-4 font-medium text-sm transition-colors relative ${
              activeTab === "custom-fields"
                ? "text-green-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Custom Fields
            {activeTab === "custom-fields" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "contacts" && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PhonebookView />
          </motion.div>
        )}
        {activeTab === "tags" && (
          <motion.div
            key="tags"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ContactTags />
          </motion.div>
        )}
        {activeTab === "custom-fields" && (
          <motion.div
            key="custom-fields"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CustomFields />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}