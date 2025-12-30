import React, { useState, type FormEvent } from "react";
import { useAuth } from "../../../context/Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Landmark, IdCard, Eye, EyeOff, Lock } from "lucide-react";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  // New state for password visibility toggle
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    try {
      // Passing email to login function
      const user = await login(email, password);

      if (user.role === 'admin' || user.role === 'developer') {
        navigate("/admin/dashboard");

      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-text-main antialiased selection:bg-primary selection:text-white">
      {/* Main Container */}
      <div className="relative w-full flex-1 flex flex-col group/design-root overflow-x-hidden">

        {/* Top Header Section (Green) */}
        <div className="relative w-full bg-primary h-[220px] pt-safe-top flex flex-col items-center rounded-b-[2rem] shadow-sm z-0">
          {/* Status Bar Simulation Spacer */}
          <div className="w-full h-6"></div>
        </div>

        {/* Floating Brand Icon */}
        <div className="absolute top-[172px] left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center justify-center w-24 h-24 bg-white dark:bg-background-dark rounded-full shadow-lg p-1">
            <div className="flex items-center justify-center w-full h-full bg-white dark:bg-zinc-800 rounded-full border border-gray-100 dark:border-zinc-700">
              <Landmark className="text-primary w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Login Card Section (Content) */}
        <div className="flex-1 flex flex-col items-center px-6 pt-20 pb-8 w-full max-w-md mx-auto z-0">

          {/* Headline */}
          <div className="text-center w-full mb-8">
            <h1 className="text-[#0c1d16] dark:text-white text-[32px] font-bold leading-tight tracking-tight">
              Secure Login
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-2">
              Welcome back, please sign in to continue
            </p>
            {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
          </div>

          {/* Login Form */}
          <form onSubmit={submit} className="w-full flex flex-col gap-6">

            {/* Employee ID Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0c1d16] dark:text-white text-base font-bold ml-1" htmlFor="employee-id">
                Employee ID
              </label>
              <div className="relative">
                <input
                  className="form-input flex w-full h-14 px-4 bg-white dark:bg-zinc-800 text-[#0c1d16] dark:text-white border-none rounded-lg focus:ring-2 focus:ring-primary focus:ring-opacity-50 placeholder:text-gray-400 text-base font-normal shadow-sm transition-all duration-200"
                  id="employee-id"
                  name="employee-id"
                  placeholder="staff@gmail.com" // Placeholder suggests email, but label says Employee ID. Keeping placeholder or generic.
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                  <IdCard className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0c1d16] dark:text-white text-base font-bold ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="form-input flex w-full h-14 px-4 bg-white dark:bg-zinc-800 text-[#0c1d16] dark:text-white border-none rounded-lg focus:ring-2 focus:ring-primary focus:ring-opacity-50 placeholder:text-gray-400 text-base font-normal shadow-sm transition-all duration-200 pr-12"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-gray-400 hover:text-primary transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Helper Links */}
            <div className="flex justify-between items-center px-1 mt-[-8px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input className="form-checkbox rounded text-primary border-gray-300 focus:ring-primary w-4 h-4" type="checkbox" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Remember me</span>
              </label>
              <a className="text-sm font-bold text-primary hover:text-primary-dark transition-colors" href="#">Forgot Password?</a>
            </div>

            {/* Submit Button */}
            <button
              className="mt-4 w-full h-14 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-lg font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              type="submit"
            >
              Secure Login
              <Lock className="w-5 h-5" />
            </button>
          </form>

          {/* Footer / Support */}
          <div className="mt-auto pt-12 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Having trouble? <a className="text-primary font-bold hover:underline" href="#">Contact Support</a>
            </p>
            <div className="mt-8 mb-4 h-1 w-32 bg-gray-200 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;