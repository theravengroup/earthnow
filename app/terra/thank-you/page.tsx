"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TerraThankYouPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    screensOrdered: "",
    specialInstructions: "",
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      const response = await fetch("/api/terra-shipping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "14px 16px",
    width: "100%",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  const labelStyles = "block mb-2 font-sans text-[13px] text-[#94a3b8]";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0e17] px-6 py-24">
      {/* Breathing teal dot */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-4 h-2 w-2 rounded-full bg-[#14b8a6]"
        style={{ boxShadow: "0 0 12px rgba(20,184,166,0.6)" }}
      />

      {/* TERRA label */}
      <p className="font-mono text-[14px] uppercase tracking-[0.4em] text-[#14b8a6]">
        TERRA
      </p>

      {/* Thank you heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-6 text-center font-serif text-[56px] italic text-white"
      >
        Thank you for your order.
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-4 max-w-[500px] text-center font-sans text-[18px] text-[#94a3b8]"
      >
        Your pre-configured device ships within 5 business days. We just need your shipping address.
      </motion.p>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-12 w-full max-w-[560px] rounded-2xl p-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {submitted ? (
          <div className="py-8 text-center">
            <p className="font-sans text-[18px] text-[#14b8a6]">
              We&apos;ve got your details. Expect an email from us within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className={labelStyles}>
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                style={inputStyles}
                className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className={labelStyles}>
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                style={inputStyles}
                className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelStyles}>
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                style={inputStyles}
                className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
              />
            </div>

            {/* Street Address */}
            <div>
              <label htmlFor="streetAddress" className={labelStyles}>
                Street Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                required
                value={formData.streetAddress}
                onChange={handleChange}
                style={inputStyles}
                className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className={labelStyles}>
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  style={inputStyles}
                  className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
                />
              </div>
              <div>
                <label htmlFor="state" className={labelStyles}>
                  State <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  style={inputStyles}
                  className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
                />
              </div>
            </div>

            {/* ZIP & Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="zipCode" className={labelStyles}>
                  ZIP Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleChange}
                  style={inputStyles}
                  className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
                />
              </div>
              <div>
                <label htmlFor="country" className={labelStyles}>
                  Country <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  style={inputStyles}
                  className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
                />
              </div>
            </div>

            {/* Screens Ordered */}
            <div>
              <label htmlFor="screensOrdered" className={labelStyles}>
                Number of Screens Ordered <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                id="screensOrdered"
                name="screensOrdered"
                required
                min="1"
                value={formData.screensOrdered}
                onChange={handleChange}
                style={inputStyles}
                className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label htmlFor="specialInstructions" className={labelStyles}>
                Special Instructions (optional)
              </label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                rows={3}
                value={formData.specialInstructions}
                onChange={handleChange}
                style={{
                  ...inputStyles,
                  resize: "vertical",
                  minHeight: "80px",
                }}
                className="focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/50"
              />
            </div>

            {/* 90-Day Commitment Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="agreedToTerms"
                name="agreedToTerms"
                required
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 cursor-pointer appearance-none rounded border border-white/20 bg-transparent transition-all checked:border-[#14b8a6] checked:bg-[#14b8a6]"
                style={{
                  backgroundImage: formData.agreedToTerms
                    ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                    : "none",
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <label
                htmlFor="agreedToTerms"
                className="cursor-pointer font-sans text-[14px] leading-relaxed text-[#94a3b8]"
              >
                I agree to the{" "}
                <span className="text-white">90-day minimum commitment</span>
                {" "}for this Terra subscription.{" "}
                <span className="text-red-400">*</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#14b8a6] py-4 font-sans text-[16px] font-medium text-white transition-all duration-200 hover:bg-[#0d9488] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Shipping Details"}
            </button>

            {/* Error message */}
            {submitError && (
              <p className="mt-3 text-center font-sans text-[14px] text-red-400">
                Something went wrong. Please email{" "}
                <a href="mailto:terra@earthnow.app" className="underline">
                  terra@earthnow.app
                </a>{" "}
                directly.
              </p>
            )}
          </form>
        )}
      </motion.div>

      {/* Footer text */}
      <div className="mt-12 text-center">
        <p className="font-sans text-[14px] text-[#64748b]">
          Questions? Email{" "}
          <a
            href="mailto:terra@earthnow.app"
            className="text-[#14b8a6] underline underline-offset-2 transition-colors hover:text-[#5eead4]"
          >
            terra@earthnow.app
          </a>
        </p>
        <p className="mt-4 font-sans text-[12px] text-[#475569]">
          <Link href="/" className="hover:text-[#64748b] transition-colors">
            earthnow.app
          </Link>
        </p>
      </div>
    </main>
  );
}
