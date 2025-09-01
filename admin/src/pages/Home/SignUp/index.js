import React, { useContext, useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
import Button from "@mui/material/Button";
import { IoMdHome } from "react-icons/io";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { IoCall, IoShieldCheckmark } from "react-icons/io5";
import { Mycontext } from "../../../App";
import google from "../../../assets/images/google.png";
import logo from "../../../assets/images/logo.jpg";
import background from "../../../assets/images/signupback.png";
import { FaUserCircle } from "react-icons/fa";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { postData } from "../../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { auth, googleProvider } from "../../../firebase";
import { signInWithPopup } from "firebase/auth";

const SignUp = () => {
  const [inputIndex, setInputIndex] = useState(null);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(Mycontext);
  const navigate = useNavigate();

  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    context.setisHideSliderAndHeader(true);
    window.scrollTo(0, 0);
  }, []);

  const focusInput = (index) => {
    setInputIndex(index);
  };

  const changeInput = (e) => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value,
    });
  };

  const submitForm = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formFields.name.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Name cannot be blank!",
      });
      setIsLoading(false);
      return;
    }

    if (!formFields.email.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Email cannot be blank!",
      });
      setIsLoading(false);
      return;
    }

    if (!formFields.phone.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Phone cannot be blank!",
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

    if (formFields.confirmPassword !== formFields.password) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Password and confirm password do not match!",
      });
      setIsLoading(false);
      return;
    }

    const payload = {
      name: formFields.name,
      email: formFields.email,
      phone: formFields.phone,
      password: formFields.password,
    };

    // ✅ Changed from /api/users/signup to /api/admin/signup
    postData("/api/admin/signup", payload)
      .then((res) => {
        if (!res.error) {
          // Store admin token and data
          localStorage.setItem("token", res.token);

          const adminData = {
            userName: res.admin?.name,
            email: res.admin?.email,
            userId: res.admin?.id || res.admin?._id,
            isAdmin: true, // ✅ Set as admin
            images: res.admin?.images || [],
            permissions: res.admin?.permissions || [],
          };

          localStorage.setItem("user", JSON.stringify(adminData));
          context.setIsLogin(true);
          context.setUser(adminData);

          context.setAlertBox({
            open: true,
            error: false,
            msg: "Admin registration successful!",
          });

          setTimeout(() => {
            setIsLoading(false);
            // Redirect to admin dashboard instead of login
            navigate("/admin/dashboard"); // or wherever your admin dashboard is
          }, 2000);
        } else {
          setIsLoading(false);
          context.setAlertBox({
            open: true,
            error: true,
            msg: res.msg || "Registration failed!",
          });
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Admin signup error:", error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Something went wrong! Please try again.",
        });
      });
  };

  // ✅ Updated Google auth to use admin endpoint
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

            // Store admin data consistently
            const adminData = {
              userName: res.admin?.name || user.displayName,
              email: res.admin?.email || user.email,
              userId: res.admin?.id || res.admin?._id,
              isAdmin: true, // ✅ Set as admin
              images:
                res.admin?.images || (user.photoURL ? [user.photoURL] : []),
              permissions: res.admin?.permissions || [],
            };

            localStorage.setItem("user", JSON.stringify(adminData));
            context.setIsLogin(true);
            context.setUser(adminData);

            context.setAlertBox({
              open: true,
              error: false,
              msg: res.msg || "Google admin signup successful!",
            });

            setTimeout(() => {
              setIsLoading(false);
              navigate("/admin/dashboard"); // Redirect to admin dashboard
            }, 2000);
          } else {
            context.setAlertBox({
              open: true,
              error: true,
              msg: res.msg || "Google admin signup failed!",
            });
            setIsLoading(false);
          }
        });
      })
      .catch((err) => {
        console.error("Google admin signup error:", err);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Google admin signup failed. Please try again.",
        });
        setIsLoading(false);
      });
  };

  return (
    <>
      <img src={background} className="Loginpattern" alt="background" />
      <section className="loginSection signUpSection">
        <div className="row">
          <div className="col-md-8 align-items-center d-flex flex-column part1 justify-content-center">
            <h1>
              Our boxes are crafted for
              <span className="text-sky"> strength, durability,</span> and the
              smoothest moving experience
            </h1>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. It has been the industry's standard dummy text ever
              since the 1500s.
            </p>
            <div className="w-100 my-btnss">
              <Link to={"/"}>
                <Button className="btns btn-lg btn-big">
                  <IoMdHome /> Go to Home
                </Button>
              </Link>
            </div>
          </div>

          <div className="col-md-4 pr-0">
            <div className="loginBox singupbox">
              <div className="logo text-center">
                <img src={logo} width="70px" alt="logo" className="logo-icon" />
                <h4 className="font-weight-bold mt-2">
                  Register Admin Account
                </h4>
              </div>
              <div className="wrapper mt-3 card border">
                <form onSubmit={submitForm}>
                  {/* Name */}
                  <div
                    className={`form-group position-relative ${
                      inputIndex === 0 ? "focus" : ""
                    }`}
                  >
                    <span className="icon">
                      <FaUserCircle />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Your Name"
                      onFocus={() => focusInput(0)}
                      onBlur={() => setInputIndex(null)}
                      name="name"
                      value={formFields.name}
                      onChange={changeInput}
                      autoFocus
                      required
                    />
                  </div>

                  {/* Email */}
                  <div
                    className={`form-group position-relative ${
                      inputIndex === 1 ? "focus" : ""
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
                      onFocus={() => focusInput(1)}
                      onBlur={() => setInputIndex(null)}
                      onChange={changeInput}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div
                    className={`form-group position-relative ${
                      inputIndex === 2 ? "focus" : ""
                    }`}
                  >
                    <span className="icon">
                      <IoCall />
                    </span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter Your Phone"
                      name="phone"
                      value={formFields.phone}
                      onFocus={() => focusInput(2)}
                      onBlur={() => setInputIndex(null)}
                      onChange={changeInput}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div
                    className={`form-group mb-3 position-relative ${
                      inputIndex === 3 ? "focus" : ""
                    }`}
                  >
                    <span className="icon">
                      <RiLockPasswordFill />
                    </span>
                    <input
                      type={isShowPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter Password"
                      onFocus={() => focusInput(3)}
                      onBlur={() => setInputIndex(null)}
                      name="password"
                      value={formFields.password}
                      onChange={changeInput}
                      required
                    />
                    <span
                      className="toggleShowPassword"
                      onClick={() => setIsShowPassword(!isShowPassword)}
                    >
                      {isShowPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </span>
                  </div>

                  {/* Confirm Password */}
                  <div
                    className={`form-group mb-3 position-relative ${
                      inputIndex === 4 ? "focus" : ""
                    }`}
                  >
                    <span className="icon">
                      <IoShieldCheckmark />
                    </span>
                    <input
                      type={isShowConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm Your Password"
                      onFocus={() => focusInput(4)}
                      name="confirmPassword"
                      value={formFields.confirmPassword}
                      onBlur={() => setInputIndex(null)}
                      onChange={changeInput}
                      required
                    />
                    <span
                      className="toggleShowPassword"
                      onClick={() =>
                        setIsShowConfirmPassword(!isShowConfirmPassword)
                      }
                    >
                      {isShowConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </span>
                  </div>

                  <FormControlLabel
                    control={<Checkbox required />}
                    label="Agree to all Terms & Conditions"
                  />

                  <div className="form-group text-center">
                    <button
                      type="submit"
                      className="btn-blue btn btn-primary btn-lg w-100 btn-big"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Sign Up as Admin"
                      )}
                    </button>
                  </div>

                  <div className="form-group text-center">
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
                      <img src={google} width="30px" alt="google" /> &nbsp; Sign
                      Up With Google as Admin
                    </Button>
                  </div>
                </form>

                <div className="wrapper mt-2 card border footer text-center">
                  <span>
                    Already Have Account?
                    <Link to={"/admin/login"} className="link color ms-1">
                      Log in
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignUp;
