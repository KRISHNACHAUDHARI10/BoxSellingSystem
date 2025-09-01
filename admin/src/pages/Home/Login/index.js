import React, { useContext, useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import { Mycontext } from "../../../App";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo.jpg";
import background from "../../../assets/images/signupback.png";
import google from "../../../assets/images/google.png";
import { postData } from "../../../utils/api";
import { auth, googleProvider } from "../../../firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
  const [inputIndex, setInputIndex] = useState(null);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(Mycontext);
  const navigate = useNavigate();

  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    context.setisHideSliderAndHeader(true);
  }, []);

  const focusInput = (index) => setInputIndex(index);

  const changeInput = (e) => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value,
    });
  };

  const signIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formFields.email.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Email cannot be blank!",
      });
      setIsLoading(false);
      return;
    }

    if (!formFields.password.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Password cannot be blank!",
      });
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Changed from /api/users/signin to /api/admin/signin
      const res = await postData("/api/admin/signin", formFields);

      if (res.admin) {
        localStorage.setItem("token", res.token || "");

        // ✅ Store admin data with proper structure
        const adminData = {
          userName: res.admin.name || "",
          email: res.admin.email || "",
          userId: res.admin._id || "",
          isAdmin: true, // ✅ Always true for admin login
          images: res.admin.images || [],
          permissions: res.admin.permissions || [], // ✅ Store admin permissions
        };

        localStorage.setItem("user", JSON.stringify(adminData));
        context.setIsLogin(true);
        context.setUser(adminData);

        context.setAlertBox({
          open: true,
          error: false,
          msg: "Admin login successful!",
        });

        setIsLoading(false);
        // Redirect to admin dashboard
        navigate("/"); // or wherever your admin dashboard is located
      } else {
        setIsLoading(false);
        context.setAlertBox({
          open: true,
          error: true,
          msg: res.msg || "Login failed. Please check your credentials.",
        });
      }
    } catch (error) {
      setIsLoading(false);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Something went wrong! Please try again.",
      });
      console.error("Admin login error:", error);
    }
  };

  // ✅ Updated Google Authentication for Admin table
  const signInWithGoogle = () => {
    setIsLoading(true);
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        const fields = {
          name: user.displayName,
          email: user.email,
          images: user.photoURL,
          phone: user.phoneNumber || "",
        };

        // ✅ Changed to admin Google auth endpoint
        postData("/api/admin/authWithGoogle", fields).then((res) => {
          if (!res.error) {
            localStorage.setItem("token", res.token);

            // ✅ Store admin data consistently
            const adminData = {
              userName: res.admin?.name || user.displayName,
              email: res.admin?.email || user.email,
              userId: res.admin?.id || res.admin?._id,
              isAdmin: true, // ✅ Always true for admin
              images:
                res.admin?.images || (user.photoURL ? [user.photoURL] : []),
              permissions: res.admin?.permissions || [], // ✅ Store permissions
            };

            localStorage.setItem("user", JSON.stringify(adminData));
            context.setIsLogin(true);
            context.setUser(adminData);

            context.setAlertBox({
              open: true,
              error: false,
              msg: res.msg || "Google admin login successful!",
            });

            setTimeout(() => {
              setIsLoading(false);
              navigate("/"); // Redirect to admin dashboard
            }, 2000);
          } else {
            context.setAlertBox({
              open: true,
              error: true,
              msg: res.msg || "Google admin login failed!",
            });
            setIsLoading(false);
          }
        });
      })
      .catch((err) => {
        console.error("Google admin login error:", err);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Google admin login failed. Please try again.",
        });
        setIsLoading(false);
      });
  };

  return (
    <>
      <img src={background} className="Loginpattern" alt="background" />
      <section className="loginSection">
        <div className="loginBox">
          <div className="logo text-center">
            <img src={logo} width="64px" alt="logo" className="logo-icon" />
            <h4 className="font-weight-bold mt-2">Admin Login</h4>
            <p className="text-muted">
              Welcome back! Please login to admin panel.
            </p>
          </div>

          <div className="wrapper mt-3 card border">
            <form onSubmit={signIn}>
              {/* Email Input */}
              <div
                className={`form-group position-relative ${
                  inputIndex === 0 ? "focus" : ""
                }`}
              >
                <span className="icon">
                  <MdEmail />
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter Your Email"
                  name="email"
                  value={formFields.email}
                  onChange={changeInput}
                  onFocus={() => focusInput(0)}
                  onBlur={() => setInputIndex(null)}
                  autoFocus
                  required
                />
              </div>

              {/* Password Input */}
              <div
                className={`form-group mb-3 position-relative ${
                  inputIndex === 1 ? "focus" : ""
                }`}
              >
                <span className="icon">
                  <RiLockPasswordFill />
                </span>
                <input
                  type={isShowPassword ? "text" : "password"}
                  name="password"
                  value={formFields.password}
                  onChange={changeInput}
                  className="form-control"
                  placeholder="Enter Your Password"
                  onFocus={() => focusInput(1)}
                  onBlur={() => setInputIndex(null)}
                  required
                />
                <span
                  className="toggleShowPassword"
                  onClick={() => setIsShowPassword(!isShowPassword)}
                >
                  {isShowPassword ? <IoMdEyeOff /> : <IoMdEye />}
                </span>
              </div>

              {/* Submit Button */}
              <div className="form-group text-center">
                <button
                  type="submit"
                  className="btn-blue btn btn-primary btn-lg w-100 btn-big"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign In as Admin"
                  )}
                </button>
              </div>

              {/* Forgot Password & Google Login */}
              <div className="form-group text-center">
                <Link to={"/admin/forget-password"} className="link">
                  FORGOT PASSWORD?
                </Link>

                <div className="d-flex align-items-center justify-content-center or mt-3 mb-2">
                  <span className="line"></span>
                  <span className="txt">Or</span>
                  <span className="line"></span>
                </div>

                <Button
                  variant="outlined"
                  className="w-100 btn-lg loginwithgoogle btn-big"
                  onClick={signInWithGoogle}
                  disabled={isLoading}
                >
                  <img src={google} width="30px" alt="Google" /> &nbsp; Sign in
                  With Google as Admin
                </Button>
              </div>
            </form>

            {/* Register Link */}
            <div className="wrapper mt-2 card border footer text-center">
              <span>
                Don't have an admin account?
                <Link to={"/admin/signUp"} className="link color ms-1">
                  Register Here
                </Link>
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
