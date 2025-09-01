import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../../src/App"; // Make sure path is correct
import { postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import googleIcon from "../../assets/images/googlereg.png";
import firebase from "../../firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
const auth = getAuth();

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const context = useContext(MyContext);

  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
  });
  const history = useNavigate();
  const handleChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formFields.email) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Email is required",
        });
        return;
      }
      if (!formFields.password) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Password is required",
        });
        return;
      }

      setIsLoading(true);

      const payload = {
        email: formFields.email,
        password: formFields.password,
      };

      const res = await postData("/api/users/signin", payload);

      if (!res.error) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Login Successful!",
        });
        // Save token and user to localStorage
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        // Update context login state
        context.setIsLoging(true);

        // Get cart data after login
        if (context.getCartData) {
          context.getCartData();
        }

        setTimeout(() => navigate("/"), 1500);
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res.msg || "Login Failed",
        });
      }
    } catch (err) {
      context.setAlertBox({ open: true, error: true, msg: "Network Error" });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = () => {
    context.setIsLoading(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const fields = {
          name: user.displayName,
          email: user.email,
          password: "",
          images: user.photoURL,
          phone: user.phoneNumber || "",
          isAdmin: false,
        };

        postData("/api/users/authWithGoogle", fields).then((res) => {
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

            // Update context login state
            context.setIsLoging(true);

            // Get cart data after login
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
        });
      })
      .catch((err) => {
        console.error(err);
        context.setIsLoading(false);
      });
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-6 col-lg-5 shadow p-4 rounded bg-white">
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Email"
              value={formFields.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="email">Email Address</label>
          </div>

          {/* Password */}
          <div className="form-floating mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              id="password"
              name="password"
              placeholder="Password"
              value={formFields.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password">Password</label>
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

          {/* Submit */}
          <button type="submit" className="btn btn-success w-100 mt-4">
            {isLoading ? <CircularProgress size={24} /> : "Login"}
          </button>

          <p className="mt-3 text-center">
            Don't have an account? <Link to="/signup">Register</Link>
          </p>
          <div className="text-center mt-3">
            <p>Or </p>
            <button
              type="button"
              className="btn btn-outline-light border w-100 d-flex align-items-center justify-content-center"
              style={{ gap: "10px" }}
              onClick={signInWithGoogle}
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

export default LoginForm;
