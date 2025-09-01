import React from "react";
import "./style.css";

const NotFound = () => {
  return (
    <section className="notFoundPage">
      <div className="notFoundContainer">
        <img
          src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXh5N3VxZWFhbnpjbWZsOGEyaXg2aHR2d3Jqam9ndGw0azZvbjNicyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gX3u0staej6wAnRlcP/giphy.gif"
          alt="404 Not Found"
          className="notFoundGif"
        />
        <h1>Oops! Page Not Found</h1>
        <p>The page you're looking for doesn't exist or was moved.</p>
        <a href="/" className="homeButton">
          Go Back Home
        </a>
      </div>
    </section>
  );
};

export default NotFound;
