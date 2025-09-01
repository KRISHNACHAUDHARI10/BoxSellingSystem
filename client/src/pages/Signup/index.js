import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../../src/App";
import googleIcon from "../../assets/images/googlereg.png";
import { postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import firebase from "../../firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account", // <-- This forces the Google account chooser
});
const auth = getAuth();

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const history = useNavigate();
  const context = useContext(MyContext);

  const handleChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formFields.name) {
      context.setAlertBox({ open: true, error: true, msg: "Name Blank" });
      return;
    }
    if (!formFields.email) {
      context.setAlertBox({ open: true, error: true, msg: "Email Blank" });
      return;
    }
    if (!formFields.phone) {
      context.setAlertBox({ open: true, error: true, msg: "Phone Blank" });
      return;
    }
    if (!formFields.password) {
      context.setAlertBox({ open: true, error: true, msg: "Password Blank" });
      return;
    }
    if (formFields.confirmPassword !== formFields.password) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Password and confirm password not match",
      });
      return;
    }

    context.setIsLoading(true);

    const payload = {
      name: formFields.name,
      email: formFields.email,
      phone: formFields.phone,
      password: formFields.password,
      isAdmin: false,
    };

    postData("/api/users/signup", payload)
      .then((res) => {
        if (!res.error) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: "Register Successfully",
          });
          setTimeout(() => {
            context.setIsLoading(false);
            history("/login");
          }, 2000);
        } else {
          context.setIsLoading(false);
        }
      })
      .catch((err) => {
        context.setIsLoading(false);
        console.error(err);
      });
  };

  const signInWithGoogle = () => {
    context.setIsLoading(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;

        // Create fields object without empty phone
        const fields = {
          name: user.displayName,
          email: user.email,
          password: "",
          images: user.photoURL,
          isAdmin: false,
        };

        // IMPORTANT: Only add phone if it exists and is not empty
        if (user.phoneNumber && user.phoneNumber.trim() !== "") {
          fields.phone = user.phoneNumber;
        }
        // Don't send phone field at all if it's empty

        console.log("Sending to API:", fields);

        postData("/api/users/authWithGoogle", fields)
          .then((res) => {
            if (!res.error) {
              localStorage.setItem("token", res.token);
              localStorage.setItem(
                "user",
                JSON.stringify({
                  name: res.user?.name,
                  email: res.user?.email,
                  userId: res.user?.id,
                })
              );

              context.setIsLoging(true);

              if (context.getCartData) {
                context.getCartData();
              }

              context.setAlertBox({ open: true, error: false, msg: res.msg });
              setTimeout(() => {
                context.setIsLoading(false);
                history("/");
              }, 2000);
            } else {
              context.setAlertBox({ open: true, error: true, msg: res.msg });
              context.setIsLoading(false);
            }
          })
          .catch((err) => {
            console.error("API Error:", err);
            context.setAlertBox({
              open: true,
              error: true,
              msg: "Failed to authenticate with server",
            });
            context.setIsLoading(false);
          });
      })
      .catch((err) => {
        console.error("Google Sign-in Error:", err);
        if (err.code === "auth/cancelled-popup-request") {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Sign-in was cancelled",
          });
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Google sign-in failed",
          });
        }
        context.setIsLoading(false);
      });
  };
  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-6 col-lg-5 shadow p-4 rounded bg-white">
        <h3 className="text-center mb-4">Register</h3>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              name="name"
              value={formFields.name}
              onChange={handleChange}
              required
            />
            <label>Full Name</label>
          </div>

          {/* Email */}
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email Address"
              name="email"
              value={formFields.email}
              onChange={handleChange}
              required
            />
            <label>Email Address</label>
          </div>

          {/* Phone */}
          <div className="form-floating mb-3">
            <input
              type="tel"
              className="form-control"
              placeholder="Phone Number"
              name="phone"
              value={formFields.phone}
              onChange={handleChange}
              required
            />
            <label>Phone Number</label>
          </div>

          {/* Password */}
          <div className="form-floating mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              name="password"
              value={formFields.password}
              onChange={handleChange}
              required
            />
            <label>Password</label>
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#555",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="form-floating mb-3 position-relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formFields.confirmPassword}
              onChange={handleChange}
              required
            />
            <label>Confirm Password</label>
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#555",
              }}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-success w-100 mt-4">
            {context.isLoading ? <CircularProgress /> : "Sign up"}
          </button>

          <p className="mt-3 text-center">
            Already have an account? <Link to="/login">Login</Link>
          </p>

          {/* Google login */}
          <div className="text-center mt-3">
            <p>Or</p>
            <button
              type="button"
              className="btn btn-outline-light border w-100 d-flex align-items-center justify-content-center"
              onClick={signInWithGoogle}
              style={{ gap: "10px" }}
            >
              <img src={googleIcon} alt="Google" style={{ height: "20px" }} />
              <p style={{ color: "black", margin: 0 }}>Continue with Google</p>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
