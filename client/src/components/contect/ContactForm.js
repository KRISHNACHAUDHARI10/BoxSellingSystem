import React, { useState } from "react";

// The main component now displays only the contact form, as requested.
// All styling has been converted from the provided CSS to Tailwind CSS classes.
export default function App() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Sending...");

    // This is a mock API call to simulate form submission.
    // In a real app, you would fetch your actual backend endpoint.
    setTimeout(() => {
      try {
        console.log("Form submitted:", form);
        setStatus("Message sent successfully! ✓");
        setForm({ fullName: "", email: "", phone: "", message: "" });
        setTimeout(() => setStatus(""), 4000);
      } catch (err) {
        console.error("Contact form error:", err);
        setStatus("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 1500); // Simulate network delay
  };

  return (
    // The main container now uses a light green background to match the overall theme
    <div
      className="bg-green-50 p-4 md:p-8"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="contact-container max-w-7xl mx-auto my-10 p-5 md:p-10 flex flex-col gap-10 bg-white rounded-2xl border border-green-200 shadow-lg">
        <div className="contact-header text-center mb-5">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-3">
            Get In Touch
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </p>
        </div>

        <div className="contact-content flex flex-col md:flex-row gap-10 justify-center items-start">
          <div className="contact-info flex-1 flex flex-col gap-5 min-w-[280px]">
            <div className="info-card bg-gray-50 border border-gray-200 rounded-xl p-6 text-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="info-icon text-3xl mb-2.5 text-green-600">📍</div>
              <h3 className="text-lg font-semibold mb-1.5 text-green-800">
                Our Location
              </h3>
              <p className="text-base text-gray-500">Pune, Maharastra, India</p>
            </div>
            <div className="info-card bg-gray-50 border border-gray-200 rounded-xl p-6 text-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="info-icon text-3xl mb-2.5 text-green-600">📞</div>
              <h3 className="text-lg font-semibold mb-1.5 text-green-800">
                Call Us
              </h3>
              <p className="text-base text-gray-500">+91 9512707825</p>
            </div>
            <div className="info-card bg-gray-50 border border-gray-200 rounded-xl p-6 text-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="info-icon text-3xl mb-2.5 text-green-600">✉️</div>
              <h3 className="text-lg font-semibold mb-1.5 text-green-800">
                Email Us
              </h3>
              <p className="text-base text-gray-500">
                krishnachaudhari0340@gmail.com
              </p>
            </div>
          </div>

          <div className="contact-form flex-[1.2] min-w-[320px] bg-white rounded-xl p-0 md:p-8 flex flex-col gap-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="form-group flex flex-col gap-1.5">
                <label
                  htmlFor="fullName"
                  className="font-medium text-gray-800 text-base"
                >
                  Full Name{" "}
                  <span className="required text-red-500 ml-1">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  required
                  className="form-input w-full p-3 border border-gray-300 rounded-lg text-base bg-gray-50 transition-all duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="font-medium text-gray-800 text-base"
                >
                  Email Address{" "}
                  <span className="required text-red-500 ml-1">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  required
                  className="form-input w-full p-3 border border-gray-300 rounded-lg text-base bg-gray-50 transition-all duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="font-medium text-gray-800 text-base"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  maxLength={15}
                  disabled={isLoading}
                  className="form-input w-full p-3 border border-gray-300 rounded-lg text-base bg-gray-50 transition-all duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label
                  htmlFor="message"
                  className="font-medium text-gray-800 text-base"
                >
                  Message <span className="required text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  rows={5}
                  disabled={isLoading}
                  required
                  className="form-textarea w-full p-3 border border-gray-300 rounded-lg text-base bg-gray-50 transition-all duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/30 min-h-[120px] resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="submit-btn bg-green-700 text-white w-full py-3.5 rounded-lg font-semibold text-base cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-green-800 hover:-translate-y-0.5 disabled:bg-green-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="spinner border-2 border-white/40 border-t-white rounded-full w-4 h-4 inline-block animate-spin"></span>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>

            {status && (
              <div
                className={`status mt-2 text-center text-base p-2.5 rounded-lg font-medium ${
                  status.includes("✓")
                    ? "success bg-green-100 text-green-800 border border-green-200"
                    : status.includes("Failed") || status.includes("error")
                    ? "error bg-red-100 text-red-800 border border-red-200"
                    : "info bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
