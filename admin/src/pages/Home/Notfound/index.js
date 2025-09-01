import React, { useState, useEffect } from "react";

const NotFound = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);
  const [particles, setParticles] = useState([]);

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 6 + 2,
          speed: Math.random() * 0.3 + 0.1,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: particle.y > 105 ? -5 : particle.y + particle.speed,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const triggerGlitch = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 500);
  };

  const errorMessages = [
    "Oops! This page went on vacation! 🏖️",
    "404: Page is playing hide and seek! 🙈",
    "Lost in cyberspace! 🚀",
    "This page escaped to another dimension! 🌌",
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % errorMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <style jsx>{`
        .notFoundPage {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          overflow: hidden;
          position: relative;
        }

        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          pointer-events: none;
          animation: pulse 2s infinite;
        }

        .notFoundContainer {
          text-align: center;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 10;
          transition: transform 0.1s ease;
        }

        .error404 {
          font-size: 8rem;
          font-weight: bold;
          background: linear-gradient(
            45deg,
            #ff6b6b,
            #4ecdc4,
            #45b7d1,
            #96ceb4
          );
          background-size: 400% 400%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 3s ease-in-out infinite,
            float 6s ease-in-out infinite;
          margin-bottom: 20px;
          cursor: pointer;
          user-select: none;
          transition: transform 0.3s ease;
        }

        .error404.glitch {
          animation: glitch 0.3s infinite, gradientShift 3s ease-in-out infinite;
        }

        .error404:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .notFoundContainer h2 {
          font-size: 2rem;
          margin-bottom: 10px;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: all 0.5s ease;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notFoundContainer p {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .rocket {
          font-size: 6rem;
          cursor: pointer;
          transition: transform 0.3s ease;
          display: inline-block;
          margin: 20px 0;
          animation: rocket-float 4s ease-in-out infinite;
        }

        .rocket:hover {
          transform: scale(1.2) rotate(15deg);
          animation: rocket-spin 0.5s ease-in-out;
        }

        .buttonContainer {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
          margin-bottom: 20px;
        }

        .homeButton {
          text-decoration: none;
          color: #fff;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: bold;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .homeButton:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          background: linear-gradient(45deg, #4ecdc4, #ff6b6b);
        }

        .homeButton:active {
          transform: translateY(-1px) scale(1.02);
        }

        .tryAgainButton {
          text-decoration: none;
          color: #4ecdc4;
          background: transparent;
          padding: 15px 30px;
          border: 2px solid #4ecdc4;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: bold;
          transition: all 0.3s ease;
          cursor: pointer;
          display: inline-block;
        }

        .tryAgainButton:hover {
          background: #4ecdc4;
          color: #fff;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 25px rgba(78, 205, 196, 0.4);
        }

        .funFact {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin-top: 20px;
        }

        .floatingShape {
          position: absolute;
          pointer-events: none;
        }

        .shape1 {
          top: 20%;
          left: 10%;
          width: 80px;
          height: 80px;
          border: 3px solid rgba(255, 107, 107, 0.3);
          border-radius: 50%;
          animation: spin 10s linear infinite;
        }

        .shape2 {
          bottom: 20%;
          right: 10%;
          width: 60px;
          height: 60px;
          background: linear-gradient(
            45deg,
            rgba(78, 205, 196, 0.3),
            rgba(69, 183, 209, 0.3)
          );
          transform: rotate(45deg);
          animation: bounce 4s ease-in-out infinite;
        }

        .shape3 {
          top: 30%;
          right: 20%;
          width: 50px;
          height: 50px;
          border: 3px solid rgba(78, 205, 196, 0.4);
          transform: rotate(12deg);
          animation: pulse 3s ease-in-out infinite;
        }

        @media (min-width: 640px) {
          .buttonContainer {
            flex-direction: row;
          }
        }

        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }

        @keyframes rocket-float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }

        @keyframes rocket-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0px) rotate(45deg);
          }
          50% {
            transform: translateY(-20px) rotate(45deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1) rotate(12deg);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1) rotate(12deg);
          }
        }
      `}</style>

      <section className="notFoundPage">
        {/* Animated background particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: `translate(${mousePos.x * 15}px, ${
                mousePos.y * 15
              }px)`,
            }}
          />
        ))}

        {/* Floating shapes */}
        <div className="floatingShape shape1" />
        <div className="floatingShape shape2" />
        <div className="floatingShape shape3" />

        <div
          className="notFoundContainer"
          style={{
            transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`,
          }}
        >
          {/* Interactive 404 */}
          <h1
            className={`error404 ${glitchActive ? "glitch" : ""}`}
            onClick={triggerGlitch}
          >
            404
          </h1>

          {/* Rotating messages */}
          <h2>{errorMessages[currentMessage]}</h2>

          {/* Interactive rocket */}
          <div
            className="rocket"
            onClick={() => {
              triggerGlitch();
              setCurrentMessage(
                Math.floor(Math.random() * errorMessages.length)
              );
            }}
            style={{
              transform: `rotate(${mousePos.x * 3}deg)`,
            }}
          >
            🚀
          </div>

          <p>
            Looks like you've ventured into the cosmic void! Don't worry,
            <br />
            our space engineers are working to fix the navigation system.
          </p>

          {/* Interactive buttons */}
          <div className="buttonContainer">
            <a href="/" className="homeButton">
              🏠 Go Home
            </a>

            <button onClick={triggerGlitch} className="tryAgainButton">
              ⚡ Try Again
            </button>
          </div>

          {/* Fun fact */}
          <div className="funFact">
            <p>
              🎮 Fun Fact: Click the rocket ship or the 404 to trigger some
              space magic! ✨
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
